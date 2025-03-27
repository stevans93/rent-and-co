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
  secondClassName,
}: {
  links: LinkItemProps[];
  className?: string;
  iconClassName?: string;
  secondClassName?: string;
}) => {
  return (
    <div className={CS("", secondClassName)}>
      {links.map((link) => (
        <Link key={link.id} to={link.path || "/"} className={CS("", className)}>
          {link.icon &&
            iconClassName?.includes("material-symbols-outlined") && (
              <span className={CS(iconClassName)}>{link.icon}</span>
            )}
          {link.name}
        </Link>
      ))}
    </div>
  );
};

export default Links;
