import { Plus } from "lucide-react";
import Button from "../components/Button";
import "./FeedingPage.css"
import Toggle from "../components/Toggle";
import { useEffect, useState } from "react";
import { type AquariumOverview, requestFeed, getAquariumOverview, type ScheduleEntry, getSchedule, deleteSchedule, addSchedule } from "../utils/api";
import { formatTime } from "../utils/format";

export default function FeedingPage() {
    const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
    const [feedAmount, setFeedAmount] = useState(10);
    const [overview, setOverview] = useState<AquariumOverview>();

    function update() {
        getSchedule().then(setSchedule);
        getAquariumOverview().then(setOverview);
    };
    useEffect(() => {
        const timer = setInterval(update, 1000);
        update();
        return () => clearInterval(timer);
    }, []);

    function handleFeeding(e: React.MouseEvent) {
        requestFeed(feedAmount)
            .then(() => console.log("Feed request sent successfully."))
            .catch(alert);
    }

    function handleAddSchedule(e: React.MouseEvent) {
        let hour = Number(prompt("Enter hour:"));
        let minute = Number(prompt("Enter minute:"));
        let amount = Number(prompt("Enter amount (grams):"));

        if (isNaN(hour) || isNaN(minute) || isNaN(amount))
            return;
        addSchedule({ hour, minute, amount });
    }

    function handleRemoveSchedule(item: ScheduleEntry) {
        deleteSchedule(item);
    }



    return (
        <div className="feeding-page">
            <div className="first-part glassmorphism">
                <label className="amount-input">
                    <span className="title">Amount of food</span>
                    <div>
                        <input type="number" value={feedAmount}
                            onChange={(e) => setFeedAmount(Number(e.target.value))} />
                        <span className="unit">g</span>
                    </div>
                </label>
                <Button className="feeding-btn" onClick={handleFeeding}>Feed now</Button>
                <div>
                    <span>Amount of food dispensed today</span>
                    <span>{overview?.feedAmount}g</span>
                </div>
            </div>
            <div className="second-part glassmorphism">
                <span className="title">Feeding scheduling</span>
                <Button onClick={handleAddSchedule} className="add-btn">
                    <Plus size={16} />
                    <span>Add</span>
                </Button>
                <div className="schedules">
                    {schedule.map((value, index) =>
                        <div className="item" key={index}>
                            <span>{formatTime(value.hour, value.minute)}</span>
                            <Toggle checked={true} onClick={() => handleRemoveSchedule(value)} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
