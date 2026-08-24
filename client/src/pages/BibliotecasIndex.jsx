import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getBibliotecas, getAllBibliotecas } from '../api/bibliotecas';
import ClusterMap from '../components/maps/ClusterMap';

function toGeoJson(bibliotecas) {
  return {
    type: 'FeatureCollection',
    features: bibliotecas
      .filter(b => b.geometry && b.geometry.type === 'Point' && b.geometry.coordinates)
      .map(b => ({
        type: 'Feature',
        geometry: b.geometry,
        properties: {
          popUpMarkup: `<strong><a href="/bibliotecas/${b._id}" style="color:#EA580C;text-decoration:none;font-weight:600;">${b.nombre}</a></strong><p style="margin:4px 0 0;font-size:13px;color:#78716c;">${b.localidad || ''}</p>`
        }
      }))
  };
}

const DEFAULT_IMAGE = 'https://res.cloudinary.com/dj9swckra/image/upload/v1728389890/seven-shooter-hPKTYwJ4FUo-unsplash_fomis1.jpg';

export default function BibliotecasIndex() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bibliotecas, setBibliotecas] = useState([]);
  const [allBibliotecas, setAllBibliotecas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const nombre = searchParams.get('nombre') || '';
  const localidad = searchParams.get('localidad') || '';
  const codigoConabip = searchParams.get('codigoConabip') || '';
  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    getAllBibliotecas()
      .then(data => setAllBibliotecas(data.bibliotecas))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchBibliotecas();
  }, [searchParams]);

  async function fetchBibliotecas() {
    setLoading(true);
    setError(null);
    try {
      const queryObj = {};
      if (nombre) queryObj.nombre = nombre;
      if (localidad) queryObj.localidad = localidad;
      if (codigoConabip) queryObj.codigoConabip = codigoConabip;
      if (page > 1) queryObj.page = page;

      const data = await getBibliotecas(queryObj);
      setBibliotecas(data.bibliotecas);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.error || 'Error al cargar bibliotecas');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const params = {};
    const nombreVal = formData.get('nombre');
    const localidadVal = formData.get('localidad');
    const codigoVal = formData.get('codigoConabip');
    if (nombreVal) params.nombre = nombreVal;
    if (localidadVal) params.localidad = localidadVal;
    if (codigoVal) params.codigoConabip = codigoVal;
    setSearchParams(params);
  }

  function goToPage(p) {
    const params = Object.fromEntries(searchParams);
    params.page = p;
    setSearchParams(params);
  }

  function clearFilters() {
    setSearchParams({});
  }

  const geoJson = toGeoJson(allBibliotecas.length ? allBibliotecas : bibliotecas);
  const hasFilters = nombre || localidad || codigoConabip;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Map */}
      <div className="mb-8 rounded-2xl overflow-hidden shadow-card">
        <ClusterMap data={geoJson} className="w-full h-[400px]" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar - Search */}
        <aside className="lg:w-72 flex-shrink-0">
          <div className="bg-surface-dark/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/10 sticky top-24">
            <h3 className="text-lg font-semibold text-white mb-4">Buscar bibliotecas</h3>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-stone-300 mb-2">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  id="nombre"
                  defaultValue={nombre}
                  placeholder="Nombre de la biblioteca"
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
              <div>
                <label htmlFor="localidad" className="block text-sm font-medium text-stone-300 mb-2">Localidad</label>
                <input
                  type="text"
                  name="localidad"
                  id="localidad"
                  defaultValue={localidad}
                  placeholder="Ciudad o barrio"
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
              <div>
                <label htmlFor="codigoConabip" className="block text-sm font-medium text-stone-300 mb-2">Código CONABIP</label>
                <input
                  type="text"
                  name="codigoConabip"
                  id="codigoConabip"
                  defaultValue={codigoConabip}
                  placeholder="Ej: 1234"
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl font-medium transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
              >
                Buscar
              </button>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="w-full border border-stone-600 text-stone-300 hover:text-white hover:border-stone-400 py-2.5 rounded-xl font-medium transition-all duration-200"
                >
                  Limpiar filtros
                </button>
              )}
            </form>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-stone-900">
              {hasFilters ? 'Resultados de búsqueda' : 'Todas las bibliotecas'}
            </h1>
            <Link
              to="/bibliotecas/nueva"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Cargá tu biblioteca
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center gap-3 text-stone-500">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Cargando bibliotecas...
              </div>
            </div>
          ) : bibliotecas.length === 0 ? (
            <div className="text-center py-16 bg-surface-light rounded-2xl border border-stone-100">
              <svg className="w-12 h-12 mx-auto text-stone-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>
              <p className="text-stone-500 mb-2">No se encontraron bibliotecas con esos datos.</p>
              {hasFilters && (
                <button onClick={clearFilters} className="text-primary hover:text-primary-hover font-medium">
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {bibliotecas.map((bib, index) => (
                  <Link
                    key={bib._id}
                    to={`/bibliotecas/${bib._id}`}
                    className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover overflow-hidden flex transition-all duration-300 hover:-translate-y-1 border border-stone-100"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="w-36 h-36 flex-shrink-0 overflow-hidden">
                      <img
                        src={bib.images?.[0]?.url || DEFAULT_IMAGE}
                        alt={bib.nombre}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h2 className="font-semibold text-stone-900 mb-1 group-hover:text-primary transition-colors line-clamp-1">
                          {bib.nombre}
                        </h2>
                        <p className="text-stone-500 text-sm mb-1 line-clamp-1">{bib.direccion}</p>
                        <p className="text-stone-400 text-sm line-clamp-1">{bib.localidad}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        {bib.registroConabip && (
                          <span className="text-xs text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full">
                            CONABIP: {bib.registroConabip}
                          </span>
                        )}
                        <span className="inline-flex items-center text-sm font-medium text-primary group-hover:text-primary-hover transition-colors">
                          Ver más
                          <svg className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Anterior
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`w-10 h-10 rounded-xl font-medium transition-all ${
                        p === currentPage
                          ? 'bg-primary text-white shadow-md'
                          : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
