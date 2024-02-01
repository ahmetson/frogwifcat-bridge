export const USE_TESTNET =
  typeof window !== 'undefined' &&
  window.document.location.search.includes('testnet');
