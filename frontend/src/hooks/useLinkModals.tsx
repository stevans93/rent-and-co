const useLinkModals = () => {
  const links = [
    { id: 1, name: "Pocetna", path: "/", icon: "" },
    { id: 2, name: "Pronađi oglas", path: "/findProduct", icon: "" },
    { id: 3, name: "O nama", path: "/about", icon: "" },
    { id: 4, name: "Kontakt", path: "/contact", icon: "" },
    { id: 5, name: "Omiljeni", path: "/favorite", icon: "favorite_border" },
    { id: 6, name: "Uloguj se", path: "/login", icon: "account_circle" },
    { id: 7, name: "Registruj se", path: "/register", icon: "account_circle" },
  ];

  return { links };
};

export default useLinkModals;
