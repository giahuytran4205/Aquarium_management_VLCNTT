import "./AnalysisPage.css";
import Stack from "@mui/material/Stack";
import { BarChart } from "@mui/x-charts";
import { LineChart, areaElementClasses } from "@mui/x-charts/LineChart";

export default function AnalysisPage() {
    const devices = Array.from({ length: 10 }, (_, k) => ({ name: "Device " + k, id: k }));
    const maxTemps = [28, 27, 30, 26, 25];
    const minTemps = [26, 24, 25, 24, 22];
    const foods = [8, 7, 10, 12, 9];

    return (
        <div className="analysis-page">
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
            <div className="glassmorphism chart">
                <span className="title">Water temperature</span>
                <LineChart
                    series={[
                        { data: maxTemps, label: "Max temp", color: "red" },
                        { data: minTemps, label: "Min temp", color: "cyan" }
                    ]}
                    yAxis={[{ width: 30 }]}
                    margin={{ left: 0, right: 10, bottom: 0 }}
                >
                </LineChart>
            </div>
            <div className="glassmorphism chart">
                <span className="title">Amount of foods per day</span>
                <BarChart
                    series={[
                        { data: foods, label: "Food", color: "cyan" }
                    ]}
                    barLabel="value"
                    yAxis={[{ width: 30 }]}
                    margin={{ left: 0, right: 10, bottom: 0 }}
                >
                </BarChart>
            </div>
        </div>
    );
}