import { useState } from 'react';
import Button from '../components/Button';
import Filter from '../components/Home/Filter';
import CategoryCard from '../components/Home/SliderSection/CategoryCard';
import ResourceCard from '../components/Home/SliderSection/ResourceCard';
import SliderSection from '../components/Home/SliderSection/SliderSection';

const categories: CategoryDataTypes[] = [
    { id: 1, name: "Kategorija 1", resources: 22, slika: 'https://picsum.photos/id/1/280/400' },
    { id: 2, name: "Kategorija 2", resources: 22, slika: 'https://picsum.photos/id/2/280/400' },
    { id: 3, name: "Kategorija 3", resources: 22, slika: 'https://picsum.photos/id/3/280/400' },
    { id: 4, name: "Kategorija 4", resources: 22, slika: 'https://picsum.photos/id/4/280/400' },
    { id: 5, name: "Kategorija 5", resources: 22, slika: 'https://picsum.photos/id/5/280/400' },
    { id: 6, name: "Kategorija 6", resources: 22, slika: 'https://picsum.photos/id/6/280/400' },
    { id: 7, name: "Kategorija 7", resources: 22, slika: 'https://picsum.photos/id/7/280/400' },
    { id: 8, name: "Kategorija 8", resources: 22, slika: 'https://picsum.photos/id/8/280/400' }
];

type CategoryDataTypes = {
    id: number;
    name: string;
    resources: number;
    slika: string;
};

const resources: ResourceDataTypes[] = [
    { id: 1, name: "Naziv resursa 1", address: "Adresa resursa 1", image: "https://picsum.photos/id/1/370/240", price: 14, special: true },
    { id: 2, name: "Naziv resursa 2", address: "Adresa resursa 2", image: "https://picsum.photos/id/2/370/240", price: 20 },
    { id: 3, name: "Naziv resursa 3", address: "Adresa resursa 3", image: "https://picsum.photos/id/3/370/240", price: 25, special: true },
    { id: 4, name: "Naziv resursa 4", address: "Adresa resursa 4", image: "https://picsum.photos/id/4/370/240", price: 30 },
    { id: 5, name: "Naziv resursa 5", address: "Adresa resursa 5", image: "https://picsum.photos/id/5/370/240", price: 18 },
    { id: 6, name: "Naziv resursa 6", address: "Adresa resursa 6", image: "https://picsum.photos/id/6/370/240", price: 22, special: true },
    { id: 7, name: "Naziv resursa 7", address: "Adresa resursa 7", image: "https://picsum.photos/id/7/370/240", price: 26 },
    { id: 8, name: "Naziv resursa 8", address: "Adresa resursa 8", image: "https://picsum.photos/id/8/370/240", price: 17 }
];


type ResourceDataTypes = {
    id: number,
    name: string,
    address: string,
    image: string,
    price: number,
    special?: boolean
}



export default function HomePage() {

    const [isOpen, setIsOpen] = useState(false);

    const ToggleFilters = () => {
        setIsOpen(!isOpen);
    }

    return (
        <div className="flex-1">
            <div className="flex flex-col gap-16 justify-center items-center content-center bg-hero-image bg-cover bg-center bg-no-repeat h-[760px]">
                <div className="flex flex-col text-center text-white">
                    <h5 className="h5">What is Lorem Ipsum</h5>
                    <h1 className="h1 font-semibold">What is Lorem Ipsum</h1>
                    <h5 className="h5">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</h5>
                </div>
                <div className="px-6 py-5 bg-white rounded-xl w-full max-w-4xl">
                    <form className="flex items-center max-w-full">
                        <label htmlFor="search" className="sr-only">Pretraga</label>
                        <div className="relative w-full ">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <span className="material-symbols-outlined">
                                    home
                                </span>
                            </div>
                            <input type="text" id="search" className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg w-full ps-10 p-2.5" placeholder="Pretrazi proizvode ili usluge..." required />
                        </div>
                        <Button type="button" innerText='Filteri' callbackFunction={ToggleFilters} className='flex gap-2 items-center ms-2 text-lg font-medium text-gray-900 border border-gray-900 hover:bg-orange hover:text-white hover:border-white' iconClassName='material-symbols-outlined' icon='tune' />
                        <Button type="submit" innerText='Pretraga' className='flex gap-2 items-center ms-2 text-lg font-medium text-white bg-orange border border-orange hover:bg-white hover:text-gray-900 hover:border-gray-900 hover:border' icon='search' iconClassName='material-symbols-outlined' />
                    </form>

                    {isOpen &&
                        // PROBATI: izdvojiti overlay u posebnu komponentu, pa onda pomocu useefecta kada se izrenderuje, animira se prelaz pozadine u crnije
                        //neka funkcija koja bi proveravala da li postoje filteri pre slanja zahteva na bek za pretragu?
                        <div className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50`}>
                            <Filter ToggleFunction={ToggleFilters} />
                        </div>
                    }
                </div>
            </div>


            <SliderSection<CategoryDataTypes>
                title="Kategorije"
                subtitle='Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
                linkInnerText="Pogledaj sve kategorije"
                linkLink="#"
                Card={CategoryCard}
                cardData={categories}
                slidesPerView={4}
                //prvi string je unique obelezje da bi se povezali dugmici sa slajderom, a druga dva su posebni stilovi za dugmice
                navButtonClasses={["cat", "cat-left-nav", "cat-right-nav"]}
                showPagination={false}
            />

            <SliderSection<ResourceDataTypes>
                title="Izdvojeni resursi"
                subtitle='Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
                linkInnerText="Pogledaj sve resurse"
                linkLink="#"
                Card={ResourceCard}
                cardData={resources}
                slidesPerView={3}
                navButtonClasses={["res", "res-left-nav", "res-right-nav"]}
                showPagination={true}

            />

            <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-16 py-16">
                <div className="bg-lightest-gray px-6 sm:px-12 md:px-16 lg:px-28 py-12 sm:py-16 md:py-20 lg:py-28 flex flex-col md:flex-row justify-between rounded-xl items-center gap-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl md:text-3xl font-semibold">What is Lorem Ipsum</h2>
                        <p className="text-sm md:text-base text-gray-600 mt-2">
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button link={"#"} innerText='Dodaj oglas' iconClassName='material-symbols-outlined text-base' icon='north_east' className='border border-black px-6 py-3 rounded-lg hover:bg-orange hover:text-white hover:border-orange transition' />
                        <Button link={"#"} innerText='Postani partner' className='border border-black bg-black text-white px-6 py-3 rounded-lg hover:bg-orange hover:border-orange transition' />
                    </div>
                </div>
            </div>
        </div>
    )
}