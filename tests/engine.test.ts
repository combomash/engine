import {Engine} from '../src';
import * as ERR from '../src/core/engine.errors';

describe('Engine', () => {
    let engine: Engine | null;

    beforeEach(() => {
        global.innerWidth = 100;
        global.innerHeight = 50;
        global.devicePixelRatio = 2;
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
            await expect(engine!.run()).rejects.toThrow(ERR.NOT_INITIALIZED);
        });
    });

    describe('after calling initialization (no arguments passed)', () => {
        let engine: Engine | null;

        beforeAll(() => {
            engine = new Engine();
            engine!.init();
        });

        afterAll(() => {
            engine!.shutdown();
            engine = null;
        });

        test('canvas should be created', () => {
            const canvas = engine!.canvas;
            expect(canvas).toBeDefined();
            expect(canvas).toBeInstanceOf(HTMLCanvasElement);
        });

        describe('resolution parameters...', () => {
            test('width should be the window innerWidth x devicePixelRatio (200)', () => {
                expect(engine!.resolution.width).toBe(200);
            });

            test('height should be the window innerHeight x devicePixelRatio (100)', () => {
                expect(engine!.resolution.height).toBe(100);
            });

            test('aspectRatio should be window.innerHeight / window.innerWidth (2)', () => {
                expect(engine!.resolution.aspectRatio).toBe(2);
            });

            test('devicePixelRatio should be the window devicePixelRatio (2)', () => {
                expect(engine!.resolution.devicePixelRatio).toBe(2);
            });
        });
    });
});
