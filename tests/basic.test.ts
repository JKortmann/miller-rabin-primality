import { primalityTest } from '../src/index.js';
import { describe, it, expect } from 'vitest';

describe('small cases', () => {
  it('should not label 0 probable prime', async () => {
    const result = await primalityTest(0);
    expect(result.probablePrime).toBe(false);
  });

  it('should not label 1 probable prime', async () => {
    const result = await primalityTest(1);
    expect(result.probablePrime).toBe(false);
  });

  it('should correctly label small primes as probable primes', async () => {
    const smallOddPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
    const results = await Promise.all(
      smallOddPrimes.map((p) => primalityTest(p)),
    );
    results.forEach((result) => {
      expect(result.probablePrime).toBe(true);
    });
  });

  it('should correctly label small odd composite numbers as composite', async () => {
    const smallOddComposites = [9, 15, 21, 25, 27, 33, 35];
    const results = await Promise.all(
      smallOddComposites.map((n) => primalityTest(n)),
    );
    results.forEach((result) => {
      expect(result.probablePrime).toBe(false);
    });
  });
});

describe('large cases', () => {
  it('should correctly label large primes as probable primes', async () => {
    const largePrimes = [
      482398747n,
      120371948791827323n,
      18946997824225017722021425122738127657874530527352426816501085067223n,
    ];
    const results = await Promise.all(largePrimes.map((p) => primalityTest(p)));
    results.forEach((result) => {
      expect(result.probablePrime).toBe(true);
    });
  });

  it('should correctly label large composite numbers as composite', async () => {
    const largeComposites = [
      565122993n,
      6282987234087503937n,
      83920982304875092830927350109182130197359081723098365091823916821n,
    ];
    const results = await Promise.all(
      largeComposites.map((n) => primalityTest(n)),
    );
    results.forEach((result) => {
      expect(result.probablePrime).toBe(false);
    });
  });
});

describe('huge cases', () => {
  it('should correctly label huge numbers (on the scale of 2^600)', async () => {
    const hugePrime =
      4149515568880992958512407863691161151012446232242436899995657329690652811412908146399707048947103794288197886611300789182395151075411775307886874834113963687061181803401509523685281n;
    const hugeComp =
      4295112606385589202670737964171552770346216275479013633328838288627166945146694397150573962945247787070239917720469237925637086200864820055532028337065330833975609235099808104498899n;
    const results = await Promise.all([
      primalityTest(hugePrime),
      primalityTest(hugeComp),
    ]);
    expect(results[0].probablePrime).toBe(true);
    expect(results[1].probablePrime).toBe(false);
  });
});

describe('even cases', () => {
  it('should correctly label even numbers greater than 2 as composite', async () => {
    const evens = [4n, 623872n, 3020209137492837423487530n];
    const results = await Promise.all(evens.map((n) => primalityTest(n)));
    results.forEach((result) => {
      expect(result.probablePrime).toBe(false);
    });
  });
});

describe('different input types', () => {
  it('should correctly label inputs specified as a primitive number', async () => {
    const result1 = await primalityTest(8327981);
    expect(result1.probablePrime).toBe(false);
    const result2 = await primalityTest(8327983);
    expect(result2.probablePrime).toBe(true);
  });

  it('should correctly label inputs specified as a string', async () => {
    const result1 = await primalityTest('8327981');
    expect(result1.probablePrime).toBe(false);
    const result2 = await primalityTest('8327983');
    expect(result2.probablePrime).toBe(true);
  });

  it('should correctly label inputs specified as a primitive BigInt', async () => {
    const result1 = await primalityTest(8327981n);
    expect(result1.probablePrime).toBe(false);
    const result2 = await primalityTest(8327983n);
    expect(result2.probablePrime).toBe(true);
  });
});

describe('check for valid divisors', () => {
  it('should always return prime p as a divisor when the input is p^2', async () => {
    const primes = [101n, 1203981240941n, 7382749857293847288803n];
    const results = await Promise.all(
      primes.map((p) => primalityTest(p ** 2n, { findDivisor: true })),
    );

    results.forEach((result, index) => {
      expect(result.probablePrime).toBe(false);
      expect(result.divisor).toBe(primes[index]);
    });
  });

  it('should always return either no divisor at all or a valid non-trivial divisor of the input', async () => {
    const composites = [14911n, 239875n, 41612447n];
    await Promise.all(
      composites.map(async (n) => {
        const result = await primalityTest(n, { findDivisor: true });
        return (
          (result.probablePrime == false &&
            expect(result.divisor).not.oneOf([1n, n]) && // Divisor should not be 1 or equal to the input
            result.divisor === null) ||
          (result.divisor && n % result.divisor === 0n)
        ); // It's either null or it divides n
      }),
    );
  });
});
