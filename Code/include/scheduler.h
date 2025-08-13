class Scheduler {
private:
    using Fun = void (*)();
	struct Task {
		int hour, minute;
		Fun action;
		// we run only if the day value changed
		int previous_run_day = -1;
	};
	Task tasks[16];
	int task_count = 0;

public:
	void loop();
	void clear();
	void add(int hour, int minute, Fun action);
};

// Scheduler sched;
// sched.add(12, 0, void function)
// void loop() { sched.loop(); }