import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface-dark text-white mt-auto">
      <div className="mx-4 mb-4 mt-8">
        <div className="px-8 py-10 bg-surface-dark/80 backdrop-blur-sm rounded-2xl border border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold mb-1">
                  Bibliotecas <span className="text-primary">Populares</span> Córdoba
                </h3>
                <p className="text-stone-400 text-sm">
                  Descubriendo el corazón de tu comunidad
                </p>
              </div>

              <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
                <Link to="/bibliotecas" className="text-stone-400 hover:text-primary transition-colors">
                  Bibliotecas
                </Link>
                <Link to="/libros" className="text-stone-400 hover:text-primary transition-colors">
                  Libros
                </Link>
                <Link to="/contacto" className="text-stone-400 hover:text-primary transition-colors">
                  Contacto
                </Link>
                <Link to="/info/legislacion" className="text-stone-400 hover:text-primary transition-colors">
                  Legislación
                </Link>
              </nav>

              <div className="text-center md:text-right">
                <p className="text-stone-400 text-sm">
                  Desarrollado con{' '}
                  <span className="text-primary">♥</span>{' '}
                  por{' '}
                  <a
                    href="https://www.linkedin.com/in/pablo-federico-peralta/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-300 hover:text-primary transition-colors"
                  >
                    Pablo Peralta
                  </a>
                </p>
                <p className="text-stone-500 text-xs mt-1">
                  &copy; {new Date().getFullYear()} Bibliotecas Populares Córdoba
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
