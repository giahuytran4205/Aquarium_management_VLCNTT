import React, { Children, forwardRef, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import "./Dialog.css"
import { createRoot, type Root } from "react-dom/client";

interface DialogProps extends React.HTMLProps<HTMLDivElement> {
    duration?: number;
}

function Dialog({ className, duration, hidden, ...rest }: DialogProps) {
    useRef<HTMLDivElement | null>(null);
    const [style, setStyle] = useState({ opacity: 0, blur: 10, scale: 0.8 });

    useEffect(() => {
        const startTO = setTimeout(() => {
            setStyle({ opacity: 1, blur: 0, scale: 1 });
        }, 0);
        let endTO: NodeJS.Timeout;
        if (duration)
            endTO = setTimeout(() => {
                setStyle({ opacity: 0, blur: 10, scale: 0.8 });
            }, duration);

        return () => {
            clearTimeout(startTO);
            clearTimeout(endTO);
        };
    }, [duration]);

    return (
        <div className="overlay" hidden={hidden}>
            <div className={"glassmorphism dialog " + (className || "")} {...rest}
                style={{
                    transition: "all 0.3s ease",
                    opacity: style.opacity,
                    filter: `blur(${style.blur}px)`,
                    transform: `translate(-50%, -50%) scale(${style.scale})`,
                    ...rest.style
                }}
            />
        </div>
    )
}

export default Dialog;

var element: HTMLDivElement;
var root: Root | undefined;
var removeNoti: (() => void) | null;

export function showNotification(props: DialogProps) {
    function Wrapper(props: DialogProps) {
        const [isRemove, setIsRemove] = useState(false);

        useEffect(() => {
            setIsRemove(false);
            removeNoti = () => {
                setIsRemove(true)
            };
            return () => {
                removeNoti = null;
            }
        }, []);

        return (
            <>
                <Dialog {...props} duration={isRemove ? 1 : props.duration } />
            </>
        )
    }

    if (!element) {
        element = document.createElement("div");
        element.style.position = "fixed";
        element.style.width = "0";
        element.style.height = "0";
        element.style.left = "0";
        element.style.top = "0";
        element.style.backgroundColor = "transparent";
        element.style.zIndex = "9999";
        document.body.appendChild(element);
    }

    if (!root)
        root = createRoot(element);

    root.render(
        <Wrapper {...props} />
    );
    
    if (props.duration)
        setTimeout(() => {
            root?.unmount();
            root = undefined;            
        }, props.duration + 300);
}

export function cancelNotification() {
    removeNoti?.();

    setTimeout(() => {
        root?.unmount();
        root = undefined;
    }, 300);
}