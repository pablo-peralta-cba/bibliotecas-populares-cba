import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const isVerified = user?.isVerified;

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'text-primary'
        : 'text-stone-300 hover:text-white'
    }`;

  return (
    <nav className="sticky top-0 z-50">
      <div className="mx-4 mt-4">
        <div className="flex items-center justify-between px-6 py-4 bg-surface-dark/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
          <Link to="/" className="text-xl font-bold text-white tracking-tight">
            Bibliotecas <span className="text-primary">Populares</span> Córdoba
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={navLinkClass}>
              Inicio
            </NavLink>

            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-stone-300 hover:text-white transition-colors duration-200">
                Bibliotecas
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-surface-dark/95 backdrop-blur-md rounded-xl border border-white/10 shadow-xl">
                <NavLink to="/bibliotecas" className="block px-4 py-3 text-sm text-stone-300 hover:text-white hover:bg-white/5 rounded-t-xl transition-colors">
                  Ver bibliotecas
                </NavLink>
                {isVerified && (
                  <NavLink to="/bibliotecas/nueva" className="block px-4 py-3 text-sm text-stone-300 hover:text-white hover:bg-white/5 transition-colors">
                    Agregar biblioteca
                  </NavLink>
                )}
                <NavLink to="/bibliotecas/que-es" className="block px-4 py-3 text-sm text-stone-300 hover:text-white hover:bg-white/5 transition-colors">
                  Qué es una biblioteca
                </NavLink>
                <NavLink to="/bibliotecas/requisitos" className="block px-4 py-3 text-sm text-stone-300 hover:text-white hover:bg-white/5 rounded-b-xl transition-colors">
                  Requisitos
                </NavLink>
              </div>
            </div>

            <NavLink to="/info/legislacion" className={navLinkClass}>
              Legislación
            </NavLink>

            <NavLink to="/libros" className={navLinkClass}>
              Libros
            </NavLink>

            <NavLink to="/contacto" className={navLinkClass}>
              Contacto
            </NavLink>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors duration-200"
              >
                Cerrar sesión
              </button>
            ) : (
              <>
                <NavLink to="/login" className="px-4 py-2 text-sm font-medium text-stone-300 hover:text-white transition-colors">
                  Iniciar sesión
                </NavLink>
                <NavLink to="/registro" className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors duration-200">
                  Registrarse
                </NavLink>
              </>
            )}
          </div>

          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden mx-4 mt-2 p-4 bg-surface-dark/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
            <div className="flex flex-col gap-1">
              <NavLink to="/" className={navLinkClass} onClick={() => setIsOpen(false)}>
                Inicio
              </NavLink>
              <NavLink to="/bibliotecas" className={navLinkClass} onClick={() => setIsOpen(false)}>
                Ver bibliotecas
              </NavLink>
              {isVerified && (
                <NavLink to="/bibliotecas/nueva" className={navLinkClass} onClick={() => setIsOpen(false)}>
                  Agregar biblioteca
                </NavLink>
              )}
              <NavLink to="/bibliotecas/que-es" className={navLinkClass} onClick={() => setIsOpen(false)}>
                Qué es una biblioteca
              </NavLink>
              <NavLink to="/bibliotecas/requisitos" className={navLinkClass} onClick={() => setIsOpen(false)}>
                Requisitos
              </NavLink>
              <NavLink to="/info/legislacion" className={navLinkClass} onClick={() => setIsOpen(false)}>
                Legislación
              </NavLink>
              <NavLink to="/libros" className={navLinkClass} onClick={() => setIsOpen(false)}>
                Libros
              </NavLink>
              <NavLink to="/contacto" className={navLinkClass} onClick={() => setIsOpen(false)}>
                Contacto
              </NavLink>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors"
                >
                  Cerrar sesión
                </button>
              ) : (
                <>
                  <NavLink to="/login" className="block text-center px-4 py-2 text-sm font-medium text-stone-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors" onClick={() => setIsOpen(false)}>
                    Iniciar sesión
                  </NavLink>
                  <NavLink to="/registro" className="block text-center px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors" onClick={() => setIsOpen(false)}>
                    Registrarse
                  </NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
