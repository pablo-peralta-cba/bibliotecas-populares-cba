import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiGet } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function LibrosBiblioteca() {
  const { id } = useParams();
  const { user } = useAuth();
  const [libros, setLibros] = useState([]);
  const [biblioteca, setBiblioteca] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [id]);

  async function load() {
    try {
      const [bData, lData] = await Promise.all([
        apiGet(`/bibliotecas/${id}`),
        apiGet(`/libros`)
      ]);
      setBiblioteca(bData.biblioteca);
      setLibros(lData.libros || []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  const isAuthor = user && biblioteca?.autor && user._id === biblioteca.autor._id;

  if (loading) return <div className="text-center py-12"><p className="text-gray-600">Cargando...</p></div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Catálogo {biblioteca && `de ${biblioteca.nombre}`}
      </h1>
      {isAuthor && (
        <Link to={`/libros/bibliotecas/${id}/nuevo`}
          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 mb-4 inline-block">
          Agregar Libro
        </Link>
      )}
      {libros.length === 0 ? (
        <p className="text-gray-600 py-8">No hay libros en el catálogo.</p>
      ) : (
        <div className="space-y-3">
          {libros.map(libro => (
            <div key={libro._id} className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-gray-800">
                  <Link to={`/libros/${libro._id}`} className="hover:text-blue-600">{libro.titulo}</Link>
                </h2>
                <p className="text-gray-600 text-sm">{libro.autor}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <Link to={`/bibliotecas/${id}`} className="text-blue-600 hover:text-blue-800 text-sm mt-4 inline-block">
        Volver a la biblioteca
      </Link>
    </div>
  );
}
