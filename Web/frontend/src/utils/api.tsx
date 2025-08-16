import { getAuth } from "@firebase/auth"

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
type AquariumHistory = {
    date: Date[];
    minTemp: number[];
    maxTemp: number[];
};
type FeedHistory = {
    date: Date[];
    amount: number[];
};
type AquariumOverview = {
    feedAmount: number;
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
    return await res.json();
}
async function getAquariumOverview(): Promise<AquariumOverview> {
    const res = await fetch('http://localhost:3000/api/device/today');
    return await res.json();
}

async function getActionLog(): Promise<LogEntry[]> {
    const res = await fetch('http://localhost:3000/api/logs');
    const data: { timestamp: string; message: string }[] = await res.json()
    return data.map(log => ({ ...log, timestamp: new Date(log.timestamp) }));
}
async function getAquariumHistory(limit: number): Promise<AquariumHistory> {
    const res = await fetch('http://localhost:3000/api/device/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit }),
    });
    const data = await res.json();
    data.date = data.date.map(str => new Date(str));
    return data;
}
async function getFeedHistory(limit: number): Promise<FeedHistory> {
    const res = await fetch('http://localhost:3000/api/device/feedhistory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit }),
    });
    const data = await res.json();
    data.date = data.date.map(str => new Date(str));
    return data;
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

export async function changeImage(image: Uint8Array, width: number, height: number) {
    const payload = JSON.stringify({ width, height, image })
    const size = new TextEncoder().encode(payload).length;
    console.log("Length: ", size);
    fetch('http://localhost:3000/api/device/change-image', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await getAuth().currentUser?.getIdToken()}`
        },
        body: JSON.stringify({ width, height, image: Array.from(image) })
    })
    .catch(console.error);
}

export {
    type ScheduleEntry, type LogEntry, type AquariumStatus, type AquariumHistory,
    type FeedHistory, type AquariumOverview,

    requestFeed, requestPump,
    getAquariumStatus, getAquariumHistory, getFeedHistory, getAquariumOverview,
    getActionLog, getSchedule, addSchedule, deleteSchedule
};
