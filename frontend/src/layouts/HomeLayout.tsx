import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer/Footer';

export default function HomeLayout() {

    return (
        <div className='h-screen flex flex-col'>
            <Navbar />
            <Outlet />
            <Footer />
        </div>
    )

}