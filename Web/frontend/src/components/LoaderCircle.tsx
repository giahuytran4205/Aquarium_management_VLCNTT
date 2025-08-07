import { useEffect, useState } from "react";
import "./LoaderCircle.css"

interface LoaderCircleProps extends React.SVGProps<SVGElement> {
    width?: number;
    height?: number;
}

export default function LoaderCircle({ width = 24, height = 24 }: LoaderCircleProps) {
    const [arc, setArc] = useState(0);
    const r = width / 2 - 2;
    const c = 2 * Math.PI * r;

    return (
        <svg width={width} height={height}>
            <circle
                className="loader-circle"
                cx={width / 2}
                cy={height / 2}
                r={r}
                fill="none"
                stroke="white"
                strokeWidth="2px"
                strokeDasharray={c/2}
                strokeDashoffset={`0`}
                strokeLinecap="round"
                data-perimeter={c}
                transform={`rotate(-90 ${width / 2} ${height / 2})`}
            >
                <animate
                    attributeName="stroke-dasharray"
                    values={`${c / 16} ${ 15 * c / 16 }; ${c / 2} ${c / 2}; ${c / 14} ${ 13 * c / 14 }; ${c / 16} ${ 15 * c / 16 }`}
                    dur="1s"
                    repeatCount="indefinite"
                    keyTimes="0; 0.4; 0.8; 1"
                />
                <animate
                    attributeName="stroke-dashoffset"
                    from={0} to={c}
                    dur="1s"
                    repeatCount="indefinite"
                    calcMode="spline"
                    keyTimes="0; 1"
                    keySplines="0 0 0.58 1"
                />
            </circle>
        </svg>
    )
}