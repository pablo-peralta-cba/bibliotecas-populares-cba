import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBiblioteca } from '../api/bibliotecas';
import { apiPut } from '../api/client';
import { useFlash } from '../context/FlashContext';

const SOCIAL_NETWORKS = ['instagram', 'facebook', 'X', 'mail'];

export default function EditarBiblioteca() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useFlash();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: '', localidad: '', direccion: '', horario: '', cuota: '',
    telefono: '', opcionesTelefono: 'Solo llamadas', actividades: '',
    registroConabip: '', longitude: '', latitude: '',
  });
  const [redes, setRedes] = useState(
    SOCIAL_NETWORKS.map(n => ({ nombre: n, checked: false, link: '' }))
  );
  const [existingImages, setExistingImages] = useState([]);
  const [deleteImages, setDeleteImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  useEffect(() => { loadBiblioteca(); }, [id]);

  async function loadBiblioteca() {
    try {
      const data = await getBiblioteca(id);
      const b = data.biblioteca;
      setForm({
        nombre: b.nombre || '',
        localidad: b.localidad || '',
        direccion: b.direccion || '',
        horario: b.horario || '',
        cuota: b.cuota || '',
        telefono: b.telefono || '',
        opcionesTelefono: b.opcionesTelefono || 'Solo llamadas',
        actividades: b.actividades || '',
        registroConabip: b.registroConabip || '',
        longitude: b.geometry?.coordinates?.[0] || '',
        latitude: b.geometry?.coordinates?.[1] || '',
      });
      const loadedRedes = SOCIAL_NETWORKS.map(n => {
        const existing = data.redes?.find(r => r.nombre === n);
        return existing || { nombre: n, checked: false, link: '' };
      });
      setRedes(loadedRedes);
      setExistingImages(b.images || []);
    } catch (err) {
      showError(err.error || 'Error al cargar la biblioteca');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleRedesChange(index, field, value) {
    const updated = [...redes];
    updated[index] = { ...updated[index], [field]: value };
    setRedes(updated);
  }

  function toggleDeleteImage(filename) {
    setDeleteImages(prev =>
      prev.includes(filename) ? prev.filter(f => f !== filename) : [...prev, filename]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append('biblioteca[nombre]', form.nombre);
    formData.append('biblioteca[localidad]', form.localidad);
    formData.append('biblioteca[direccion]', form.direccion);
    formData.append('biblioteca[horario]', form.horario);
    formData.append('biblioteca[cuota]', form.cuota);
    formData.append('biblioteca[telefono]', form.telefono);
    formData.append('biblioteca[opcionesTelefono]', form.opcionesTelefono);
    formData.append('biblioteca[actividades]', form.actividades);
    formData.append('biblioteca[registroConabip]', form.registroConabip);

    if (form.longitude && form.latitude) {
      formData.append('biblioteca[geometry][coordinates][0]', form.longitude);
      formData.append('biblioteca[geometry][coordinates][1]', form.latitude);
    }

    redes.forEach((red, i) => {
      formData.append(`biblioteca[redes][${i}][nombre]`, red.nombre);
      formData.append(`biblioteca[redes][${i}][checked]`, red.checked ? 'true' : 'false');
      formData.append(`biblioteca[redes][${i}][link]`, red.link);
    });

    for (const file of newImages) {
      formData.append('image', file);
    }

    for (const filename of deleteImages) {
      formData.append('deleteImages[]', filename);
    }

    try {
      await apiPut(`/bibliotecas/${id}`, formData);
      showSuccess('Biblioteca editada exitosamente');
      navigate(`/bibliotecas/${id}`);
    } catch (err) {
      showError(err.error || 'Error al editar la biblioteca');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-center py-12"><p className="text-gray-600">Cargando...</p></div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Editar Biblioteca</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Localidad *</label>
            <input type="text" name="localidad" value={form.localidad} onChange={handleChange} required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
            <input type="text" name="direccion" value={form.direccion} onChange={handleChange} required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Coordenadas (opcional)</label>
            <div className="flex gap-4">
              <input type="number" step="any" name="longitude" value={form.longitude} onChange={handleChange}
                placeholder="Longitud" className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" step="any" name="latitude" value={form.latitude} onChange={handleChange}
                placeholder="Latitud" className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Horarios</label>
            <textarea name="horario" value={form.horario} onChange={handleChange} rows={2}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor de la cuota</label>
            <input type="number" name="cuota" value={form.cuota} onChange={handleChange} min="0"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
            <input type="text" name="telefono" value={form.telefono} onChange={handleChange} required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de teléfono *</label>
            <select name="opcionesTelefono" value={form.opcionesTelefono} onChange={handleChange} required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Solo llamadas">Solo llamadas</option>
              <option value="Llamadas y WhatsApp">Llamadas y WhatsApp</option>
              <option value="Solo WhatsApp">Solo WhatsApp</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Redes Sociales</label>
            {redes.map((red, i) => (
              <div key={red.nombre} className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={red.checked}
                  onChange={(e) => handleRedesChange(i, 'checked', e.target.checked)} className="w-4 h-4" />
                <span className="w-24 text-sm capitalize">{red.nombre}</span>
                <input type={red.nombre === 'mail' ? 'email' : 'text'} value={red.link}
                  onChange={(e) => handleRedesChange(i, 'link', e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Actividades *</label>
            <textarea name="actividades" value={form.actividades} onChange={handleChange} rows={2} required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Registro CONABIP *</label>
            <input type="number" name="registroConabip" value={form.registroConabip} onChange={handleChange} required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes actuales</label>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img.url} alt="" className="w-20 h-20 object-cover rounded border" />
                    <label className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer">
                      <input type="checkbox" className="hidden"
                        checked={deleteImages.includes(img.filename)}
                        onChange={() => toggleDeleteImage(img.filename)} />
                      ×
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Marcar para eliminar</p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Agregar nuevas imágenes</label>
            <input type="file" accept="image/*" multiple onChange={(e) => setNewImages([...e.target.files])}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to={`/bibliotecas/${id}`} className="text-blue-600 hover:text-blue-800 text-sm">
            Volver a la biblioteca
          </Link>
        </div>
      </div>
    </div>
  );
}
