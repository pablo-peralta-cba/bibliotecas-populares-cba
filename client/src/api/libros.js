import { apiGet, apiPost, apiPut, apiDelete } from './client';

export async function getLibros(query = {}) {
  const params = new URLSearchParams();
  if (query.page) params.append('page', query.page);
  if (query.titulo) params.append('titulo', query.titulo);
  if (query.autor) params.append('autor', query.autor);
  if (query.genero) params.append('genero', query.genero);
  
  const queryString = params.toString();
  return apiGet(`/libros${queryString ? `?${queryString}` : ''}`);
}

export async function buscarLibros(query = {}) {
  const params = new URLSearchParams();
  if (query.titulo) params.append('titulo', query.titulo);
  if (query.autor) params.append('autor', query.autor);
  if (query.genero) params.append('genero', query.genero);
  
  const queryString = params.toString();
  return apiGet(`/libros/buscar${queryString ? `?${queryString}` : ''}`);
}

export async function getLibro(id) {
  return apiGet(`/libros/${id}`);
}

export async function createLibro(biblioId, data) {
  return apiPost(`/libros/bibliotecas/${biblioId}`, data);
}

export async function updateLibro(biblioId, libroId, data) {
  return apiPut(`/libros/bibliotecas/${biblioId}/${libroId}`, data);
}

export async function deleteLibro(biblioId, libroId) {
  return apiDelete(`/libros/bibliotecas/${biblioId}/${libroId}`);
}
