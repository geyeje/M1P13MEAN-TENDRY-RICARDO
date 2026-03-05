const getApiUrl = () => {
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const url =
    host === 'localhost' || host === '127.0.0.1'
      ? 'http://localhost:3000/api'
      : 'https://m1p13mean-tendry-ricardo.onrender.com/api';
  return url.replace(/\/+$/, '');
};

export const environment = {
  production: true,
  apiUrl: getApiUrl(),
  stripePublicKey: '',
};
