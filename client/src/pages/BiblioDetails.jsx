import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBiblioteca } from '../api/bibliotecas';
import { createReview, deleteReview } from '../api/reviews';
import { useAuth } from '../context/AuthContext';
import { useFlash } from '../context/FlashContext';
import StarRating from '../components/ui/StarRating';
import ShowPageMap from '../components/maps/ShowPageMap';

const DEFAULT_IMAGE = 'https://res.cloudinary.com/dj9swckra/image/upload/v1728389890/seven-shooter-hPKTYwJ4FUo-unsplash_fomis1.jpg';

function getSocialUrl(nombre, link) {
  switch (nombre) {
    case 'instagram': return `https://www.instagram.com/${link}`;
    case 'facebook': return `https://www.facebook.com/${link}`;
    case 'X': return `https://twitter.com/${link}`;
    case 'mail': return null;
    default: return null;
  }
}

export default function BiblioDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useFlash();
  const navigate = useNavigate();

  const [biblioteca, setBiblioteca] = useState(null);
  const [redes, setRedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeImage, setActiveImage] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewBody, setReviewBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBiblioteca();
  }, [id]);

  async function fetchBiblioteca() {
    setLoading(true);
    try {
      const data = await getBiblioteca(id);
      setBiblioteca(data.biblioteca);
      setRedes(data.redes);
    } catch (err) {
      setError(err.error || 'Error al cargar la biblioteca');
    } finally {
      setLoading(false);
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!reviewBody.trim()) return;
    setSubmitting(true);
    try {
      await createReview(id, { review: { rating: reviewRating, body: reviewBody } });
      showSuccess('Comentario enviado');
      setReviewBody('');
      setReviewRating(0);
      fetchBiblioteca();
    } catch (err) {
      showError(err.error || 'Error al enviar comentario');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteReview(reviewId) {
    if (!confirm('¿Eliminar este comentario?')) return;
    try {
      await deleteReview(id, reviewId);
      showSuccess('Comentario eliminado');
      fetchBiblioteca();
    } catch (err) {
      showError(err.error || 'Error al eliminar comentario');
    }
  }

  async function handleDeleteBiblioteca() {
    if (!confirm('¿Eliminar esta biblioteca? Esta acción no se puede deshacer.')) return;
    try {
      const { apiDelete } = await import('../api/client');
      await apiDelete(`/bibliotecas/${id}`);
      showSuccess('Biblioteca eliminada');
      navigate('/bibliotecas');
    } catch (err) {
      showError(err.error || 'Error al eliminar biblioteca');
    }
  }

  if (loading) return <div className="text-center py-12"><p className="text-gray-600">Cargando...</p></div>;
  if (error) return <div className="max-w-4xl mx-auto py-12"><div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div></div>;
  if (!biblioteca) return <div className="text-center py-12"><p className="text-gray-600">Biblioteca no encontrada</p></div>;

  const isAuthor = user && biblioteca.autor && user._id === biblioteca.autor._id;
  const images = biblioteca.images?.length ? biblioteca.images : [{ url: DEFAULT_IMAGE }];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left column */}
        <div className="lg:w-1/2">
          {/* Image Carousel */}
          {images.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
              <div className="relative">
                <img
                  src={images[activeImage].url}
                  alt={biblioteca.nombre}
                  className="w-full h-80 object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((activeImage - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setActiveImage((activeImage + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-2 overflow-x-auto">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImage(i)}>
                      <img
                        src={img.url}
                        alt=""
                        className={`w-16 h-16 object-cover rounded ${i === activeImage ? 'ring-2 ring-blue-500' : 'opacity-60'}`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{biblioteca.nombre}</h1>
            <p className="text-gray-600 mb-4">{biblioteca.direccion}</p>
            <div className="space-y-2 text-sm">
              <p className="text-gray-500">{biblioteca.localidad}</p>
              {biblioteca.telefono && (
                <p><span className="font-medium">Teléfono:</span> {biblioteca.telefono} {biblioteca.opcionesTelefono}</p>
              )}
              {biblioteca.actividades && <p><span className="font-medium">Actividades:</span> {biblioteca.actividades}</p>}
              {biblioteca.horario && <p><span className="font-medium">Horarios:</span> {biblioteca.horario}</p>}
              {biblioteca.cuota !== undefined && <p><span className="font-medium">Cuota:</span> ${biblioteca.cuota}</p>}
            </div>

            {/* Social Links */}
            <div className="mt-4 space-y-2">
              {redes.filter(r => r.checked && r.link).map((red) => {
                const url = getSocialUrl(red.nombre, red.link);
                return (
                  <div key={red.nombre} className="text-sm">
                    <span className="font-medium capitalize">{red.nombre}:</span>{' '}
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        {red.link}
                      </a>
                    ) : (
                      <span className="text-gray-600">{red.link}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Book Catalog */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Catálogo de Libros</h2>
            <div className="flex gap-2">
              <Link
                to={`/bibliotecas/${id}/libros`}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
              >
                Ver Catálogo
              </Link>
              <Link
                to={`/bibliotecas/${id}/libros/nuevo`}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
              >
                Agregar Libro
              </Link>
            </div>
          </div>

          {/* Edit/Delete (author only) */}
          {isAuthor && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex gap-3">
                <Link
                  to={`/bibliotecas/${id}/editar`}
                  className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
                >
                  Editar biblioteca
                </Link>
                <button
                  onClick={handleDeleteBiblioteca}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Eliminar biblioteca
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:w-1/2">
          {/* Map */}
          {biblioteca.geometry?.coordinates && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
              <ShowPageMap
                coordinates={biblioteca.geometry.coordinates}
                nombre={biblioteca.nombre}
                title={biblioteca.nombre}
              />
            </div>
          )}

          {/* Review Form */}
          {user && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-4">
              <h3 className="font-bold text-gray-800 mb-3">Califica esta biblioteca</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-3">
                  <StarRating value={reviewRating} onChange={setReviewRating} />
                </div>
                <div className="mb-3">
                  <textarea
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                    placeholder="Escribí tu comentario..."
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !reviewBody.trim()}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? 'Enviando...' : 'Enviar comentario'}
                </button>
              </form>
            </div>
          )}

          {/* Reviews List */}
          {biblioteca.reviews?.length > 0 && (
            <div className="space-y-3">
              {biblioteca.reviews.map((review) => (
                <div key={review._id} className="bg-white rounded-lg shadow-md p-4">
                  <h4 className="font-bold text-gray-800 text-sm">
                    {review.autor?.username || 'Autor no disponible'}
                  </h4>
                  {review.rating > 0 && <StarRating value={review.rating} readonly />}
                  <p className="text-gray-600 text-sm mt-1">{review.body}</p>
                  {user && review.autor && user._id === review.autor._id && (
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="text-red-600 hover:text-red-800 text-xs mt-2"
                    >
                      Borrar comentario
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
