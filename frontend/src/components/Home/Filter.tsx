import { useState } from 'react';

export default function Filter({ ToggleFunction }: { ToggleFunction: () => void }) {

    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

    const categories: InterfaceTypes[] = [
        { id: 1, name: "Kategorija 1" },
        { id: 2, name: "Kategorija 2" },
        { id: 3, name: "Kategorija 3" },
        { id: 4, name: "Kategorija 4" },
        { id: 5, name: "Kategorija 5" },
        { id: 6, name: "Kategorija 6" },
        { id: 7, name: "Kategorija 7" },
        { id: 8, name: "Kategorija 8" }
    ];

    const locations: InterfaceTypes[] = [
        { id: 1, name: "Beograd" },
        { id: 2, name: "Novi Sad" },
        { id: 3, name: "Niš" },
        { id: 4, name: "Kragujevac" },
        { id: 5, name: "Beograd" },
        { id: 6, name: "Novi Sad" },
        { id: 7, name: "Niš" },
        { id: 8, name: "Kragujevac" },
    ];

    const options: InterfaceTypes[] = [
        { id: 1, name: "Besplatna dostava" },
        { id: 2, name: "Garancija" },
        { id: 3, name: "Novo" },
        { id: 4, name: "Polovno" },
        { id: 5, name: "Fiksna cena" },
        { id: 6, name: "Moguć dogovor" },
        { id: 7, name: "Licno preuzimanje" },
        { id: 8, name: "Placanje karticom" },
        { id: 9, name: "Placanje pri preuzimanju" },
        { id: 10, name: "Brza isporuka" },
        { id: 11, name: "Popust" },
        { id: 12, name: "Promo ponuda" },
    ];

    type InterfaceTypes = {
        id: number;
        name: string;
    };

    const toggleOption = (id: number) => {
        setSelectedOptions((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const resetFilters = () => {
        setPriceRange([0, 10000]);
        setCategory("");
        setLocation("");
        setSelectedOptions([]);
    };

    return (

        <div className="bg-white p-8 rounded-lg w-[650px]">
            <div className='p-3 flex justify-between'>
                <span className='text-2xl'>Filter</span>
                <span className='material-symbols-outlined text-3xl  hover:text-orange cursor-pointer' onClick={ToggleFunction}>
                    cancel
                </span>
            </div>
            <hr className='my-5' />
            <label className="block mb-3 font-semibold">Cena</label>
            <div className='flex gap-2 w-full mb-3'>
                <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange[0]}
                    onChange={(e) =>
                        setPriceRange([Number(e.target.value), priceRange[1]])
                    }
                    className='w-full'
                />
                <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange[1]}
                    onChange={(e) =>
                        setPriceRange([priceRange[0], Number(e.target.value)])
                    }
                    className='w-full'
                />
            </div>

            <div className="flex gap-2 w-full">
                <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) =>
                        setPriceRange([Number(e.target.value), priceRange[1]])
                    }
                    className='border border-gray-300 rounded-lg text-center p-2 text-lg w-full'
                />
                <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) =>
                        setPriceRange([priceRange[0], Number(e.target.value)])
                    }
                    className='border border-gray-300 rounded-lg text-center p-2 text-lg w-full'
                />
            </div>

            <label className="block mt-6 mb-3">Kategorija</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className='w-full border border-gray-300 rounded-lg p-2 text-lg'>
                <option value="" disabled>
                    Izaberite
                </option>
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                        {cat.name}
                    </option>
                ))}
            </select>

            <label className="block mt-6 mb-3">Lokacija</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)} className='w-full border border-gray-300 rounded-lg p-2 text-lg'>
                <option value="" disabled>
                    Izaberite
                </option>
                {locations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                        {loc.name}
                    </option>
                ))}
            </select>

            <label className="block mt-6 mb-3">Dodatne opcije</label>
            <div className="max-h-40 overflow-auto border p-2 rounded-lg">
                {options.map((option) => (
                    <div key={option.id} className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={selectedOptions.includes(option.id)}
                            onChange={() => toggleOption(option.id)}
                        />
                        {option.name}
                    </div>
                ))}
            </div>

            <div className="flex justify-between mt-4">
                <button onClick={resetFilters} className="border p-2 rounded">
                    Resetuj
                </button>
                <button onClick={ToggleFunction} className="p-2 bg-blue-500 text-white rounded">
                    Pretrazi
                </button>
            </div>
        </div>

    )
}