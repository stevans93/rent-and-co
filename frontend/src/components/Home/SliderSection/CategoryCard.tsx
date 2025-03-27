import Button from "../../Button";

export default function CategoryCard({
    data,
}: {
    data: {
        id: number;
        name: string;
        resources: number;
        slika: string;
    };
}) {
    return (
        <div
            className="rounded-lg bg-cover bg-center w-full h-[400px] text-white"
            style={{ backgroundImage: `url(${data.slika})` }}
        >
            {/* Zumiranje pozadine?? */}
            <div className='group w-full h-full bg-black bg-opacity-0 transition duration-300 hover:bg-opacity-30 p-6 flex flex-col justify-between'>
                <div className='flex flex-col gap-1 '>
                    <h3 className="text-xl font-bold">{data.name}</h3>
                    <p className="text-md">{data.resources} resursa</p>
                </div>
                <div className="opacity-0 transition duration-300 group-hover:opacity-100">
                    <Button innerText="Pogledaj detaljnije" className="text-white" icon={"north_east"}
                        iconClassName={"material-symbols-outlined text-base"} link={`/detalji/${data.id}`} />
                </div>
            </div>
        </div>
    )
}