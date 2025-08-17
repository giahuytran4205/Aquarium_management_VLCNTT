import { useEffect, useState } from "react";
import "./AquariumStatusPage.css"
import { getActionLog, getAquariumStatus, getSchedule, requestPump, type AquariumStatus, type LogEntry, type ScheduleEntry } from "../utils/api";
import { formatTime } from "../utils/format";
import Button from "../components/Button";

export default function AquariumStatusPage() {
    const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [status, setStatus] = useState<AquariumStatus>();

    function update() {
        getSchedule().then(setSchedule);
        getActionLog().then(setLogs);
        getAquariumStatus().then(setStatus);
    };
    useEffect(() => {
        const timer = setInterval(update, 1000);
        update();
        return () => clearInterval(timer);
    }, []);

    function handleTogglePump() {
        requestPump(!status?.pumpRunning);
    }

    return (
        <div className="aquarium-status-page">
            <div className="second-part glassmorphism">
                <div className="oxygen">
                    <p>Oxygen aeration</p>
                    <Button className="padding"
                        onClick={() => handleTogglePump()}>
                        {status?.pumpRunning ?
                            <span>Running</span> :
                            <span>Stopped</span>
                        }
                    </Button>
                </div>
                <div className="water-temp">
                    <p>Water temperature</p>
                    <p style={{ color: "rgba(32, 235, 253, 1)" }}>{status?.temperature} C</p>
                </div>
                <div className="feeding-status">
                    Feeding status
                    <table>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedule.map((value, _) =>
                                <tr key={formatTime(value.hour, value.minute)}>
                                    <td>{formatTime(value.hour, value.minute)}</td>
                                    <td>{value.amount}g</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="second-part glassmorphism">
                <table>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(({ timestamp, message }, _) =>
                            <tr key={timestamp.toLocaleString('en-US')}>
                                <td>{timestamp.toLocaleString('en-US')}</td>
                                <td>{message}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

    );
}
