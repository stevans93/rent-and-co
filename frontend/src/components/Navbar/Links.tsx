import { Link } from "react-router-dom";
import CS from "../../utils/mergeClasses";

type LinkItemProps = {
  id?: number;
  name?: string;
  path?: string;
  icon?: string;
};

const Links = ({
  links,
  className,
  iconClassName,
}: {
  links: LinkItemProps[];
  className?: string;
  iconClassName?: string;
}) => {
  return (
    <div className="flex gap-8">
      {links.map((link) => (
        <Link
          key={link.id}
          to={link.path || "/"}
          className={CS(
            "flex items-center gap-2 transition-colors duration-300 hover:text-orange",
            className
          )}
        >
          {link.icon && <span className={CS(iconClassName)}>{link.icon}</span>}
          {link.name}
        </Link>
      ))}
    </div>
  );
};

export default Links;
