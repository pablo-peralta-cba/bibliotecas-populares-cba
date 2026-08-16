import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiGet } from '../api/client';

export default function LibrosCatalogo() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isBusqueda, setIsBusqueda] = useState(false);

  const titulo = searchParams.get('titulo') || '';
  const autor = searchParams.get('autor') || '';
  const genero = searchParams.get('genero') || '';

  useEffect(() => { fetchLibros(); }, [searchParams]);

  async function fetchLibros() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (titulo) params.set('titulo', titulo);
      if (autor) params.set('autor', autor);
      if (genero) params.set('genero', genero);
      const qs = params.toString();
      const data = await apiGet(`/libros${qs ? '?' + qs : ''}`);
      setLibros(data.libros);
      setIsBusqueda(data.isBusqueda);
    } catch {
      setLibros([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const params = {};
    const t = fd.get('titulo');
    const a = fd.get('autor');
    const g = fd.get('genero');
    if (t) params.titulo = t;
    if (a) params.autor = a;
    if (g) params.genero = g;
    setSearchParams(params);
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Catálogo de Libros</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input type="text" name="titulo" defaultValue={titulo} placeholder="Título"
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="text" name="autor" defaultValue={autor} placeholder="Autor"
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="text" name="genero" defaultValue={genero} placeholder="Género"
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Buscar
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-center text-gray-600 py-8">Cargando...</p>
      ) : isBusqueda && libros.length === 0 ? (
        <p className="text-center text-gray-600 py-8">No se encontraron libros con esos datos.</p>
      ) : libros.length > 0 ? (
        <div className="space-y-3">
          {libros.map(libro => (
            <div key={libro._id} className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-gray-800">
                  <Link to={`/libros/${libro._id}`} className="hover:text-blue-600">{libro.titulo}</Link>
                </h2>
                <p className="text-gray-600 text-sm">{libro.autor}</p>
                {libro.genero && <p className="text-gray-500 text-xs">{libro.genero}</p>}
              </div>
              {libro.biblioteca && (
                <Link to={`/bibliotecas/${libro.biblioteca._id}`} className="text-blue-600 hover:text-blue-800 text-sm">
                  {libro.biblioteca.nombre}
                </Link>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 py-8">
          Usá el formulario de búsqueda para encontrar libros.
        </p>
      )}
    </div>
  );
}
