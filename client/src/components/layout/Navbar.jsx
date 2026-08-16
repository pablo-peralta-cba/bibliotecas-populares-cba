import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <nav className="bg-primary text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <Link to="/" className="text-xl font-bold hover:text-blue-200">
            Bibliotecas Populares
          </Link>
          
          {/* Mobile menu button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/" className={({ isActive }) => isActive ? 'text-blue-200' : 'hover:text-blue-200'}>
              Inicio
            </NavLink>
            
            <div className="relative group">
              <button className="hover:text-blue-200 flex items-center">
                Bibliotecas
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute hidden group-hover:block bg-white text-gray-800 shadow-lg rounded mt-1 min-w-[200px]">
                <NavLink to="/bibliotecas" className="block px-4 py-2 hover:bg-gray-100">
                  Ver bibliotecas
                </NavLink>
                <NavLink to="/bibliotecas/nueva" className="block px-4 py-2 hover:bg-gray-100">
                  Agregar biblioteca
                </NavLink>
                <NavLink to="/bibliotecas/que-es" className="block px-4 py-2 hover:bg-gray-100">
                  Que es una biblioteca
                </NavLink>
                <NavLink to="/bibliotecas/requisitos" className="block px-4 py-2 hover:bg-gray-100">
                  Requisitos
                </NavLink>
              </div>
            </div>

            <NavLink to="/info/legislacion" className={({ isActive }) => isActive ? 'text-blue-200' : 'hover:text-blue-200'}>
              Legislacion
            </NavLink>
            
            <NavLink to="/libros" className={({ isActive }) => isActive ? 'text-blue-200' : 'hover:text-blue-200'}>
              Libros
            </NavLink>
            
            <NavLink to="/contacto" className={({ isActive }) => isActive ? 'text-blue-200' : 'hover:text-blue-200'}>
              Contacto
            </NavLink>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="bg-white text-primary px-4 py-2 rounded hover:bg-blue-100"
              >
                Logout
              </button>
            ) : (
              <>
                <NavLink to="/login" className={({ isActive }) => isActive ? 'text-blue-200' : 'hover:text-blue-200'}>
                  Login
                </NavLink>
                <NavLink to="/registro" className="bg-white text-primary px-4 py-2 rounded hover:bg-blue-100">
                  Registrate
                </NavLink>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <NavLink to="/" className="block py-2 hover:text-blue-200" onClick={() => setIsOpen(false)}>
              Inicio
            </NavLink>
            <NavLink to="/bibliotecas" className="block py-2 hover:text-blue-200" onClick={() => setIsOpen(false)}>
              Bibliotecas
            </NavLink>
            <NavLink to="/bibliotecas/nueva" className="block py-2 hover:text-blue-200" onClick={() => setIsOpen(false)}>
              Agregar biblioteca
            </NavLink>
            <NavLink to="/info/legislacion" className="block py-2 hover:text-blue-200" onClick={() => setIsOpen(false)}>
              Legislacion
            </NavLink>
            <NavLink to="/libros" className="block py-2 hover:text-blue-200" onClick={() => setIsOpen(false)}>
              Libros
            </NavLink>
            <NavLink to="/contacto" className="block py-2 hover:text-blue-200" onClick={() => setIsOpen(false)}>
              Contacto
            </NavLink>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2 hover:text-blue-200"
              >
                Logout
              </button>
            ) : (
              <>
                <NavLink to="/login" className="block py-2 hover:text-blue-200" onClick={() => setIsOpen(false)}>
                  Login
                </NavLink>
                <NavLink to="/registro" className="block py-2 hover:text-blue-200" onClick={() => setIsOpen(false)}>
                  Registrate
                </NavLink>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
