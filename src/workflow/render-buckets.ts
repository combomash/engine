import {Resolution} from '../types';

export class Bucket {
    [key: string]: any;

    constructor(
        public size: number,
        public pixelBounds: {
            xmin: number;
            xmax: number;
            ymin: number;
            ymax: number;
        },
        public uvBounds: {
            umin: number;
            umax: number;
            vmin: number;
            vmax: number;
        },
    ) {}

    uvOffset() {
        return [this.uvBounds.umin, this.uvBounds.vmin];
    }

    uvScale() {
        return [this.uvBounds.umax - this.uvBounds.umin, this.uvBounds.vmax - this.uvBounds.vmin];
    }
}

export interface RenderBucketsParams {
    bucketSize: number;
    resolution: Resolution;
}

export class RenderBuckets {
    #buckets: Array<Bucket> = [];

    get buckets() {
        return this.#buckets;
    }

    constructor(params: RenderBucketsParams) {
        let bucketSize = Math.max(params.bucketSize, 128);

        const {width, height} = params.resolution;

        let X = 0;
        let xBucketCount = width / bucketSize;
        for (let x = 0; x < width / bucketSize; x++) {
            let Y = 0;
            let yBucketCount = height / bucketSize;
            for (let y = 0; y < height / bucketSize; y++) {
                const size = Math.min(bucketSize, Math.max(width, height));

                const pixelBounds = {
                    xmin: X,
                    xmax: X + size,
                    ymin: Y,
                    ymax: Y + size,
                };

                const uvBounds = {
                    umin: pixelBounds.xmin / width,
                    umax: pixelBounds.xmax / width,
                    vmin: pixelBounds.ymin / height,
                    vmax: pixelBounds.ymax / height,
                };

                this.#buckets.push(new Bucket(size, pixelBounds, uvBounds));

                Y += bucketSize;
                yBucketCount--;
            }

            X += bucketSize;
            xBucketCount--;
        }
    }

    forEachBucket(fn: (bucket: Bucket) => void) {
        for (const bucket of this.#buckets) {
            fn(bucket);
        }
    }
}
