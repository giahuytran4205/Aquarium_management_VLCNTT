import "./Button.css"

export default function Button({ className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button className={"button " + (className || "")} {...rest} />
    )
}