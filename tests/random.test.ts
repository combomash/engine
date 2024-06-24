import {Random} from '../src/stochastic/random';
import {PRNG_TYPE} from '../src/stochastic/prng';

const count = 10;
const iters = (callback: () => void) => {
    for (let i = 0; i < count; i++) callback();
};

const seeds: Array<string | number> = [0, '', 1234567890, 'abcdefghij', 'b92d27235c0ebec949cb7282f580fc48f3faa4ab9866d6795350d6ef2bb0ca4a'];
const PRNG_TYPE: Array<PRNG_TYPE> = ['sfc32', 'sfc64', 'sfc128'];

describe('Random', () => {
    let random: Random;

    test('creating random with seed:"0" and no prng specified succeeds', () => {
        expect(() => {
            new Random({seed: 0});
        }).not.toThrow();
    });

    test('int() throws an error when a > b', () => {
        expect(() => {
            random.int(10, 1);
        }).toThrow();
    });

    test('bool() throws an error when p < 0', () => {
        expect(() => {
            random.bool(-0.01);
        }).toThrow();
    });

    test('bool() throws an error when p > 1', () => {
        expect(() => {
            random.bool(1.01);
        }).toThrow();
    });

    for (const prng of PRNG_TYPE) {
        describe(`using PRNG: ${prng}`, () => {
            for (const seed of seeds) {
                describe(`using seed:${seed} (type:${typeof seed})`, () => {
                    test('creating Random succeeds', () => {
                        expect(() => {
                            random = new Random({seed, prng});
                        }).not.toThrow();
                        expect(random).toBeInstanceOf(Random);
                    });

                    test('dec() returns a value between 0 and 1 exclusive', () => {
                        iters(() => {
                            const v = random.dec();
                            expect(v).toBeGreaterThanOrEqual(0);
                            expect(v).toBeLessThan(1);
                        });
                    });

                    test('inc() returns a value between 0 and 1 inclusive', () => {
                        iters(() => {
                            const v = random.inc();
                            expect(v).toBeGreaterThanOrEqual(0);
                            expect(v).toBeLessThanOrEqual(1);
                        });
                    });

                    test('num() returns a number between 1 and 100 exclusive', () => {
                        iters(() => {
                            const v = random.num(1, 100);
                            expect(v).toBeGreaterThanOrEqual(1);
                            expect(v).toBeLessThan(100);
                        });
                    });

                    test('adj() return a number between -10 and 10, given a=0 and b=10', () => {
                        iters(() => {
                            const v = random.adj(0, 10);
                            expect(v).toBeGreaterThanOrEqual(-10);
                            expect(v).toBeLessThan(10);
                        });
                    });

                    test('int() returns an integer between 1 and 10 inclusive', () => {
                        iters(() => {
                            const v = random.int(1, 10);
                            expect(v).toBeGreaterThanOrEqual(1);
                            expect(v).toBeLessThanOrEqual(10);
                            expect(Number.isInteger(v)).toBeTruthy();
                        });
                    });

                    test('bool() returns a true or false statement', () => {
                        expect(() => {
                            random.bool(0.5);
                        }).not.toThrow();
                    });

                    test('pick() returns an element within the array', () => {
                        const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
                        iters(() => {
                            const v = random.pick(arr);
                            expect(arr.includes(v)).toBeTruthy();
                        });
                    });
                });
            }
        });
    }
});
