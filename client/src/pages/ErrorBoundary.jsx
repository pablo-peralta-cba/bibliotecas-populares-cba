import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto py-16 text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-6">
              <span className="text-6xl font-bold text-red-600">!</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Algo salió mal
            </h1>
            <p className="text-gray-600 text-lg mb-4">
              Se produjo un error inesperado. Por favor, intentá de nuevo.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <details className="text-left bg-gray-100 rounded p-4 mb-6">
                <summary className="cursor-pointer font-medium text-gray-700">
                  Detalles del error (solo en desarrollo)
                </summary>
                <pre className="mt-2 text-sm text-red-600 whitespace-pre-wrap">
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
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

    return this.props.children;
  }
}
