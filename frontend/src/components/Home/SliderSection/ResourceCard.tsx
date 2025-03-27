import Button from "../../Button";

export default function ResourceCard({
    data,
}: {
    data: {
        id: number,
        name: string,
        address: string,
        image: string,
        price: number,
        special?: boolean
    };
}) {
    return (
        <div className='flex flex-col bg-lightest-gray rounded-xl h-[400px]'>
            <div
                className='w-full h-full bg-cover bg-center p-6 rounded-t-xl flex flex-col'
                style={{ backgroundImage: `url(${data.image})` }}>
                {data.special &&
                    <div className='bg-orange text-white p-2 flex gap-1 items-center rounded-xl w-fit text-sm'>
                        <span className="material-symbols-outlined">
                            bolt
                        </span>
                        <span className='font-semibold'>Izdvajamo</span>
                    </div>
                }
                <div className='bg-white text-black p-2 items-center rounded-xl w-fit text-md font-semibold mt-auto'>
                    €{data.price},00 dan
                </div>
            </div>
            <span className='font-semibold pl-5 pt-5'>{data.name}</span>
            <span className='pl-5 pb-5'>{data.address}</span>
            <hr />
            <div className='flex gap-2 pl-5 pt-5 pb-5'>
                <Button icon="share" iconClassName="material-symbols-outlined" className="h-[40px] w-[40px] flex justify-center text-xl items-center bg-orange text-white rounded-full transition duration-300 hover:bg-white hover:text-orange" />
                <Button icon="launch" iconClassName="material-symbols-outlined" className="h-[40px] w-[40px] flex justify-center text-xl items-center bg-orange text-white rounded-full transition duration-300 hover:bg-white hover:text-orange" />
                <Button icon="favorite_border" iconClassName="material-symbols-outlined" className="h-[40px] w-[40px] flex justify-center text-xl items-center bg-orange text-white rounded-full transition duration-300 hover:bg-white hover:text-orange" />
            </div>
        </div>
    )
}