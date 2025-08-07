import LoaderCircle from "./LoaderCircle";
import "./LoadingDialog.css"

export default function LoadingDialog(props: React.HTMLProps<HTMLElement>) {
    return (
        <div className="glassmorphism loading-dialog">
            <LoaderCircle />
            {props.children}
        </div>
    )
}