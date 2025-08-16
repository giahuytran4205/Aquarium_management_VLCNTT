import "./AnalysisPage.css";
import Stack from "@mui/material/Stack";
import { BarChart } from "@mui/x-charts";
import { LineChart, areaElementClasses } from "@mui/x-charts/LineChart";
import { useEffect, useState } from "react";
import { type AquariumHistory, getAquariumHistory, type FeedHistory, getFeedHistory } from "../utils/api";

export default function AnalysisPage() {
    const [dayLimit, setDayLimit] = useState(7);
    const [history, setHistory] = useState<AquariumHistory>();
    const [feedHistory, setFeedHistory] = useState<FeedHistory>();

    useEffect(() => {
        getAquariumHistory(dayLimit).then(setHistory);
        getFeedHistory(dayLimit).then(setFeedHistory);
    }, [dayLimit]);

    return (
        <div className="analysis-page">
            <div className="glassmorphism chart">
                <span className="title">Water temperature</span>
                <label className="amount-input">
                    <div>
                        <input type="number" value={dayLimit}
                            onChange={(e) => setDayLimit(Number(e.target.value))} />
                        <span className="unit"> days</span>
                    </div>
                </label>
                {history && history.date.length > 0 &&
                    <LineChart
                        xAxis={[{ scaleType: "time", data: history.date }]}
                        series={[
                            { data: history.maxTemp, label: "Max", color: "red" },
                            { data: history.minTemp, label: "Min", color: "cyan" }
                        ]}
                        yAxis={[{ width: 30 }]}
                        margin={{ left: 0, right: 10, bottom: 0 }}
                    />
                }
            </div>
            <div className="glassmorphism chart">
                <span className="title">Amount of foods per day</span>
                {feedHistory && feedHistory.date.length > 0 &&
                    <LineChart
                        xAxis={[{ scaleType: "time", data: feedHistory.date }]}
                        series={[
                            { data: feedHistory.amount, label: "Grams", color: "cyan" },
                        ]}
                        yAxis={[{ width: 30 }]}
                        margin={{ left: 0, right: 10, bottom: 0 }}
                    />
                }
            </div>
        </div>
    );
}
