import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiGet, apiDelete } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useFlash } from '../context/FlashContext';

export default function LibroShow() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useFlash();
  const navigate = useNavigate();
  const [libro, setLibro] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLibro(); }, [id]);

  async function loadLibro() {
    try {
      const data = await apiGet(`/libros/${id}`);
      setLibro(data.libro);
    } catch (err) {
      showError(err.error || 'Libro no encontrado');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este libro?')) return;
    try {
      await apiDelete(`/bibliotecas/${libro.biblioteca._id}/libros/${libro._id}`);
      showSuccess('Libro eliminado');
      navigate(`/bibliotecas/${libro.biblioteca._id}/libros`);
    } catch (err) {
      showError(err.error || 'Error al eliminar');
    }
  }

  if (loading) return <div className="text-center py-12"><p className="text-gray-600">Cargando...</p></div>;
  if (!libro) return <div className="text-center py-12"><p className="text-gray-600">Libro no encontrado</p></div>;

  const isAuthor = user && libro.biblioteca?.autor && user._id === libro.biblioteca.autor._id;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{libro.titulo}</h1>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Autor:</span> {libro.autor}</p>
          {libro.codigoCat && <p><span className="font-medium">Código:</span> {libro.codigoCat}</p>}
          {libro.genero && <p><span className="font-medium">Género:</span> {libro.genero}</p>}
          {libro.publishYear && <p><span className="font-medium">Año:</span> {libro.publishYear}</p>}
        </div>

        {libro.biblioteca && (
          <p className="mt-4 text-sm">
            <span className="font-medium">Biblioteca:</span>{' '}
            <Link to={`/bibliotecas/${libro.biblioteca._id}`} className="text-blue-600 hover:text-blue-800">
              {libro.biblioteca.nombre}
            </Link>
          </p>
        )}

        <div className="flex gap-3 mt-6">
          {isAuthor && (
            <>
              <Link to={`/bibliotecas/${libro.biblioteca._id}/libros/${libro._id}/editar`}
                className="bg-cyan-600 text-white px-4 py-2 rounded text-sm hover:bg-cyan-700">
                Editar
              </Link>
              <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700">
                Eliminar
              </button>
            </>
          )}
          <Link to="/libros" className="text-blue-600 hover:text-blue-800 text-sm">
            Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
