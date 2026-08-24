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

  function clearFilters() {
    setSearchParams({});
  }

  const hasFilters = titulo || autor || genero;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Catálogo de Libros</h1>
        <p className="text-stone-500 max-w-md mx-auto">
          Explorá el catálogo de libros disponibles en nuestra red de bibliotecas populares.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-8">
        <div className="p-6 border-b border-stone-100">
          <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Buscar libros
          </h2>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                name="titulo"
                defaultValue={titulo}
                placeholder="Título del libro"
                className="w-full px-4 py-3 bg-surface-light border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                name="autor"
                defaultValue={autor}
                placeholder="Autor"
                className="w-full px-4 py-3 bg-surface-light border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                name="genero"
                defaultValue={genero}
                placeholder="Género"
                className="w-full px-4 py-3 bg-surface-light border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar
            </button>
          </form>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-stone-500 hover:text-primary transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center gap-3 text-stone-500">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Cargando libros...
          </div>
        </div>
      ) : isBusqueda && libros.length === 0 ? (
        <div className="text-center py-16 bg-surface-light rounded-2xl border border-stone-100">
          <svg className="w-12 h-12 mx-auto text-stone-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-stone-500 mb-2">No se encontraron libros con esos datos.</p>
          <button onClick={clearFilters} className="text-primary hover:text-primary-hover font-medium">
            Limpiar filtros
          </button>
        </div>
      ) : libros.length > 0 ? (
        <div className="grid gap-4">
          {libros.map((libro) => (
            <Link
              key={libro._id}
              to={`/libros/${libro._id}`}
              className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 border border-stone-100"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900 group-hover:text-primary transition-colors mb-1">
                  {libro.titulo}
                </h3>
                <p className="text-stone-500 text-sm mb-1">{libro.autor}</p>
                {libro.genero && (
                  <span className="inline-block text-xs text-stone-400 bg-surface-light px-2 py-0.5 rounded-full">
                    {libro.genero}
                  </span>
                )}
              </div>
              {libro.biblioteca && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                  </svg>
                  <span className="text-primary font-medium group-hover:text-primary-hover transition-colors">
                    {libro.biblioteca.nombre}
                  </span>
                  <svg className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface-light rounded-2xl border border-stone-100">
          <svg className="w-12 h-12 mx-auto text-stone-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-stone-500">
            Usá el formulario de búsqueda para encontrar libros.
          </p>
        </div>
      )}
    </div>
  );
}
