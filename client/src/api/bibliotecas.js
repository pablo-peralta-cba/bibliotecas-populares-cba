import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from './client';

export async function getAllBibliotecas() {
  return apiGet('/bibliotecas/all');
}

export async function getBibliotecas(query = {}) {
  const params = new URLSearchParams();
  if (query.page) params.append('page', query.page);
  if (query.nombre) params.append('nombre', query.nombre);
  if (query.localidad) params.append('localidad', query.localidad);
  if (query.codigoConabip) params.append('codigoConabip', query.codigoConabip);
  
  const queryString = params.toString();
  return apiGet(`/bibliotecas${queryString ? `?${queryString}` : ''}`);
}

export async function getBiblioteca(id) {
  return apiGet(`/bibliotecas/${id}`);
}

export async function createBiblioteca(formData) {
  return apiUpload('/bibliotecas', formData);
}

export async function updateBiblioteca(id, formData) {
  return apiUpload(`/bibliotecas/${id}`, formData);
}

export async function deleteBiblioteca(id) {
  return apiDelete(`/bibliotecas/${id}`);
}

export async function getLibrosPorBiblio(biblioId, query = {}) {
  const params = new URLSearchParams();
  if (query.page) params.append('page', query.page);
  if (query.titulo) params.append('titulo', query.titulo);
  if (query.autor) params.append('autor', query.autor);
  if (query.genero) params.append('genero', query.genero);
  
  const queryString = params.toString();
  return apiGet(`/bibliotecas/${biblioId}/libros${queryString ? `?${queryString}` : ''}`);
}
