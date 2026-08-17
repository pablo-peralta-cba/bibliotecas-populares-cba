import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiPost } from '../api/client';
import { useFlash } from '../context/FlashContext';

const SOCIAL_NETWORKS = ['instagram', 'facebook', 'X', 'mail'];

export default function NuevaBiblioteca() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useFlash();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: '', localidad: '', direccion: '', horario: '', cuota: '',
    telefono: '', opcionesTelefono: 'Solo llamadas', actividades: '',
    registroConabip: '', longitude: '', latitude: '',
  });
  const [redes, setRedes] = useState(
    SOCIAL_NETWORKS.map(n => ({ nombre: n, checked: false, link: '' }))
  );
  const [images, setImages] = useState([]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleRedesChange(index, field, value) {
    const updated = [...redes];
    updated[index] = { ...updated[index], [field]: value };
    setRedes(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

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

    for (const file of images) {
      formData.append('image', file);
    }

    try {
      const data = await apiPost('/bibliotecas', formData);
      showSuccess('Biblioteca creada exitosamente');
      navigate(`/bibliotecas/${data.biblioteca._id}`);
    } catch (err) {
      showError(err.error || 'Error al crear la biblioteca');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Registrá tu Biblioteca Popular</h1>
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
              placeholder="Ej: Lunes a viernes, 14 a 18hs"
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
                <input
                  type="checkbox"
                  checked={red.checked}
                  onChange={(e) => handleRedesChange(i, 'checked', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="w-24 text-sm capitalize">{red.nombre}</span>
                <input
                  type={red.nombre === 'mail' ? 'email' : 'text'}
                  value={red.link}
                  onChange={(e) => handleRedesChange(i, 'link', e.target.value)}
                  placeholder={red.nombre === 'mail' ? 'email' : `Usuario de ${red.nombre}`}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Actividades *</label>
            <textarea name="actividades" value={form.actividades} onChange={handleChange} rows={2} required
              placeholder="Ej: Lectura, Talleres"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Registro CONABIP *</label>
            <input type="number" name="registroConabip" value={form.registroConabip} onChange={handleChange} required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Imágenes</label>
            <input type="file" accept="image/*" multiple onChange={(e) => setImages([...e.target.files])}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
            {loading ? 'Creando...' : 'Cargar la nueva biblioteca'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/bibliotecas" className="text-blue-600 hover:text-blue-800 text-sm">
            Ver todas las bibliotecas
          </Link>
        </div>
      </div>
    </div>
  );
}
