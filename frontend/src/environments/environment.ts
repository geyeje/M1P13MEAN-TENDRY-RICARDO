export const environment = {
  production: false,
  apiUrl: (window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://m1p13mean-tendry-ricardo.onrender.com/api'
  ).replace(/\/+$/, ''), // Supprime le slash final s'il existe
  stripePublicKey:
    'pk_test_51T6GHF9bqT14xCYZ0VMGADcVAnHEx0gUiyEv8pdeW3icSX5XggPdmTktkDTC0zA3MkuzjtQ5f9SPWQnMNtjTBJnz001W4Yh6PA',
};
