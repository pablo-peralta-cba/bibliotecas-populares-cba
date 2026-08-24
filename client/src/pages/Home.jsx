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
        <div className="home-nav">
          <nav className="home-nav-container flex justify-center items-center gap-6">
            <NavLink to="/bibliotecas" className={({ isActive }) => `home-nav-link${isActive ? ' active' : ''}`}>
              Bibliotecas
            </NavLink>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="home-nav-button">
                Cerrar sesión
              </button>
            ) : (
              <>
                <NavLink to="/login" className="home-nav-auth-link">
                  Iniciar sesión
                </NavLink>
                <NavLink to="/registro" className="home-nav-auth-btn">
                  Registrarse
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="px-4 flex-grow flex flex-col items-center justify-center">
        <h1 className="home-title mb-4">
          Bibliotecas Populares Córdoba
        </h1>
        <p className="home-subtitle mb-10">
          Descubrí el corazón cultural de tu comunidad.<br />
          Encontrá y contactate con todas las bibliotecas populares de la provincia de Córdoba.
        </p>
        <NavLink to="/bibliotecas" className="home-cta">
          Explorar bibliotecas
        </NavLink>
      </main>

      <footer className="home-footer py-6 mt-auto">
        <div className="flex flex-col items-center gap-2">
          <span>
            &copy; {new Date().getFullYear()} Bibliotecas Populares Córdoba
          </span>
          <span>
            Desarrollado con <span className="text-primary">♥</span> por{' '}
            <a
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
