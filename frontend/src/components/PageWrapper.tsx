import CS from "../utils/mergeClasses";

function PageWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={CS("flex h-full flex-col mx-auto w-full max-w-7xl", className)}
    >
      {children}
    </div>
  );
}

export default PageWrapper;
