import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiGet, apiPut } from '../api/client';
import { useFlash } from '../context/FlashContext';

export default function EditarLibro() {
  const { id, libroId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useFlash();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ titulo: '', autor: '', codigoCat: '', genero: '', publishYear: '' });

  useEffect(() => {
    apiGet(`/libros/${libroId}`).then(d => {
      const l = d.libro;
      setForm({ titulo: l.titulo || '', autor: l.autor || '', codigoCat: l.codigoCat || '', genero: l.genero || '', publishYear: l.publishYear || '' });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [libroId]);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiPut(`/libros/bibliotecas/${id}/${libroId}`, { libro: form });
      showSuccess('Libro actualizado');
      navigate(`/bibliotecas/${id}/libros/${libroId}`);
    } catch (err) {
      showError(err.error || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-center py-12"><p className="text-gray-600">Cargando...</p></div>;

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Editar Libro</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input type="text" name="titulo" value={form.titulo} onChange={handleChange} required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Autor *</label>
            <input type="text" name="autor" value={form.autor} onChange={handleChange} required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Código de catálogo</label>
            <input type="text" name="codigoCat" value={form.codigoCat} onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
            <input type="text" name="genero" value={form.genero} onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Año de publicación</label>
            <input type="number" name="publishYear" value={form.publishYear} onChange={handleChange} min="1750"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to={`/bibliotecas/${id}/libros/${libroId}`} className="text-blue-600 hover:text-blue-800 text-sm">
            Volver al libro
          </Link>
        </div>
      </div>
    </div>
  );
}
