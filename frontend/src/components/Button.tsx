import { useNavigate } from "react-router-dom";
import CS from "../utils/mergeClasses";

export default function Button({
  innerText,
  link,
  className,
  icon,
  iconClassName,
  callbackFunction,
  type
}: {
  innerText?: string;
  link?: string;
  className?: string;
  icon?: string;
  iconClassName?: string;
  callbackFunction?: () => void;
  type?: "submit" | "reset" | "button";
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (link) {
      navigate(link);
    }
    else if (callbackFunction) {
      callbackFunction();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={CS("px-4 py-3 rounded-xl", className)}
      type={type ?? "button"}
    >
      {innerText} {icon && <span className={CS(iconClassName)}>{icon}</span>}
    </button>
  );
}
