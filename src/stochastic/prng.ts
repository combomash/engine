export type PRNG_TYPE = 'sfc32' | 'sfc64' | 'sfc128';

export interface PRNG {
    nextNumber: () => number;
    nextNumberInclusive: () => number;
}

export class SFC32 implements PRNG {
    private state: Uint32Array;

    constructor(seed: number) {
        this.state = new Uint32Array(4);
        this.state[0] = seed | 0x01;
        this.state[1] = this.rotl(this.state[0], 11);
        this.state[2] = this.rotl(this.state[1], 19);
        this.state[3] = this.rotl(this.state[2], 8);
    }

    private rotl(x: number, k: number): number {
        return (x << k) | (x >>> (32 - k)); // Ensure unsigned shift for right rotation
    }

    private next(): number {
        const t = this.state[0] ^ (this.state[0] << 11);
        this.state[0] = this.state[1];
        this.state[1] = this.state[2];
        this.state[2] = this.state[3];
        return (this.state[3] = (this.state[3] ^ (this.state[3] >>> 19) ^ (t ^ (t >>> 8))) >>> 0); // Ensure unsigned shift
    }

    // Returns a number in [0, 1)
    public nextNumber(): number {
        return this.next() / 0x100000000; // 2^32
    }

    // Returns a number in [0, 1]
    public nextNumberInclusive(): number {
        return this.next() / 0xffffffff; // 2^32 - 1
    }
}

export class SFC64 implements PRNG {
    private state: Uint32Array;

    constructor(seed: number) {
        this.state = new Uint32Array(8); // State size of 8, 256 bits total
        this.state[0] = seed | 0x01;
        for (let i = 1; i < 8; i++) {
            this.state[i] = this.rotl(this.state[i - 1] ^ seed, 25) + i;
        }
    }

    private rotl(x: number, k: number): number {
        return (x << k) | (x >>> (32 - k)); // Ensure unsigned shift for right rotation
    }

    private next(): number {
        const result = this.state[0] + this.state[4];
        const t = this.state[1] << 9;

        this.state[2] ^= this.state[0];
        this.state[5] ^= this.state[1];
        this.state[1] ^= this.state[2];
        this.state[6] ^= this.state[3];
        this.state[3] ^= this.state[4];
        this.state[4] ^= this.state[5];
        this.state[5] ^= this.state[6];
        this.state[6] ^= this.state[7];
        this.state[7] ^= this.state[0];
        this.state[0] = this.rotl(this.state[0], 11);
        return result >>> 0;
    }

    // Returns a number in [0, 1)
    public nextNumber(): number {
        return this.next() / 0x100000000; // 2^32
    }

    // Returns a number in [0, 1]
    public nextNumberInclusive(): number {
        return this.next() / 0xffffffffffffffff; // 2^64 - 1
    }
}

export class SFC128 implements PRNG {
    private state: Uint32Array;

    constructor(seed: number) {
        this.state = new Uint32Array(16); // State size of 16, 512 bits total
        this.seedWithSingleNumber(seed);
    }

    private seedWithSingleNumber(seed: number): void {
        const seedArray: number[] = [];

        // Split the seed into four 32-bit segments
        for (let i = 0; i < 4; i++) {
            seedArray.push((seed >>> (i * 32)) & 0xffffffff);
        }

        // Initialize state using the seed array
        for (let i = 0; i < 4; i++) {
            this.state[i] = seedArray[i] | 0x01;
        }
        for (let i = 4; i < 16; i++) {
            this.state[i] = this.rotl(this.state[i - 1] ^ seedArray[i % 4], 25) + i;
        }
    }

    private rotl(x: number, k: number): number {
        return (x << k) | (x >>> (32 - k)); // Ensure unsigned shift for right rotation
    }

    private next(): number {
        const result = this.state[0] + this.state[8];
        const t = this.state[1] << 9;

        this.state[2] ^= this.state[0];
        this.state[5] ^= this.state[1];
        this.state[1] ^= this.state[2];
        this.state[6] ^= this.state[3];
        this.state[3] ^= this.state[4];
        this.state[4] ^= this.state[5];
        this.state[5] ^= this.state[6];
        this.state[6] ^= this.state[7];
        this.state[7] ^= this.state[0];
        this.state[0] = this.rotl(this.state[0], 11);
        return result >>> 0;
    }

    // Returns a number in [0, 1)
    public nextNumber(): number {
        return this.next() / 0x100000000; // 2^32
    }

    // Returns a number in [0, 1]
    public nextNumberInclusive(): number {
        return this.next() / 0xffffffffffffffffffffffffffffffff; // 2^128 - 1
    }
}
