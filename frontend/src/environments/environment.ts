const getApiUrl = () => {
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const url =
    host === 'localhost' || host === '127.0.0.1'
      ? 'http://localhost:3000/api'
      : 'https://m1p13mean-tendry-ricardo.onrender.com/api';
  return url.replace(/\/+$/, '');
};

export const environment = {
  production: false,
  apiUrl: getApiUrl(),
  stripePublicKey:
    'pk_test_51T6GHF9bqT14xCYZ0VMGADcVAnHEx0gUiyEv8pdeW3icSX5XggPdmTktkDTC0zA3MkuzjtQ5f9SPWQnMNtjTBJnz001W4Yh6PA',
};
