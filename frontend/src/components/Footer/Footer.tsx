import FooterSocialBadge from "./FooterSocialBadge"

export default function Footer() {

    const popular = [
        { id: 1, name: "Pretraga 1" },
        { id: 2, name: "Pretraga 2" },
        { id: 3, name: "Pretraga 3" },
        { id: 4, name: "Pretraga 4" },
        { id: 5, name: "Pretraga 5" },
        { id: 6, name: "Pretraga 6" },
        { id: 7, name: "Pretraga 7" },
        { id: 8, name: "Pretraga 8" }
    ]


    const categories = [
        { id: 1, name: "Pocetna" },
        { id: 2, name: "Kategorija 2" },
        { id: 3, name: "Kategorija 3" },
        { id: 4, name: "Kategorija 4" },
        { id: 5, name: "Kategorija 5" },
        { id: 6, name: "Kategorija 6" },
        { id: 7, name: "Kategorija 7" },
        { id: 8, name: "Kategorija 8" }]

    return (
        <div className="bg-layout-dark text-white ">
            <div className="p-5 flex flex-col gap-10 justify-between items-center max-w-screen-xl mx-auto">
                <div className="flex gap-16 w-full">
                    <div className="flex flex-col gap-8 min-w-max">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-orange text-4xl">RENT&CO</h1>
                            <div className="flex gap-3">
                                <div className="flex flex-col gap-2">
                                    <span className="text-ghost-white">Telefon</span>
                                    <span className="font-semibold">+(0) 123 050 945 02</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-ghost-white">Email</span>
                                    <span className="font-semibold">office@rentco.com</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="font-semibold">Aplikacije</span>
                            <div className="flex gap-3">
                                <div className="px-5 py-4 rounded-xl bg-layout-dark-lighter flex gap-5 items-center transition-colors duration-300 cursor-pointer hover:bg-orange w-60">
                                    <i className="fa-brands fa-apple text-4xl"></i>
                                    <div className="flex flex-col">
                                        <span>Download on the</span>
                                        <span className="font-semibold">Apple store</span>
                                    </div>
                                </div>
                                <div className="px-5 py-4 rounded-xl bg-layout-dark-lighter flex gap-5 items-center transition-colors duration-300 cursor-pointer hover:bg-orange w-60">
                                    <i className="fa-brands fa-google-play text-4xl"></i>
                                    <div className="flex flex-col">
                                        <span>Get it on</span>
                                        <span className="font-semibold">Google Play</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="font-semibold">Pratite nas na drustvenim mrezama</span>
                            <div className="flex gap-5">
                                <FooterSocialBadge link={"#"} icon={"fa-facebook"} />
                                <FooterSocialBadge link={"#"} icon={"fa-x-twitter"} />
                                <FooterSocialBadge link={"#"} icon={"fa-instagram"} />
                                <FooterSocialBadge link={"#"} icon={"fa-linkedin-in"} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8 flex-1">
                        <div className="flex flex-col gap-2">
                            <span className="font-semibold">Prijavite se na news letter</span>
                            <div className="flex h-16 text-xl text-ghost-white">
                                <input
                                    className="input w-full bg-layout-dark-lighter text-ghost-white px-3 py-1 rounded-l-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-1 focus:ring-offset-orange transition-all duration-150 ease-in-out"
                                    name="text"
                                    type="text"
                                    placeholder="Email"
                                />
                                <button
                                    className="text-ghost-white px-3 py-1 rounded-r-lg border-y border-r border-r-white/10 border-y-white/10 hover:bg-orange hover:text-white transition-all duration-150 easy-in-out">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <div className="flex flex-col gap-6">
                                <span className="font-semibold">Popularne pretrage</span>
                                <div className="flex flex-col gap-3">
                                    {popular.slice(0, 4).map(p => (
                                        <a key={p.id} href="#" className="text-ghost-white hover:underline hover:text-white">
                                            {p.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-6">
                                <span className="font-semibold">Korisni linkovi</span>
                                <div className="flex flex-col gap-3">
                                    <a href="#" className="hover:underline text-ghost-white hover:text-white">Terms of Use</a>
                                    <a href="#" className="hover:underline text-ghost-white hover:text-white">Privacy Policy</a>
                                    <a href="#" className="hover:underline text-ghost-white hover:text-white">Cenovnik</a>
                                    <a href="#" className="hover:underline text-ghost-white hover:text-white">Usluge</a>
                                    <a href="#" className="hover:underline text-ghost-white hover:text-white">Podrska</a>
                                    <a href="#" className="hover:underline text-ghost-white hover:text-white">Karijera</a>
                                    <a href="#" className="hover:underline text-ghost-white hover:text-white">FAQs</a>
                                </div>
                            </div>
                            <div className="flex flex-col gap-6">
                                <span className="font-semibold">Popularne kategorije</span>
                                <div className="flex flex-col gap-3">
                                    {categories.slice(0, 4).map(p => (
                                        <a key={p.id} href="#" className="hover:underline text-ghost-white hover:text-white">
                                            {p.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="text-white w-full" />

                <div className="flex justify-between w-full mb-4">
                    <span>© Rent&Co - All Rights Reserved</span>
                    <span>
                        <a href="#" className="transition-colors duration-300 hover:text-orange"> Privacy </a>
                        &#8226;
                        <a href="#" className="transition-colors duration-300 hover:text-orange"> Terms </a>
                        &#8226;
                        <a href="#" className="transition-colors duration-300 hover:text-orange"> Sitemap </a>
                    </span>
                </div>

            </div>
        </div>
    )

}