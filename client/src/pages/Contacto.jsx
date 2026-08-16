import { useState } from 'react';
import { useFlash } from '../context/FlashContext';
import { apiPost } from '../api/client';

export default function Contacto() {
  const { showSuccess, showError } = useFlash();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ asunto: '', mensaje: '' });

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiPost('/usuarios/contacto', form);
      showSuccess('Correo enviado correctamente. Te responderemos a la brevedad.');
      setForm({ asunto: '', mensaje: '' });
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Asunto *</label>
            <input type="text" name="asunto" value={form.asunto} onChange={handleChange} required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje *</label>
            <textarea name="mensaje" value={form.mensaje} onChange={handleChange} rows={6} required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
