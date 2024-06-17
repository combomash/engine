import {InputHandler} from '../src/handlers/input-handler';

describe('Input Handler', () => {
    let div: HTMLElement;
    let canvas: HTMLCanvasElement;
    let inputHandlers: {[key: string]: InputHandler} = {};

    beforeAll(() => {
        div = document.createElement('div');
        document.body.appendChild(div);

        canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
    });

    afterAll(() => {
        document.body.removeChild(div);
        document.body.removeChild(canvas);
    });

    describe('can create', () => {
        test('with "window" as target', () => {
            let inputHandler!: InputHandler;
            expect(() => {
                inputHandler = new InputHandler({
                    target: window,
                });
            }).not.toThrow();
            inputHandlers['window'] = inputHandler;
        });

        test('with "document" as target', () => {
            let inputHandler!: InputHandler;
            expect(() => {
                inputHandler = new InputHandler({
                    target: document,
                });
            }).not.toThrow();
            inputHandlers['document'] = inputHandler;
        });

        test('with "canvas" as target', () => {
            let inputHandler!: InputHandler;
            expect(() => {
                inputHandler = new InputHandler({
                    target: canvas,
                });
            }).not.toThrow();
            inputHandlers['canvas'] = inputHandler;
        });

        test('with "div" as target', () => {
            let inputHandler!: InputHandler;
            expect(() => {
                inputHandler = new InputHandler({
                    target: div,
                });
            }).not.toThrow();
            inputHandlers['div'] = inputHandler;
        });

        test('width a second "div" as target, then destroy to cleanup', () => {
            const elem = document.createElement('div');

            let inputHandler!: InputHandler;

            expect(() => {
                inputHandler = new InputHandler({
                    target: elem,
                });
            }).not.toThrow();

            expect(() => {
                inputHandler.destroy();
            }).not.toThrow();
        });
    });

    describe('cannot create duplicate', () => {
        test('"window" as target', () => {
            expect(() => {
                new InputHandler({
                    target: window,
                });
            }).toThrow();
        });

        test('"document" as target', () => {
            expect(() => {
                new InputHandler({
                    target: document,
                });
            }).toThrow();
        });

        test('"canvas" as target', () => {
            expect(() => {
                new InputHandler({
                    target: canvas,
                });
            }).toThrow();
        });

        test('"div" as target', () => {
            expect(() => {
                new InputHandler({
                    target: div,
                });
            }).toThrow();
        });
    });

    test('can destroy the "document" InputHandler and create a new one with the same "document" element', () => {
        let inputHandler = inputHandlers['document'];

        expect(() => {
            inputHandler.destroy();
        }).not.toThrow();

        delete inputHandlers['document'];

        expect(() => {
            inputHandler = new InputHandler({
                target: document,
            });
        }).not.toThrow();

        inputHandlers['document'] = inputHandler;
    });

    describe('when destroying...', () => {
        test('can destroy with "div" target', () => {
            let inputHandler = inputHandlers['div'];
            expect(() => {
                inputHandler.destroy();
            }).not.toThrow();
        });

        test('calling destroy() on already destroyed throws an Error', () => {
            let inputHandler = inputHandlers['div'];
            expect(() => {
                inputHandler.destroy();
            }).toThrow();
            delete inputHandlers['div'];
        });

        test('can destroy with "window" target', () => {
            let inputHandler = inputHandlers['window'];
            expect(() => {
                inputHandler.destroy();
            }).not.toThrow();
            delete inputHandlers['window'];
        });

        test('can destroy with "canvas" target', () => {
            let inputHandler = inputHandlers['canvas'];
            expect(() => {
                inputHandler.destroy();
            }).not.toThrow();
            delete inputHandlers['canvas'];
        });

        test('can destroy with "document" target', () => {
            let inputHandler = inputHandlers['document'];
            expect(() => {
                inputHandler.destroy();
            }).not.toThrow();
            delete inputHandlers['document'];
        });
    });
});
