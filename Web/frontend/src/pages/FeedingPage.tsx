import { Plus } from "lucide-react";
import Button from "../components/Button";
import "./FeedingPage.css"
import Toggle from "../components/Toggle";
import { useEffect, useState } from "react";
import { type AquariumOverview, requestFeed, getAquariumOverview } from "../utils/api";

export default function FeedingPage() {
    const schedules = Array.from({ length: 5 }, (_, k) => ({ time: "10:00AM", on: k % 2 === 0 ? true : false }));
    const [feedAmount, setFeedAmount] = useState(10);
    const [overview, setOverview] = useState<AquariumOverview>();

    useEffect(() => {
        getAquariumOverview().then(setOverview);
    }, [])

    function handleFeeding(e: React.MouseEvent) {
        requestFeed(feedAmount)
            .then(() => console.log("Feed request sent successfully."))
            .catch(alert);
    }

    function handleAddSchedule(e: React.MouseEvent) {

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
                    <span>Last feeding</span>
                    <span>10:00AM</span>
                </div>
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
                    {schedules.map((value, index) =>
                        <div className="item" key={index}>
                            <span>{value.time}</span>
                            <Toggle />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
