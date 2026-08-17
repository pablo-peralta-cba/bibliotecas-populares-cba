import { Link, useSearchParams } from 'react-router-dom';

export default function ErrorPage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || '500';
  const message = searchParams.get('message') || 'Error interno del servidor';

  return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-6">
          <span className="text-6xl font-bold text-red-600">{code}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {code === '404' ? 'Página no encontrada' : 'Algo salió mal'}
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          {code === '404'
            ? 'Lo sentimos, la página que buscás no existe o fue movida.'
            : message}
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
