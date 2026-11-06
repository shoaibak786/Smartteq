import logo from "./assets/smartteq-logo.png";

/* Smartteq logo mark (design only). Used in sidebar, login and verify screen. */
export default function BrandLogo({ size = 46, className = "" }) {
    return (
        <span
            className={`sq-logo ${className}`}
            style={{ "--sq-logo-size": `${size}px`, "--sq-logo-url": `url(${logo})` }}
            aria-hidden="true"
        >
            <span className="sq-logo-halo" />
            <img src={logo} alt="" draggable="false" />
            <span className="sq-logo-sheen" />
        </span>
    );
}
