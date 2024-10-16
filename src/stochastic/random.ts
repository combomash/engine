import {Seed} from '../types';
import {PRNG, PRNG_TYPE, SFC32, SFC64, SFC128} from './prng';

export interface RandomParams {
    seed?: Seed;
    prng?: PRNG_TYPE;
}

export class Random {
    private prng: PRNG;

    constructor(params: RandomParams) {
        const seed = params.seed ?? Random.generateHashSeed();

        let hash = 0;
        if (typeof seed === 'string') {
            for (let i = 0; i < seed.length; i++) {
                const char = seed.charCodeAt(i);
                hash = (hash << 5) - hash + char;
            }
        } else if (typeof seed === 'number') {
            hash = seed;
        }

        switch (params.prng) {
            case 'sfc64':
                this.prng = new SFC64(hash);
                break;
            case 'sfc128':
                this.prng = new SFC128(hash);
                break;
            case 'sfc32':
            default:
                this.prng = new SFC32(hash);
                break;
        }
    }

    // Return a random number
    static generateSeed(digits: number = 10) {
        const min = Math.pow(10, digits - 1);
        const max = Math.pow(10, digits) - 1;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Returns a random hash formatted string
    static generateHashSeed() {
        const chars = '0123456789abcdef';
        let hash = '0x';
        for (let i = 64; i > 0; --i) hash += chars[Math.floor(Math.random() * chars.length)];
        return hash;
    }

    // Returns a number in [0, 1)
    dec(): number {
        return this.prng.nextNumber();
    }

    // Returns a number in [0, 1]
    inc(): number {
        return this.prng.nextNumberInclusive();
    }

    // Returns a number in range [a, b)
    num(a: number, b: number): number {
        return a + this.dec() * (b - a);
    }

    // Return an adjacent number to a in the range of b +/-
    adj(a: number, b: number) {
        return a + this.num(-b, b);
    }

    // Returns an integer in [a, b] (requires a < b)
    int(a: number, b: number): number {
        if (a > b) throw Error('int() requires a < b');
        return Math.floor(a + this.dec() * (b - a + 1));
    }

    // Returns true with probabiliy (0 <= p <= 1)
    bool(p: number): boolean {
        if (p < 0 || p > 1) {
            throw Error('Probability p must be between 0 and 1 inclusive');
        }
        return this.dec() < p;
    }

    // Returns a random element in an array
    pick<T>(arr: T[]): T {
        return arr[this.int(0, arr.length - 1)];
    }
}
