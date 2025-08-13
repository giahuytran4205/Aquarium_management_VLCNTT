#include "scheduler.h"
#include <ctime>

static tm get_current_time() {
	time_t now = time(nullptr);
	struct tm timeinfo;
	localtime_r(&now, &timeinfo);
	return timeinfo;
}

void Scheduler::loop() {
    auto timeinfo = get_current_time();

    for (int i = 0; i < task_count; i++) {
        auto& task = tasks[i];
        if (timeinfo.tm_hour == task.hour && timeinfo.tm_min == task.minute &&
            timeinfo.tm_yday != task.previous_run_day) {
            task.action();
            task.previous_run_day = timeinfo.tm_yday;
        }
    }
}
void Scheduler::clear() {
    task_count = 0;
}
void Scheduler::add(int hour, int minute, Fun action) {
    tasks[task_count++] = {hour, minute, action};
}