import { useState } from "react";
import "./AquariumStatusPage.css"

export default function AquariumStatusPage() {
    const [time, setTime] = useState("12:00AM");
    const [date, setDate] = useState("31/7/2025");
    const [temp, setTemp] = useState("25 C");

    const feedingSchedules = Array.from({ length: 5 }, (_, k) => ({ time: "12:00AM", amount: k }));

    return (
        <div className="aquarium-status-page">
            <div className="first-part glassmorphism">
                <div className="time">
                    {time}
                </div>
                <div className="temp-date">
                    <div className="temp">
                        {temp}
                    </div>
                    <div className="date">
                        {date}
                    </div>
                </div>
            </div>
            <div className="second-part glassmorphism">
                <div className="oxygen">
                    <p>Oxygen aeration</p>
                    <p style={{ color: "rgba(49, 251, 82, 1)" }}>Running</p>
                </div>
                <div className="water-temp">
                    <p>Water temperature</p>
                    <p style={{ color: "rgba(32, 235, 253, 1)" }}>25 C</p>
                </div>
                <div className="feeding-status">
                    Feeding status
                    <table>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feedingSchedules.map((value, index) => 
                                <tr key={index}>
                                    <td>{value.time}</td>
                                    <td>{value.amount}</td>
                                    <td><input type="checkbox" /></td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}