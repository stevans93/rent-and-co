import Button from "../Button";

const NavButtons = ({ toggleSidebar }: { toggleSidebar?: () => void }) => {
  return (
    <div className="flex gap-1 break5:gap-4 items-center">
      <Button
        innerText={"Dodaj oglas"}
        className={
          "bg-orange px-2 break5:px-4 py-3 break5:py-4 rounded-xl hidden break4:flex items-center gap-2"
        }
        icon={"north_east"}
        iconClassName={
          "material-symbols-outlined text-base text-[14px] break5:text-[18px]"
        }
        spanClassName={"text-[14px] break5:text-[18px]"}
      />

      <Button
        className={
          "material-symbols-outlined hover:cursor-pointer hover:text-orange"
        }
        innerText={"menu"}
        onClick={toggleSidebar}
      />
    </div>
  );
};

export default NavButtons;
