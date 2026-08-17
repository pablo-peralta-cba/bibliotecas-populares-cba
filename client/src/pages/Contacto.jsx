import { useState } from 'react';
import { useFlash } from '../context/FlashContext';
import { apiPost } from '../api/client';

export default function Contacto() {
  const { showSuccess, showError } = useFlash();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '', website: '' });

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      // Honeypot check - bots will fill this field
      if (form.website) {
        return; // Silently reject bots
      }
      await apiPost('/contacto', { nombre: form.nombre, email: form.email, mensaje: form.mensaje });
      showSuccess('Correo enviado correctamente. Te responderemos a la brevedad.');
      setForm({ nombre: '', email: '', mensaje: '', website: '' });
    } catch (err) {
      showError(err.error || 'Error al enviar el correo');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Contacto</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje *</label>
            <textarea name="mensaje" value={form.mensaje} onChange={handleChange} rows={6} required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {/* Honeypot field - hidden from humans, bots will fill it */}
          <div className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              value={form.website}
              onChange={handleChange}
              tabIndex="-1"
              autoComplete="off"
            />
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
      </div>
    </div>
  );
}
