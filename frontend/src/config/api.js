const BASE_URL = (import.meta.env.VITE_API_URL || '')
    .trim()
    .replace(/\/+$/, '');

export const API_BASE_URL = BASE_URL;

export const apiUrl = (endpoint) => {
    const path = endpoint.startsWith('/')
        ? endpoint
        : `/${endpoint}`;

    return `${API_BASE_URL}${path}`;
};