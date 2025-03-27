import { useNavigate } from "react-router-dom";
import CS from "../utils/mergeClasses";

export default function Button({
  innerText,
  link,
  className,
  icon,
  iconClassName,
  type,
  spanClassName,
  onClick,
}: {
  innerText?: string;
  link?: string;
  className?: string;
  icon?: string;
  iconClassName?: string;
  type?: "submit" | "reset" | "button";
  spanClassName?: string;
  onClick?: () => void;
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (link) {
      navigate(link);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={CS("px-4 py-3 rounded-xl", className)}
      type={type ?? "button"}
    >
      <span className={CS(spanClassName)}>{innerText}</span>{" "}
      {icon && <span className={CS(iconClassName)}>{icon}</span>}
    </button>
  );
}
