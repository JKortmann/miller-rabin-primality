import { primalityTest } from '../src/index.js';
import { describe, it, expect } from 'vitest';

describe('input options', () => {
  it('should correctly label primes with user-specified numRounds', async () => {
    const primes = [89n, 4145835283301077n];
    const results = await Promise.all(
      primes.map((p) => primalityTest(p, { numRounds: 8 })),
    );
    results.forEach((result) => {
      expect(result.probablePrime).toBe(true);
    });
  });

  it('should correctly label composite numbers with user-specified numRounds', async () => {
    const composites = [91n, 41458352833010723n];
    const results = await Promise.all(
      composites.map((n) => primalityTest(n, { numRounds: 8 })),
    );
    results.forEach((result) => {
      expect(result.probablePrime).toBe(false);
    });
  });

  it('should correctly use a provided array of bases instead of random bases', async () => {
    // The first eight primes are all strong liars for this composite number...
    const result1 = await primalityTest(341550071728321n, {
      bases: [2, 3, 5, 7, 11, 13, 17, 19],
    });
    expect(result1.probablePrime).toBe(true);

    // ...but 23 is not!
    const result2 = await primalityTest(341550071728321n, { bases: [23] });
    expect(result2.probablePrime).toBe(false);
  });

  it('should ignore the numRounds option when bases is specified', async () => {
    // If it only tests this number with base 2, it should incorrectly label it a probable prime
    // But if it runs 20 tests with random bases, it will almost certainly be found composite
    const result = await primalityTest(341550071728321n, {
      numRounds: 20,
      bases: [2],
    });
    expect(result.probablePrime).toBe(true);
  });

  it('should throw a TypeError when bases option is not an array', async ({
    expect,
  }) => {
    // @ts-expect-error Type error would be catched by TS itself on translation
    await expect(primalityTest(113n, { bases: 2 })).rejects.toThrowError(
      TypeError,
    );
  });

  it('should throw a RangeError when one or more provided bases is out of range', async ({
    expect,
  }) => {
    await expect(
      primalityTest(113n, { bases: [1, 2, 3] }),
    ).rejects.toThrowError(RangeError);
    await expect(primalityTest(119n, { bases: [500] })).rejects.toThrowError(
      RangeError,
    );
  });

  it('should correctly label strong pseudoprimes to a given base', async () => {
    // Note: 31697 is a strong pseudoprime to base 3, but should still be correctly labeled as composite
    const result = await primalityTest(31697n, { bases: [3] });
    expect(result.probablePrime).toBe(false);
  });

  it('should not return a divisor if findDivisor=false', async () => {
    const composites = [95n, 41458352833010691n];
    const results = await Promise.all(
      composites.map((n) => primalityTest(n, { findDivisor: false })),
    );
    results.forEach((result) => {
      expect(result.divisor).toBe(undefined);
    });
  });
});
