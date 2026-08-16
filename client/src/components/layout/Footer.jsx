import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary text-white py-4 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="mb-2">
          Desarrollado por{' '}
          <a 
            href="https://www.linkedin.com/in/pablo-federico-peralta/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-blue-200"
          >
            Pablo Peralta
          </a>
        </p>
        <p className="text-sm text-blue-200">
          &copy; {new Date().getFullYear()} Bibliotecas Populares Cordoba
        </p>
      </div>
    </footer>
  );
}
