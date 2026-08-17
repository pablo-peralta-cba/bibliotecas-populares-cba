import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFlash } from '../context/FlashContext';
import { resendVerification } from '../api/auth';

export default function EsperaVerificacion() {
  const location = useLocation();
  const { showSuccess, showError } = useFlash();
  const [email, setEmail] = useState(location.state?.email || '');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email) {
      showError('Por favor, ingresá tu email');
      return;
    }
    setLoading(true);
    try {
      await resendVerification(email);
      setSent(true);
      showSuccess('Si el email está registrado, recibirás un correo de verificación.');
    } catch (err) {
      showError(err.error || 'Error al enviar el correo');
    } finally {
      setLoading(false);
    }
  };

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
          
          {!sent ? (
            <form onSubmit={handleResend} className="mb-6">
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Tu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Enviando...' : 'Reenviar correo de verificación'}
              </button>
            </form>
          ) : (
            <p className="text-green-600 mb-6">
              Correo enviado. Revisá tu bandeja de entrada.
            </p>
          )}

          <Link
            to="/login"
            className="inline-block bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Ir a Login
          </Link>
        </div>
      </div>
    </div>
  );
}
