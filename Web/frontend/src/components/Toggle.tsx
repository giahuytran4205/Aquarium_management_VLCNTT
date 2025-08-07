import { useEffect, useRef, useState } from "react"
import "./Toggle.css"

export default function Toggle(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const ref = useRef<HTMLInputElement | null>(null);
    const [checked, setChecked] = useState(props.checked);

    function handleClick(e: React.MouseEvent) {
        ref.current?.click();
        setChecked(checked => !checked);
    }
    // 122053
    return (
        <div className="toggle">
            <input ref={ref} type="checkbox" {...props} />
            <div onClick={handleClick} style={{
                position: "relative",
                width: "40px",
                height: "20px",
                borderRadius: "20px",
                border: "2px solid white",
                backgroundColor: checked ? "#122053" : "rgba(195, 195, 195, 1)",
                padding: "3px",
                transition: "background-color 0.2s ease",
            }}>
                <div style={{
                    position: "absolute",
                    transform: `translateX(${checked ? 20 : 0}px)`,
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "white",
                    transition: "all 0.2s ease",
                }} />
            </div>
        </div>
    )
}