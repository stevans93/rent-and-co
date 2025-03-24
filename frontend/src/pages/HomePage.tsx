import { useState } from 'react';
import Button from '../components/Button';
import Filter from '../components/Home/Filter';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from "swiper/modules";
import 'swiper/css';
import 'swiper/css/pagination';

const categories: InterfaceTypes[] = [
    { id: 1, name: "Kategorija 1", resources: 22, slika: 'https://picsum.photos/id/1/280/400' },
    { id: 2, name: "Kategorija 2", resources: 22, slika: 'https://picsum.photos/id/2/280/400' },
    { id: 3, name: "Kategorija 3", resources: 22, slika: 'https://picsum.photos/id/3/280/400' },
    { id: 4, name: "Kategorija 4", resources: 22, slika: 'https://picsum.photos/id/4/280/400' },
    { id: 5, name: "Kategorija 5", resources: 22, slika: 'https://picsum.photos/id/5/280/400' },
    { id: 6, name: "Kategorija 6", resources: 22, slika: 'https://picsum.photos/id/6/280/400' },
    { id: 7, name: "Kategorija 7", resources: 22, slika: 'https://picsum.photos/id/7/280/400' },
    { id: 8, name: "Kategorija 8", resources: 22, slika: 'https://picsum.photos/id/8/280/400' }
];

const resources: ResourceTypes[] = [
    { id: 1, name: "Naziv resursa 1", address: "Adresa resursa 1", image: "https://picsum.photos/id/1/370/240", price: 14, special: true },
    { id: 2, name: "Naziv resursa 2", address: "Adresa resursa 2", image: "https://picsum.photos/id/2/370/240", price: 20 },
    { id: 3, name: "Naziv resursa 3", address: "Adresa resursa 3", image: "https://picsum.photos/id/3/370/240", price: 25, special: true },
    { id: 4, name: "Naziv resursa 4", address: "Adresa resursa 4", image: "https://picsum.photos/id/4/370/240", price: 30 },
    { id: 5, name: "Naziv resursa 5", address: "Adresa resursa 5", image: "https://picsum.photos/id/5/370/240", price: 18 },
    { id: 6, name: "Naziv resursa 6", address: "Adresa resursa 6", image: "https://picsum.photos/id/6/370/240", price: 22, special: true },
    { id: 7, name: "Naziv resursa 7", address: "Adresa resursa 7", image: "https://picsum.photos/id/7/370/240", price: 26 },
    { id: 8, name: "Naziv resursa 8", address: "Adresa resursa 8", image: "https://picsum.photos/id/8/370/240", price: 17 }
];


type ResourceTypes = {
    id: number,
    name: string,
    address: string,
    image: string,
    price: number,
    special?: boolean
}

type InterfaceTypes = {
    id: number;
    name: string;
    resources: number;
    slika: string;
};

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
                        <button type="button" onClick={ToggleFilters} className="flex gap-2 items-center p-2.5 ms-2 text-lg font-medium text-gray-900 rounded-lg border border-gray-900 hover:bg-orange hover:text-white hover:border-white">
                            <span className="material-symbols-outlined ">
                                tune
                            </span>
                            Filteri
                            <span className="sr-only">Filter</span>
                        </button>
                        <button type="submit" className="flex gap-2 items-center p-2.5 ms-2 text-lg font-medium text-white bg-orange rounded-lg border border-orange hover:bg-white hover:text-gray-900 hover:border-gray-900 hover:border">
                            <span className="material-symbols-outlined">
                                search
                            </span>
                            Pretraga
                            <span className="sr-only">Search</span>
                        </button>
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


            <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 mt-20 flex flex-col gap-5">
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                    <div className='flex flex-col gap-2'>
                        <span className='text-2xl font-bold'>Kategorije</span>
                        <span className='text-sm md:text-base text-gray-600'>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                        </span>
                    </div>
                    <span className='font-semibold text-sm md:text-base cursor-pointer hover:text-orange transition-colors'>
                        Pogledaj sve kategorije &#8599;
                    </span>
                </div>
                <div className="relative">
                    <Swiper
                        modules={[Navigation, Pagination]}
                        slidesPerView={4}
                        spaceBetween={20}
                        direction="horizontal"
                        grabCursor={true}
                        navigation={{
                            nextEl: '.swiper-button-next',
                            prevEl: '.swiper-button-prev',
                        }}
                        breakpoints={{
                            0: { slidesPerView: 1 },
                            520: { slidesPerView: 2 },
                            950: { slidesPerView: 3 },
                            1200: { slidesPerView: 4 }
                        }}
                    >
                        {categories.map(c => (
                            <SwiperSlide key={c.id}>
                                <div
                                    className="rounded-lg bg-cover bg-center w-full h-[400px] text-white"
                                    style={{ backgroundImage: `url(${c.slika})` }}
                                >
                                    {/* Zumiranje pozadine?? */}
                                    <div className='group w-full h-full bg-black bg-opacity-0 transition duration-300 hover:bg-opacity-30 p-6 flex flex-col justify-between'>
                                        <div className='flex flex-col gap-1 '>
                                            <h3 className="text-xl font-bold">{c.name}</h3>
                                            <p className="text-md">{c.resources} resursa</p>
                                        </div>
                                        <div className="opacity-0 transition duration-300 group-hover:opacity-100">
                                            <a href={`/detalji/${c.id}`} className=" text-white ">
                                                Pogledaj detaljnije &#8599;
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <button className="swiper-button-prev absolute top-1/2 -translate-y-1/2 -left-6 text-black bg-white transition duration-300 ease-in-out hover:bg-orange hover:text-white w-[50px] h-[50px] rounded-full flex justify-center items-center shadow-md hover:shadow-lg z-10">
                        <span className="material-symbols-outlined">arrow_back_ios</span>
                    </button>
                    <button className="swiper-button-next absolute top-1/2 -translate-y-1/2 -right-6 text-black bg-white transition duration-300 ease-in-out hover:bg-orange hover:text-white w-[50px] h-[50px] rounded-full flex justify-center items-center shadow-md hover:shadow-lg z-10">
                        <span className="material-symbols-outlined">arrow_forward_ios</span>
                    </button>
                </div>
            </div>


            <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 mt-20 flex flex-col gap-5 ">
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                    <div className='flex flex-col gap-2'>
                        <span className='text-2xl font-bold'>Izdvojeni resursi</span>
                        <span className='text-sm md:text-base text-gray-600'>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                        </span>
                    </div>
                    <span className='font-semibold text-sm md:text-base cursor-pointer hover:text-orange transition-colors'>
                        Pogledaj sve resurse &#8599;
                    </span>
                </div>
                <div className="relative">
                    <Swiper
                        modules={[Navigation, Pagination]}
                        slidesPerView={3}
                        spaceBetween={20}
                        direction="horizontal"
                        grabCursor={true}
                        pagination={{
                            clickable: true,
                            dynamicBullets: true,
                            el: '.swiperr-pagination',
                        }}
                        navigation={{
                            nextEl: '.swiperb-button-next',
                            prevEl: '.swiperb-button-prev',
                        }}
                        breakpoints={{
                            0: { slidesPerView: 1 },
                            520: { slidesPerView: 2 },
                            950: { slidesPerView: 3 }
                        }}
                    >
                        {resources.map(r => (
                            <SwiperSlide key={r.id}>
                                <div className='flex flex-col bg-lightest-gray rounded-xl h-[400px]'>
                                    <div
                                        className='w-full h-full bg-cover bg-center p-6 rounded-t-xl flex flex-col'
                                        style={{ backgroundImage: `url(${r.image})` }}>
                                        {r.special &&
                                            <div className='bg-orange text-white p-2 flex gap-1 items-center rounded-xl w-fit text-sm'>
                                                <span className="material-symbols-outlined">
                                                    bolt
                                                </span>
                                                <span className='font-semibold'>Izdvajamo</span>
                                            </div>
                                        }
                                        <div className='bg-white text-black p-2 items-center rounded-xl w-fit text-md font-semibold mt-auto'>
                                            €{r.price},00 dan
                                        </div>
                                    </div>
                                    <span className='font-semibold pl-5 pt-5'>{r.name}</span>
                                    <span className='pl-5 pb-5'>{r.address}</span>
                                    <hr />
                                    <div className='flex gap-2 pl-5 pt-5 pb-5'>
                                        <span className="material-symbols-outlined h-[30px] w-[30px] flex justify-center text-xl items-center bg-orange text-white rounded-full transition duration-300 hover:bg-white hover:text-orange">
                                            share
                                        </span>
                                        <span className="material-symbols-outlined  h-[30px] w-[30px] flex justify-center text-xl items-center bg-orange text-white rounded-full transition duration-300 hover:bg-white hover:text-orange">
                                            launch
                                        </span>
                                        <span className="material-symbols-outlined  h-[30px] w-[30px] flex justify-center text-xl items-center bg-orange text-white rounded-full transition duration-300 hover:bg-white hover:text-orange">
                                            favorite_border
                                        </span>
                                    </div>

                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <div className='mt-5 flex gap-5 justify-center items-center'>
                        <button className="swiperb-button-prev text-black bg-white transition duration-300 ease-in-out hover:bg-orange hover:text-white w-[50px] h-[50px] rounded-full flex justify-center items-center shadow-md hover:shadow-lg z-10">
                            <span className="material-symbols-outlined">arrow_back_ios</span>
                        </button>
                        <div className='swiperr-pagination h-fit w-fit !transform-none'></div>
                        <button className="swiperb-button-next text-black bg-white transition duration-300 ease-in-out hover:bg-orange hover:text-white w-[50px] h-[50px] rounded-full flex justify-center items-center shadow-md hover:shadow-lg z-10">
                            <span className="material-symbols-outlined">arrow_forward_ios</span>
                        </button>

                    </div>

                </div>
            </div>

            <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-16 py-16">
                <div className="bg-lightest-gray px-6 sm:px-12 md:px-16 lg:px-28 py-12 sm:py-16 md:py-20 lg:py-28 flex flex-col md:flex-row justify-between rounded-xl items-center gap-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl md:text-3xl font-semibold">What is Lorem Ipsum</h2>
                        <p className="text-sm md:text-base text-gray-600 mt-2">
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button link={"#"} innerText='Dodaj oglas &#8599;' className='border border-black px-6 py-3 rounded-lg hover:bg-orange hover:text-white hover:border-orange transition' />
                        <Button link={"#"} innerText='Postani partner' className='border border-black bg-black text-white px-6 py-3 rounded-lg hover:bg-orange hover:border-orange transition' />
                    </div>
                </div>
            </div>
        </div>
    )
}