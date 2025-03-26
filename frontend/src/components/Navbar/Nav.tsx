import PageHeading from "../PageHeading";
import Links from "./Links";
import useLinkModals from "../../hooks/useLinkModals";
import ToggleSidebar from "./ToggleSidebar";
import NavButtons from "./NavButtons";

const Nav = () => {
  const { isSidebarOpen, toggleSidebar, links } = useLinkModals();

  return (
    <nav className="py-5 flex justify-between items-center">
      <PageHeading
        input={"RENT&CO"}
        className="text-orange text-[30px] break5:text-[48px] pr-1"
      />

      <Links
        links={links}
        iconClassName="material-symbols-outlined"
        className={
          "hidden break12:flex items-center gap-2 transition-colors duration-300 hover:text-orange"
        }
        secondClassName={"flex gap-8"}
      />

      <NavButtons toggleSidebar={toggleSidebar} />

      {isSidebarOpen ? <ToggleSidebar toggleSidebar={toggleSidebar} /> : null}
    </nav>
  );
};

export default Nav;
