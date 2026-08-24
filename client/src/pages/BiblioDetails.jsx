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

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="inline-flex items-center gap-3 text-stone-500">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Cargando biblioteca...
      </div>
    </div>
  );
  if (error) return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl">
        {error}
      </div>
    </div>
  );
  if (!biblioteca) return (
    <div className="text-center py-20">
      <p className="text-stone-500">Biblioteca no encontrada</p>
    </div>
  );

  const isAuthor = user && biblioteca.autor && user._id === biblioteca.autor._id;
  const images = biblioteca.images?.length ? biblioteca.images : [{ url: DEFAULT_IMAGE }];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-stone-400">
          <li><Link to="/bibliotecas" className="hover:text-primary transition-colors">Bibliotecas</Link></li>
          <li><span className="mx-2">/</span></li>
          <li className="text-stone-600 font-medium truncate">{biblioteca.nombre}</li>
        </ol>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left column */}
        <div className="lg:w-3/5">
          {/* Image Carousel */}
          {images.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-6 group">
              <div className="relative">
                <img
                  src={images[activeImage].url}
                  alt={biblioteca.nombre}
                  className="w-full h-80 md:h-96 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((activeImage - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-stone-800 rounded-full p-2.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                      aria-label="Imagen anterior"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setActiveImage((activeImage + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-stone-800 rounded-full p-2.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                      aria-label="Siguiente imagen"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-stone-900/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                      {activeImage + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 p-4 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className="flex-shrink-0 transition-all duration-200"
                    >
                      <img
                        src={img.url}
                        alt=""
                        className={`w-16 h-16 object-cover rounded-xl transition-all duration-200 ${
                          i === activeImage
                            ? 'ring-2 ring-primary ring-offset-2 opacity-100'
                            : 'opacity-60 hover:opacity-80'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Info Card */}
          <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-stone-900 mb-2">{biblioteca.nombre}</h1>
            <p className="text-stone-500 mb-6 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {biblioteca.direccion}, {biblioteca.localidad}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {biblioteca.telefono && (
                <div className="flex items-center gap-3 p-3 bg-surface-light rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-stone-400 text-xs">Teléfono</p>
                    <p className="text-stone-800 font-medium">{biblioteca.telefono} {biblioteca.opcionesTelefono}</p>
                  </div>
                </div>
              )}
              {biblioteca.horario && (
                <div className="flex items-center gap-3 p-3 bg-surface-light rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-stone-400 text-xs">Horarios</p>
                    <p className="text-stone-800 font-medium">{biblioteca.horario}</p>
                  </div>
                </div>
              )}
              {biblioteca.cuota !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-surface-light rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-stone-400 text-xs">Cuota</p>
                    <p className="text-stone-800 font-medium">${biblioteca.cuota}</p>
                  </div>
                </div>
              )}
            </div>

            {biblioteca.actividades && (
              <div className="mt-6 p-4 bg-surface-light rounded-xl">
                <h3 className="font-semibold text-stone-800 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Actividades
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">{biblioteca.actividades}</p>
              </div>
            )}

            {/* Social Links */}
            {redes.filter(r => r.checked && r.link).length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-stone-800 mb-3">Redes sociales</h3>
                <div className="flex flex-wrap gap-3">
                  {redes.filter(r => r.checked && r.link).map((red) => {
                    const url = getSocialUrl(red.nombre, red.link);
                    return (
                      <a
                        key={red.nombre}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-surface-light hover:bg-primary hover:text-white text-stone-600 rounded-xl text-sm font-medium transition-all duration-200"
                      >
                        <span className="capitalize">{red.nombre}</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Book Catalog */}
          <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
            <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Catálogo de Libros
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/bibliotecas/${id}/libros`}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
              >
                Ver Catálogo
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              {isAuthor && (
                <Link
                  to={`/libros/bibliotecas/${id}/nuevo`}
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar Libro
                </Link>
              )}
            </div>
          </div>

          {/* Edit/Delete (author only) */}
          {isAuthor && (
            <div className="bg-white rounded-2xl shadow-card p-6 border-2 border-dashed border-stone-200">
              <h3 className="font-semibold text-stone-600 mb-4 text-sm uppercase tracking-wide">Zona de administración</h3>
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/bibliotecas/${id}/editar`}
                  className="inline-flex items-center gap-2 bg-stone-600 hover:bg-stone-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar biblioteca
                </Link>
                <button
                  onClick={handleDeleteBiblioteca}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar biblioteca
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:w-2/5 space-y-6">
          {/* Map */}
          {biblioteca.geometry?.coordinates && (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="p-4 border-b border-stone-100">
                <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Ubicación
                </h3>
              </div>
              <ShowPageMap
                coordinates={biblioteca.geometry.coordinates}
                nombre={biblioteca.nombre}
                title={biblioteca.nombre}
              />
            </div>
          )}

          {/* Review Form */}
          {user && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Califica esta biblioteca
              </h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-4">
                  <StarRating value={reviewRating} onChange={setReviewRating} />
                </div>
                <div className="mb-4">
                  <textarea
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                    placeholder="Escribí tu comentario..."
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                    rows={4}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !reviewBody.trim()}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {submitting ? 'Enviando...' : 'Enviar comentario'}
                </button>
              </form>
            </div>
          )}

          {/* Reviews List */}
          {biblioteca.reviews?.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Comentarios ({biblioteca.reviews.length})
              </h3>
              {biblioteca.reviews.map((review) => (
                <div key={review._id} className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {(review.autor?.username || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-800 text-sm">
                        {review.autor?.username || 'Autor no disponible'}
                      </h4>
                      {review.rating > 0 && <StarRating value={review.rating} readonly size="sm" />}
                    </div>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed">{review.body}</p>
                  {user && review.autor && user._id === review.autor._id && (
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="text-red-500 hover:text-red-700 text-xs mt-3 font-medium transition-colors"
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
