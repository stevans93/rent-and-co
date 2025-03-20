import { useState } from 'react';

export default function Navbar() {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

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
        <div className="bg-layout-dark text-white">
            <nav className="p-5 flex justify-between items-center max-w-screen-2xl mx-auto">
                <h1 className="text-orange text-4xl">RENT&CO</h1>

                <ul className="flex gap-8">
                    {categories.slice(0, 4).map(c => (
                        <li key={c.id} >
                            <a href="#" className="rounded-xl px-3 py-2 transition-colors duration-300 hover:bg-orange">
                                {c.name}
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="flex gap-4 items-center">
                    <a href="#favorites" className="flex items-center gap-2 transition-colors duration-300 hover:text-orange">
                        <span className="material-symbols-outlined">
                            favorite_border
                        </span>
                        Omiljeni
                    </a>


                    <a href="#login" className="flex items-center gap-2 transition-colors duration-300 hover:text-orange">
                        <span className="material-symbols-outlined">
                            account_circle
                        </span>
                        Uloguj se
                    </a>


                    <a href="#register" className="flex items-center gap-2 transition-colors duration-300 hover:text-orange">
                        <span className="material-symbols-outlined">
                            account_circle
                        </span>
                        Registruj se
                    </a>


                    <button className="bg-orange px-4 py-3 rounded-xl">Dodaj oglas &#8599;</button>
                    <span className="material-symbols-outlined hover:cursor-pointer hover:text-orange" onClick={toggleSidebar}>menu</span>
                </div>
            </nav>
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 transition-opacity duration-500"
                    onClick={toggleSidebar}
                ></div>
            )}
            {isSidebarOpen && (
                <div className={`fixed top-0 right-0 w-96 h-full bg-white text-black p-4 font-medium`}>
                    <div className='p-3 flex justify-between'>
                        <span className='text-2xl'>Kategorije</span>
                        <span className='material-symbols-outlined text-3xl  hover:text-orange cursor-pointer' onClick={toggleSidebar}>
                            cancel
                        </span>
                    </div>
                    <hr className='my-5' />
                    <ul>
                        {categories.map(c => (
                            <li key={c.id} className="my-2">
                                {/* Dodati liniju pomocu before */}
                                <a href="#" className="block text-lg px-5 py-5 w-full hover:text-orange hover:bg-orange-light transition-colors duration-300">
                                    {c.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>

    )
}