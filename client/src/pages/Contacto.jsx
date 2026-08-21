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
      if (form.website) {
        return;
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
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Contacto</h1>
        <p className="text-stone-500 max-w-md mx-auto">
          ¿Tenés alguna pregunta o sugerencia? Escribinos y te responderemos a la brevedad.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-stone-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                placeholder="Tu nombre completo"
                className="w-full px-4 py-3 bg-surface-light border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
                className="w-full px-4 py-3 bg-surface-light border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            <div>
              <label htmlFor="mensaje" className="block text-sm font-medium text-stone-700 mb-2">
                Mensaje *
              </label>
              <textarea
                id="mensaje"
                name="mensaje"
                value={form.mensaje}
                onChange={handleChange}
                rows={6}
                required
                placeholder="Escribí tu mensaje aquí..."
                className="w-full px-4 py-3 bg-surface-light border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
              />
            </div>

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

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Enviar mensaje
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
