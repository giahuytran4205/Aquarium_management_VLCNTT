import { Scanner, useDevices, type IDetectedBarcode, type IScannerStyles } from "@yudiel/react-qr-scanner";
import { useState, type RefObject } from "react";
import "./HomePage.css"
import { Pencil, Plus, ScanQrCode, X } from "lucide-react";
import Button from "../components/Button";
import { getAuth } from "firebase/auth";

export default function HomePage() {
    const [isOpenScanner, setIsOpenScanner] = useState(false);
    const deviceList = Array.from({ length: 10 }, (_, k) => ({ name: "Device " + k, id: k }));
    const devices = useDevices();

    function handleClick(e: React.MouseEvent) {
        // if (!isOpenScanner) {
        //     navigator.mediaDevices.getUserMedia({ video: true })
        //         .then(value => {

        //         })
        //         .catch(reason => {
        //             setIsOpenScanner(false);
        //         });
        // }
        setIsOpenScanner(isOpen => !isOpen);
    }

    function handleScan(detectedCodes: IDetectedBarcode[]) {
        console.log(detectedCodes);
        setIsOpenScanner(false);
    }

    function handleError(error: unknown) {

    }

    async function handleAddDevice() {
        const body = {
            device_id: 15400511
        }

        const token = await getAuth().currentUser?.getIdToken();

        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });
    }

    function handleRemoveDevice(id: number) {

    }

    function handleRenameDevice(id: number) {

    }

    return (
        <div className="home-page">
            <div className="glassmorphism device">
                <span className="title">Your devices</span>
                <Button onClick={handleAddDevice} className="add-btn">
                    <Plus size={16}/>
                    <span>Add</span>
                </Button>
                <div className="device-list">
                    {deviceList.map((value, index) => 
                        <div key={index} className="item">
                            <span>{value.name}</span>
                            <button className="rename-btn" onClick={() => handleRenameDevice(value.id)}>
                                <Pencil className="rename icon" />
                            </button>
                            <button className="remove-btn" onClick={() => handleRemoveDevice(value.id)}>
                                <X className="remove icon" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* <div className="add-device-field">
                <p className="title">Scan QR code to add new device</p>
                <button className="scan-btn" onClick={handleClick}>
                    {isOpenScanner ? <X /> : <ScanQrCode />}
                    <p>{isOpenScanner ? "Close" : "Scan QR Code"}</p>
                </button>
                {<Scanner  styles={{
                    container: {
                        width: "70vmin",
                        aspectRatio: 1,
                        height: isOpenScanner ? "70vmin" : "0",
                        transition: "all 0.3s ease",
                    }
                }} onScan={handleScan} onError={handleError} paused={!isOpenScanner} />}
            </div> */}

        </div>
    );
}