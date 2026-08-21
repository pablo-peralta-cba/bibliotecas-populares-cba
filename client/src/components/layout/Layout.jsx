import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FlashMessages from './FlashMessages';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      <main className="flex-grow px-4 py-6">
        <FlashMessages />
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
