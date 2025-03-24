import { useNavigate } from 'react-router-dom';

export default function Button({ innerText, link, className }: { innerText: string, link: string, className?: string }) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(link);
    }

    return (
        <button onClick={handleClick} className={`px-4 py-3 rounded-xl ${className}`}>{innerText}</button>
    )
}