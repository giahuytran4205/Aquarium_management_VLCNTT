import { useEffect, useRef } from "react";
import "./Background.css";

export default function Background() {
    type Bubble = {
        el: HTMLDivElement;
        x: number;
        y: number;
        vx: number;
        vy: number;
        life: number;
    };

    const containerRef = useRef<HTMLDivElement>(null);
    const bubbles = useRef<Bubble[]>([]);

    useEffect(() => {
        let animationFrameId: number;

        function createBubble() {
            if (!containerRef.current) return;

            if (bubbles.current.length >= 6)
                return;

            const el = document.createElement('div');
            el.className = 'bubble';

            const size = Math.random() * 40 + 10;
            el.style.width = `${size}px`;
            el.style.height = `${size}px`;

            const bubble: Bubble = {
                el,
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + size,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -Math.random() * 2 - 0.5,
                life: 1
            };

            el.style.left = `${bubble.x}px`;
            el.style.top = `${bubble.y}px`;
            el.style.position = 'absolute';
            el.style.borderRadius = '50%';
            el.style.background = 'rgba(0, 0, 0, 0.1)';
            el.style.boxShadow = "inset 0px 0px 20px rgba(255, 255, 255, 0.2)";
            el.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            el.style.pointerEvents = 'none';

            containerRef.current.appendChild(el);
            bubbles.current.push(bubble);
        }

        function animate() {
            for (let i = bubbles.current.length - 1; i >= 0; i--) {
                const b = bubbles.current[i];
                b.x += b.vx;
                b.y += b.vy;
                b.vx += (Math.random() - 0.5) * 0.05;
                b.el.style.left = `${b.x}px`;
                b.el.style.top = `${b.y}px`;

                b.life -= 0.002;
                b.el.style.opacity = `${b.life}`;

                if (b.y + 20 < 0 || b.life <= 0) {
                    b.el.remove();
                    bubbles.current.splice(i, 1);
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        const intervalId = setInterval(createBubble, 500);
        animationFrameId = requestAnimationFrame(animate);

        return () => {
            clearInterval(intervalId);
            cancelAnimationFrame(animationFrameId);
            bubbles.current.forEach((b) => b.el.remove());
            bubbles.current = [];
        };
    }, []);

    return (
        <div
            className="background"
            ref={containerRef}
            style={{
                position: 'fixed',
                inset: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: -1
            }}
        />
    );
}