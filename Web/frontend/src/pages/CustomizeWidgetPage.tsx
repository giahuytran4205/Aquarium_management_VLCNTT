import { useState } from "react";
import Button from "../components/Button";
import "./CustomizeWidgetPage.css"
import WidgetImage from "./WidgetImage";

export default function CustomizeWidgetPage() {
    const devices = Array.from({ length: 10 }, (_, k) => ({ name: "Device " + k, id: k }));
    const date = "8/2/2005";
    const weekDay = "Saturday"
    const waterTemp = 20;
    const oxygen = true;
    const nextFeeding = "12:00AM";
    const [file, setFile] = useState<Blob | undefined>();
    const [choosenFile, setChoosenFile] = useState<Blob | undefined>();

    function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        setChoosenFile(e.target.files?.[0]);
    }

    return (
        <div className="customize-widget-page">
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
            <div className="glassmorphism" style={{ gap: "10px" }}>
                <span>Customize image</span>
                <WidgetImage file={choosenFile} style={{
                    maxWidth: "60%",
                    alignSelf: "center",
                }} />
                <input type="file" onChange={handleImageUpload} style={{
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                    borderRadius: "20px",
                    padding: "5px 10px",
                    alignSelf: "center",

                }} />
                <Button onClick={() => setFile(choosenFile)}>Accept</Button>
            </div>
            <div className="glassmorphism">
                <span>Your widget</span>

                <div className="display">
                    <div className="date-time">
                        <span>{date}</span>
                        <span>{weekDay}</span>
                    </div>
                    <div className="hr" />
                    <div className="info-part" style={{
                        display: "flex",
                        flexDirection: "row",
                        height: "100%",
                    }}>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            flex: 1,
                        }}>
                            <div className="water-temp" style={{
                                display: "flex",
                                flexDirection: "column",
                                padding: "2px 5px",
                            }}>
                                <span style={{ fontSize: "10px" }}>WATER TEMP</span>
                                <span style={{ fontSize: "14px", textAlign: "center" }}>{waterTemp}</span>
                            </div>
                            <div className="hr" />
                            <div className="oxygen-aeration" style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "2px 5px",
                            }}>
                                <span style={{ fontSize: "10px" }}>OXYGEN</span>
                                <span style={{ fontSize: "10px" }}>{oxygen ? "RUNNING" : "OFF"}</span>
                            </div>
                            <div className="hr" />
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                padding: "2px 5px",
                            }}>
                                <span style={{ fontSize: "10px" }}>NEXT FEEDING</span>
                                <span style={{ fontSize: "14px", textAlign: "center" }}>{nextFeeding}</span>
                            </div>
                        </div>
                        <div className="vr" />
                        <div style={{
                            flex: 1,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}>
                            <WidgetImage file={file} style={{
                                maxWidth: "60%",
                                alignSelf: "center",
                            }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}