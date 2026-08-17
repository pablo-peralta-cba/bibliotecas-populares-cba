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
          popUpMarkup: `<strong><a href="/bibliotecas/${b._id}">${b.nombre}</a></strong><p>${b.localidad || ''}</p>`
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

  const geoJson = toGeoJson(allBibliotecas.length ? allBibliotecas : bibliotecas);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Map */}
      <div className="mb-8">
        <ClusterMap data={geoJson} className="w-full h-[400px]" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar - Search */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-20">
            <h3 className="font-bold text-gray-800 mb-4">Buscar bibliotecas</h3>
            <form onSubmit={handleSearch} className="space-y-3">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  id="nombre"
                  defaultValue={nombre}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="localidad" className="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
                <input
                  type="text"
                  name="localidad"
                  id="localidad"
                  defaultValue={localidad}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="codigoConabip" className="block text-sm font-medium text-gray-700 mb-1">Código CONABIP</label>
                <input
                  type="text"
                  name="codigoConabip"
                  id="codigoConabip"
                  defaultValue={codigoConabip}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Buscar
              </button>
            </form>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Bibliotecas</h1>
            <Link
              to="/bibliotecas/nueva"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Cargá tu biblioteca
            </Link>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Cargando bibliotecas...</p>
            </div>
          ) : bibliotecas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No se encontraron bibliotecas con esos datos.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bibliotecas.map((bib) => (
                  <div key={bib._id} className="bg-white rounded-lg shadow-md overflow-hidden flex">
                    <img
                      src={bib.images?.[0]?.url || DEFAULT_IMAGE}
                      alt={bib.nombre}
                      className="w-32 h-32 object-cover flex-shrink-0"
                    />
                    <div className="p-4 flex-1">
                      <h2 className="font-bold text-gray-800 mb-1">
                        <Link to={`/bibliotecas/${bib._id}`} className="hover:text-blue-600">
                          {bib.nombre}
                        </Link>
                      </h2>
                      <p className="text-gray-600 text-sm mb-1">{bib.direccion}</p>
                      <p className="text-gray-500 text-sm mb-2">{bib.localidad}</p>
                      {bib.registroConabip && (
                        <p className="text-gray-400 text-xs">CONABIP: {bib.registroConabip}</p>
                      )}
                      <Link
                        to={`/bibliotecas/${bib._id}`}
                        className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Ver biblioteca →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    ← Anterior
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`px-3 py-1 rounded border ${p === currentPage ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
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
