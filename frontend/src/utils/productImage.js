import api from '../services/api';

const backendOrigin = api.defaults.baseURL.replace(/\/api\/?$/, '');

export function getProductImageUrl(image) {
  if (!image) return '';
  if (image.startsWith('/uploads/')) return `${backendOrigin}${image}`;
  return image;
}
