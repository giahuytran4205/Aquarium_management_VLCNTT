import { Plus } from "lucide-react";
import Button from "../components/Button";
import "./FeedingPage.css"
import Toggle from "../components/Toggle";

export default function FeedingPage() {
    const devices = Array.from({ length: 10 }, (_, k) => ({ name: "Device " + k, id: k }));
    const schedules = Array.from({ length: 5 }, (_, k) => ({ time: "10:00AM", on: k % 2 === 0 ? true : false }));

    function handleFeeding(e: React.MouseEvent) {

    }

    function handleAddSchedule(e: React.MouseEvent) {

    }

    return (
        <div className="feeding-page">
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
            }}>
                <span className="title">Select device</span>
                <select className="glassmorphism dropdown">
                    {devices.map((value, index) => 
                        <option key={index} value={value.id}>
                            {value.name}
                        </option>
                    )}
                </select>
            </div>
            <div className="first-part glassmorphism">
                <label className="amount-input">
                    <span className="title">Amount of foods</span>
                    <div>
                        <input type="number" />
                        <span className="unit">g</span>
                    </div>
                </label>
                <Button className="feeding-btn" onClick={handleFeeding}>Feed now</Button>
                <div>
                    <span>Number of feedings today</span>
                    <span>{10}</span>
                </div>
                <div>
                    <span>Last feeding</span>
                    <span>10:00AM</span>
                </div>
                <div>
                    <span>Amount of food dispensed today</span>
                    <span>100g</span>
                </div>
            </div>
            <div className="second-part glassmorphism">
                <span className="title">Feeding scheduling</span>
                <Button onClick={handleAddSchedule} className="add-btn">
                    <Plus size={16}/>
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