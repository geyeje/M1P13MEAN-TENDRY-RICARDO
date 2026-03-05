export const environment = {
  production: true,
  apiUrl: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://m1p13mean-tendry-ricardo.onrender.com/api'
  ).replace(/\/+$/, ''),
  stripePublicKey: '',
};
