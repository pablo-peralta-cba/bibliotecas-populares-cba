import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../../styles/home.css';

export default function Home() {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Bibliotecas Populares Córdoba",
      "url": window.location.origin,
      "description": "Encontrá y contactate con todas las bibliotecas populares de la provincia de Córdoba. Accedé a variados catálogos de libros.",
      "sameAs": []
    });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  return (
    <div className="home-cover flex flex-col text-center text-white">
      <header className="mb-auto">
        <div>
          <nav className="home-nav flex justify-center gap-6">
            <NavLink to="/" className={({ isActive }) => `home-nav-link${isActive ? ' active' : ''}`} end>
              Home
            </NavLink>
            <NavLink to="/bibliotecas" className={({ isActive }) => `home-nav-link${isActive ? ' active' : ''}`}>
              Bibliotecas
            </NavLink>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="home-nav-link home-nav-button">
                Logout
              </button>
            ) : (
              <>
                <NavLink to="/login" className={({ isActive }) => `home-nav-link${isActive ? ' active' : ''}`}>
                  Login
                </NavLink>
                <NavLink to="/registro" className={({ isActive }) => `home-nav-link${isActive ? ' active' : ''}`}>
                  Registrate
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="px-3 flex-grow flex flex-col items-center justify-center">
        <h1 className="home-title mb-4">
          Bibliotecas Populares Córdoba
        </h1>
        <p className="home-subtitle mb-8">
          Encontrá y contactate con todas las bibliotecas populares de la
          provincia<br />
          Accedé a variados catálogos de libros
        </p>
        <NavLink to="/bibliotecas" className="home-cta">
          Ver bibliotecas
        </NavLink>
      </main>

      <footer className="home-footer py-3 mt-auto">
        <div className="flex flex-col items-center">
          <span className="text-white">
            &copy; Bibliotecas Populares Córdoba — {new Date().getFullYear()}
          </span>
          <span className="text-white mt-1">
            Desarrollado con ♥ por{' '}
            <a
              className="text-dark hover:underline"
              href="https://www.linkedin.com/in/pablo-federico-peralta/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pablo Peralta
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
