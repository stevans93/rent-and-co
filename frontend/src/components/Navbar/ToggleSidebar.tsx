import useLinkModals from "../../hooks/useLinkModals";

const ToggleSidebar = ({ isSidebarOpen }) => {
  const { links } = useLinkModals();

  return (
    <>
      <div className="fixed inset-0 bg-black opacity-50 transition-opacity duration-500 hidden"></div>

      <div
        className={`fixed top-0 right-0 w-96 h-full bg-white text-black p-4 font-medium shadow-lg transform transition-transform duration-300 hidden`}
      >
        <div className="p-3 flex justify-between items-center">
          <span className="text-2xl">Kategorije</span>
          <span className="material-symbols-outlined text-3xl hover:text-orange cursor-pointer">
            cancel
          </span>
        </div>
        <hr className="my-5" />
        <ul>
          {links.map((link) => (
            <li key={link.id} className="my-2">
              <a
                href={link.path}
                className="block text-lg px-5 py-3 w-full hover:text-orange hover:bg-orange-light transition-colors duration-300"
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default ToggleSidebar;
