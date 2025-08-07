import type { CSSProperties } from "react";
import "./Input.css"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    labelStyle?: CSSProperties;
    labelPos?: "first" | "last";
    warning?: string;
}

export default function Input({ label, warning, labelStyle, labelPos = "first", ...rest }: InputProps) {
    return (
        <label className="input" style={labelStyle}>
            {labelPos === "first" && label}
            <input {...rest} />
            <p>{warning}</p>
            {labelPos === "last" && label}
        </label>
    )
}