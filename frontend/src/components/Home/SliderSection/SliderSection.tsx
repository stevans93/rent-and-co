import Button from "../../Button";
import Slider from "./Slider";
import SliderSectionSubtitle from "./SliderSectionSubtitle";
import SliderSectionTitle from "./SliderSectionTitle";
import 'swiper/css';
import 'swiper/css/pagination';

export default function SliderSection<T>(
    {
        title,
        subtitle,
        Card,
        cardData,
        slidesPerView,
        linkInnerText,
        linkLink,
        navButtonClasses,
        showPagination
    }
        :
        {
            title: string;
            subtitle: string;
            Card: React.FC<{ data: T }>;
            cardData: T[];
            slidesPerView: number;
            linkInnerText: string;
            linkLink: string;
            navButtonClasses: [string, string, string];
            showPagination: boolean;
        }
) {
    return (
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 mt-20 flex flex-col gap-5">
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                <div className='flex flex-col gap-2'>
                    <SliderSectionTitle title={title} />
                    <SliderSectionSubtitle subtitle={subtitle} />
                </div>
                <Button
                    className='font-semibold text-sm hover:text-orange transition-colors'
                    innerText={linkInnerText}
                    link={linkLink}
                    icon={"north_east"}
                    iconClassName={"material-symbols-outlined text-base"} />
            </div>
            <div className="relative">
                <Slider<T> Card={Card} slidesPerView={slidesPerView} data={cardData} navButtonClass={navButtonClasses[0]} showPagination={showPagination} />
                <div className='flex gap-5 justify-center items-center'>
                    <Button iconClassName="material-symbols-outlined" icon="arrow_back_ios" className={` ${"swiper-button-prev-" + navButtonClasses[0]}  ${navButtonClasses[1]} text-black bg-white transition duration-300 ease-in-out hover:bg-orange hover:text-white w-[50px] h-[50px] rounded-full flex justify-center items-center shadow-md hover:shadow-lg z-10`} />
                    {showPagination && <div className='swiper-paginationn mt-5 h-fit w-fit !transform-none'></div>}
                    <Button iconClassName="material-symbols-outlined" icon="arrow_forward_ios" className={`${"swiper-button-next-" + navButtonClasses[0]}  ${navButtonClasses[2]} text-black bg-white transition duration-300 ease-in-out hover:bg-orange hover:text-white w-[50px] h-[50px] rounded-full flex justify-center items-center shadow-md hover:shadow-lg z-10`} />
                </div>
            </div>
        </div>
    )
}