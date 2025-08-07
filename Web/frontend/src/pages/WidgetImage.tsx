import { useEffect, useRef } from "react";

interface WidgetImageProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
    file?: Blob 
}

export default function WidgetImage({ file, ...rest }: WidgetImageProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const reader = new FileReader();
    reader.onload = () => {
        const img = new Image();
        img.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");
            if (!ctx || !canvas)
                return;

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                if (r >= 200 && g >= 200 && b >= 200) {
                    data[i] = 0;
                    data[i + 1] = 0;
                    data[i + 2] = 0;
                }
                else {
                    data[i] = 0;       // R
                    data[i + 1] = 255; // G
                    data[i + 2] = 255; // B
                }
            }

            ctx.putImageData(imageData, 0, 0);
        };
        if (reader.result)
            img.src = reader.result.toString();
    };

    if (file)
        reader.readAsDataURL(file);

    return (
        <canvas ref={canvasRef} style={{ border: "1px solid black" }} {...rest} />
    );
}
