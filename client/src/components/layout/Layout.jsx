import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FlashMessages from './FlashMessages';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto mt-4 flex-grow px-4">
        <FlashMessages />
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
