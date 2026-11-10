import { CryptoDigestAlgorithm, digest, getRandomValues } from 'expo-crypto';

export function configurarPkce() {
  const hasRandomness = typeof globalThis.crypto?.getRandomValues === 'function';
  const hasDigest = typeof globalThis.crypto?.subtle?.digest === 'function';

  if (hasRandomness && hasDigest) return;

  const crypto = globalThis.crypto ?? {};

  if (!hasRandomness) {
    Object.defineProperty(crypto, 'getRandomValues', { configurable: true, value: getRandomValues });
  }

  if (!hasDigest) {
    const subtle = globalThis.crypto?.subtle ?? {};

    Object.defineProperty(subtle, 'digest', {
      configurable: true,
      value: (algoritmo: string, dados: Parameters<typeof digest>[1]) => {
        if (algoritmo !== 'SHA-256') {
          return Promise.reject(new Error('Algoritmo de hash não suportado.'));
        }

        return digest(CryptoDigestAlgorithm.SHA256, dados);
      },
    });

    if (!globalThis.crypto?.subtle) {
      Object.defineProperty(crypto, 'subtle', { configurable: true, value: subtle });
    }
  }

  if (!globalThis.crypto) {
    Object.defineProperty(globalThis, 'crypto', { configurable: true, value: crypto });
  }
}
