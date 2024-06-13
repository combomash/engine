import {Engine} from '../src';
import {ERR_NOT_INITIALIZED} from '../src/core/engine.errors';

describe('Engine', () => {
    let engine: Engine | null;

    beforeEach(() => {
        engine = new Engine();
    });

    afterEach(() => {
        engine!.shutdown();
        engine = null;
    });

    describe('before calling initialize()', () => {
        test('canvas should be undefined', () => {
            const canvas = engine!.canvas;
            expect(canvas).toBeUndefined();
        });

        test('resolution should be undefined', () => {
            const resolution = engine!.resolution;
            expect(resolution).toBeUndefined();
        });

        test('calling run() should error', async () => {
            await expect(engine!.run()).rejects.toThrow(ERR_NOT_INITIALIZED);
        });
    });

    describe('after calling initialization (no arguments passed)', () => {
        test('canvas should be created', () => {
            engine!.initialize();
            const canvas = engine!.canvas;
            expect(canvas).toBeDefined();
            expect(canvas).toBeInstanceOf(HTMLCanvasElement);
        });

        test('resolution parameters should all have a value of 1', () => {
            engine!.initialize();
            const resolution = engine!.resolution;
            expect(resolution).toBeDefined();

            const {width, height, aspectRatio, devicePixelRatio} = resolution;
            expect(width).toBe(1);
            expect(height).toBe(1);
            expect(aspectRatio).toBe(1);
            expect(devicePixelRatio).toBe(1);
        });
    });
});
