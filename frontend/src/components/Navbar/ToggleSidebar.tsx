import useLinkModals from "../../hooks/useLinkModals";
import Button from "../Button";
import PageHeading from "../PageHeading";
import Links from "./Links";

interface ToggleSidebarProps {
  toggleSidebar: () => void;
}

const ToggleSidebar: React.FC<ToggleSidebarProps> = ({ toggleSidebar }) => {
  const { links } = useLinkModals();

  return (
    <div
      className={`fixed top-0 right-0 w-72 break4:w-96 h-full bg-white text-black p-4 font-medium shadow-lg`}
    >
      <div className="p-3 flex justify-between items-center">
        <PageHeading input={"Kategorije"} className="text-xl break5:text-2xl" />
        <Button
          className={
            "material-symbols-outlined text-3xl hover:text-orange cursor-pointer"
          }
          onClick={toggleSidebar}
          innerText={"cancel"}
        />
      </div>
      <hr className="my-5" />

      <Links
        links={links}
        className={
          "flex flex-row text-lg px-5 py-3 w-full hover:text-orange hover:bg-orange-light transition-colors duration-300 text-[14px] break5:text-[18px]"
        }
      />
    </div>
  );
};

export default ToggleSidebar;
