import PageHeading from "../PageHeading";
import Links from "./Links";
import useLinkModals from "../../hooks/useLinkModals";
import Button from "../Button";
import ToggleSidebar from "./ToggleSidebar";

const Nav = () => {
  const { isSidebarOpen, toggleSidebar, links } = useLinkModals();

  return (
    <nav className="py-5 flex justify-between items-center">
      <PageHeading input={"RENT&CO"} className="text-orange h2" />

      <Links links={links} iconClassName="material-symbols-outlined" />

      <div className="flex gap-4 items-center">
        <Button
          innerText={"Dodaj oglas"}
          className={"bg-orange px-4 py-3 rounded-xl flex items-center gap-2"}
          icon={"north_east"}
          iconClassName={"material-symbols-outlined text-base"}
        />
        <button
          className="material-symbols-outlined hover:cursor-pointer hover:text-orange"
          onClick={toggleSidebar}
        >
          menu
        </button>
      </div>

      {isSidebarOpen ? <ToggleSidebar toggleSidebar={toggleSidebar} /> : null}
    </nav>
  );
};

export default Nav;
