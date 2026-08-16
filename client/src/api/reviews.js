import { apiPost, apiDelete } from './client';

export async function createReview(biblioId, data) {
  return apiPost(`/bibliotecas/${biblioId}/reviews`, data);
}

export async function deleteReview(biblioId, reviewId) {
  return apiDelete(`/bibliotecas/${biblioId}/reviews/${reviewId}`);
}
