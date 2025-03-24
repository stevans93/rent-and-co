import { useNavigate } from "react-router-dom";
import CS from "../utils/mergeClasses";

export default function Button({
  innerText,
  link,
  className,
  icon,
  iconClassName,
}: {
  innerText: string;
  link?: string;
  className?: string;
  icon?: string;
  iconClassName?: string;
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (link) {
      navigate(link);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={CS("px-4 py-3 rounded-xl", className)}
    >
      {innerText} {icon && <span className={CS(iconClassName)}>{icon}</span>}
    </button>
  );
}
