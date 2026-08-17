import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-6">
          <span className="text-6xl font-bold text-blue-600">404</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Página no encontrada
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Lo sentimos, la página que buscás no existe o fue movida.
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
