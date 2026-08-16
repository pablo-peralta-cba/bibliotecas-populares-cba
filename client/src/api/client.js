const BASE = '/api';

let flashHandlers = { showSuccess: () => {}, showError: () => {} };

export function setFlashHandlers(handlers) {
  flashHandlers = handlers;
}

async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  const config = {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Remove Content-Type for FormData (browser sets it automatically with boundary)
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const response = await fetch(url, config);
  
  // Handle non-JSON responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();

    // Auto-extract flash messages from API responses
    if (data.flash) {
      if (data.flash.success?.length) {
        data.flash.success.forEach((msg) => flashHandlers.showSuccess(msg));
      }
      if (data.flash.error?.length) {
        data.flash.error.forEach((msg) => flashHandlers.showError(msg));
      }
    }

    if (!response.ok) {
      throw { status: response.status, ...data };
    }
    return data;
  }
  
  if (!response.ok) {
    throw { status: response.status, message: 'Request failed' };
  }
  
  return response;
}

export async function apiGet(path) {
  return request(path, { method: 'GET' });
}

export async function apiPost(path, data) {
  const isFormData = data instanceof FormData;
  return request(path, {
    method: 'POST',
    body: isFormData ? data : JSON.stringify(data),
  });
}

export async function apiPut(path, data) {
  const isFormData = data instanceof FormData;
  return request(path, {
    method: 'PUT',
    body: isFormData ? data : JSON.stringify(data),
  });
}

export async function apiDelete(path) {
  return request(path, { method: 'DELETE' });
}

export async function apiUpload(path, formData) {
  return request(path, {
    method: 'POST',
    body: formData,
  });
}
