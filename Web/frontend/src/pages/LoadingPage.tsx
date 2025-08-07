import Background from "../components/Background";
import LoaderCircle from "../components/LoaderCircle";
import "./LoadingPage.css"

export default function LoadingPage(props?: React.HTMLProps<HTMLElement>) {

    return (
        <div className="glassmorphism loading-page">
            <LoaderCircle />
            {props?.children}
        </div>
    );
}