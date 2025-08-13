import { Scanner, useDevices, type IDetectedBarcode, type IScannerStyles } from "@yudiel/react-qr-scanner";
import { useState, type RefObject } from "react";
import "./HomePage.css"
import { Pencil, Plus, ScanQrCode, X } from "lucide-react";
import Button from "../components/Button";
import { getAuth } from "firebase/auth";
import { addDevice, changeDeviceInfo, deleteDevice, getDevices } from "../hooks/devices";
import Dialog from "../components/Dialog";
import Input from "../components/Input";
import { flushSync } from "react-dom";

export default function HomePage() {
    const [isOpenScanner, setIsOpenScanner] = useState(false);
    const { devices, refetch } = getDevices();
    const [isOpenDialog, setIsOpenDialog] = useState(false);
    const [editingDevice, setEditingDevice] = useState<number | undefined>(undefined);
    const [newDeviceName, setNewDeviceName] = useState('');
    const [deviceDescription, setDeviceDescription] = useState('');

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

    async function handleScan(detectedCodes: IDetectedBarcode[]) {
        console.log(detectedCodes);
        for (const code of detectedCodes) {
            if (code.rawValue.startsWith("AquariumDevice:")) {
                const device_id = parseInt(code.rawValue.substring("AquariumDevice:".length));
                await addDevice({ device_id: device_id, name: device_id.toString(), description: '' });
                setIsOpenScanner(false);
            }
        }
    }

    function handleError(error: unknown) {

    }

    async function handleAddDevice() {
        setIsOpenScanner(true);
    }

    function handleRemoveDevice(id: number) {
        deleteDevice(id);
        refetch();
    }

    function handleRenameDevice(id: number) {
        setEditingDevice(id);
        setIsOpenDialog(true);
        setNewDeviceName(devices.find(value => value.device_id === id)?.name || '');
        setDeviceDescription(devices.find(value => value.device_id === id)?.description || '');
    }

    async function changeDeviceInformation(id: number, name: string, description: string) {
        await changeDeviceInfo({ device_id: id, name: name, description: description });
        refetch();
    }

    return (
        <div className="home-page">
            <Dialog hidden={!isOpenDialog} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                <label>
                    Device name
                    <Input type="text" value={newDeviceName} onChange={e => setNewDeviceName(e.target.value)} style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white'
                    }}/>
                </label>
                <label>
                    Device description
                    <Input type="text" value={deviceDescription} onChange={e => setDeviceDescription(e.target.value)} style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white'
                    }}/>
                </label>
                <div style={{
                    display: 'flex',
                    gap: '10px',
                }}>
                    <Button style={{
                        backgroundColor: 'red',
                        padding: '10px 20px',
                        lineHeight: 0,
                    }}
                        onClick={() => {
                            setNewDeviceName('');
                            setIsOpenDialog(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button style={{
                        backgroundColor: 'green',
                        padding: '10px 20px',
                        lineHeight: 0,
                    }}
                        onClick={e => {
                            if (editingDevice)
                                changeDeviceInformation(editingDevice, newDeviceName, deviceDescription);

                            setIsOpenDialog(false);
                        }}
                    >
                        Change
                    </Button>
                </div>
            </Dialog>
            <div className="glassmorphism device">
                <span className="title">Your devices</span>
                <Button onClick={handleAddDevice} className="add-btn">
                    <Plus size={16}/>
                    <span>Add</span>
                </Button>
                <div className="device-list">
                    {devices.map((value, index) => 
                        <div key={index} className="item">
                            <span>{value.name}</span>
                            <button className="rename-btn" onClick={() => handleRenameDevice(value.device_id)}>
                                <Pencil className="rename icon" />
                            </button>
                            <button className="remove-btn" onClick={() => handleRemoveDevice(value.device_id)}>
                                <X className="remove icon" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <Dialog hidden={!isOpenScanner} className="add-device-field" style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(0, 0, 0, 0.7)'
            }}>
                <p className="title" style={{ color: 'white' }}>Scan QR code to add new device</p>
                <button className="scan-btn glassmorphism" onClick={handleClick}>
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
            </Dialog>

        </div>
    );
}