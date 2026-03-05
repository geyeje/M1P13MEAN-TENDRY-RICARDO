const getApiUrl = () => {
  const url = 'https://m1p13mean-tendry-ricardo.onrender.com/api';
  return url.replace(/\/+$/, '');
};

export const environment = {
  production: true,
  apiUrl: getApiUrl(),
  stripePublicKey: '',
};
