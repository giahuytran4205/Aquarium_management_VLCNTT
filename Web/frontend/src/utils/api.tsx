type ScheduleEntry = {
    hour: number;
    minute: number;
    amount: number;
};
type LogEntry = {
    timestamp: Date;
    message: string;
};
type AquariumStatus = {
    pumpRunning: boolean
    temperature: number
};

async function requestFeed(grams: number): Promise<boolean> {
    const res = await fetch('http://localhost:3000/api/device/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: grams }),
    });
    return res.ok;
}
async function requestPump(on: boolean): Promise<boolean> {
    const res = await fetch('http://localhost:3000/api/device/pump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ on }),
    });
    return res.ok;
}

async function getAquariumStatus(): Promise<AquariumStatus> {
    const res = await fetch('http://localhost:3000/api/device/current');
    return await res.json()
}

async function getActionLog(): Promise<LogEntry[]> {
    const res = await fetch('http://localhost:3000/api/logs');
    const data: { timestamp: string; message: string }[] = await res.json()
    return data.map(log => ({ ...log, timestamp: new Date(log.timestamp) }));
}

async function getSchedule(): Promise<ScheduleEntry[]> {
    const res = await fetch('http://localhost:3000/api/device/schedule');
    return await res.json()
}
async function addSchedule(entry: ScheduleEntry): Promise<boolean> {
    const res = await fetch('http://localhost:3000/api/device/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
    });
    return res.ok;
}
async function deleteSchedule(entry: ScheduleEntry): Promise<boolean> {
    const res = await fetch('http://localhost:3000/api/device/schedule', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
    });
    return res.ok;
}

export {
    type ScheduleEntry, type LogEntry, type AquariumStatus,

    requestFeed, requestPump,
    getAquariumStatus,
    getActionLog, getSchedule, addSchedule, deleteSchedule
};
