import { Link } from 'react-router-dom';

export default function EsperaVerificacion() {
  return (
    <div className="flex justify-center items-center my-16 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 text-blue-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Verificá tu correo electrónico
          </h2>
          <p className="text-gray-600 mb-6">
            Te enviamos un correo con un enlace de verificación. Por favor, revisá tu bandeja de entrada y hacé clic en el enlace para activar tu cuenta.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            ¿No recibiste el correo? Revisá tu carpeta de spam o junk.
          </p>
          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir a Login
          </Link>
        </div>
      </div>
    </div>
  );
}
