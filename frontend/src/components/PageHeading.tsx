import CS from "../utils/mergeClasses";

type PageHeadingProps = {
  input?: string;
  className?: string;
};
const PageHeading = ({ input, className }: PageHeadingProps) => {
  return (
    <div className={CS("", className)}>
      <p>{input}</p>
    </div>
  );
};

export default PageHeading;
