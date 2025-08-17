import { useState } from "react";
import Button from "../components/Button";
import "./CustomizeWidgetPage.css"
import WidgetImage from "./WidgetImage";
import { changeImage } from "../utils/api";

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

    async function handleChangeImage(e: React.MouseEvent<HTMLButtonElement>) {
        setFile(choosenFile);
        if (!choosenFile)
            return;
        
        let bitmap = await createImageBitmap(choosenFile);
        
        let canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        let ctx = canvas.getContext("2d");
        if (!ctx)
            return;

        let w, h;
        if (bitmap.width > bitmap.height) {
            w = Math.min(bitmap.width, 50);
            h = w / bitmap.width * bitmap.height;
        }
        else {
            h = Math.min(bitmap.height, 50);
            w = h / bitmap.height * bitmap.width;
        }

        ctx.drawImage(bitmap, 0, 0, w, h);
        
        let imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        const newWidth = Math.floor((bitmap.width + 7) / 8);
        const out =  new Uint8Array(newWidth * bitmap.height);

        for (let i = 0; i < bitmap.height; i++) {
            for (let j = 0; j < bitmap.width; j++) {
                const index = i * bitmap.width + j;
                let r = data[index * 4];
                let g = data[index * 4 + 1];
                let b = data[index * 4 + 2];
                let a = data[index * 4 + 3];
                
                let gray = (0.299 * r + 0.587 * g + 0.114 * b) | 0;
                
                let bit = (a > 128 && gray > 128) ? 1 : 0;
                
                out[i * newWidth + (j >> 3)] |= (bit << (j % 8));
            }
        }

        changeImage(out, w, h);
    }

    return (
        <div className="customize-widget-page">
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
                <Button onClick={handleChangeImage}>Accept</Button>
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