import { useEffect, useState, useSyncExternalStore } from "react";
import { getAuth } from "firebase/auth";

const listeners = new Set()
let device: Device

interface Device {
    device_id: number;
    name: string;
    description: string;
}

export function setDevice(newDevice: Device) {
    device = newDevice
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function getUserDevice() {
    return useSyncExternalStore(subscribe, () => device);
}

export function getDevices() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [refetch, setRefetch] = useState(0);

    async function fetchDevices() {
        const res = await fetch('http://localhost:3000/api/devices', {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${await getAuth().currentUser?.getIdToken()}`,
            }
        })
        if (!res.ok)
            throw new Error("Unauthorized");

        return await res.json() as Device[];
    }

    useEffect(() => {
        fetchDevices().then(res => setDevices(res))
    }, [refetch]);
    
    return { devices, refetch: () => setRefetch(n => 1 - n) };
}

export async function addDevice(device: Device) {
    fetch('http://localhost:3000/api/device', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getAuth().currentUser?.getIdToken()}`,
        },
        body: JSON.stringify(device)
    })
    .catch(console.error);
}

export async function changeDeviceInfo(device: Device) {
    fetch('http://localhost:3000/api/device', {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getAuth().currentUser?.getIdToken()}`,
        },
        body: JSON.stringify(device)
    })
    .catch(console.error);
}

export async function deleteDevice(device_id: number) {
    fetch('http://localhost:3000/api/device', {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getAuth().currentUser?.getIdToken()}`,
        },
        body: JSON.stringify({ device_id: device_id })
    })
    .catch(console.error);
}

export async function getDeviceData(device_id: number) {
    let data;
    fetch('http://localhost:3000/api/device/data', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getAuth().currentUser?.getIdToken()}`,
        },
        body: JSON.stringify({ device_id: device_id })
    })
    .then(res => data = res.json())
    .catch(console.error);

    return data
}