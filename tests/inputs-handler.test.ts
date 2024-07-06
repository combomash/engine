import {InputsHandler} from '../src/interaction/inputs-handler';

describe('Input Handler', () => {
    let div: HTMLElement;
    let canvas: HTMLCanvasElement;
    let inputsHandlers: {[key: string]: InputsHandler} = {};

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
            let inputHandler!: InputsHandler;
            expect(() => {
                inputHandler = new InputsHandler({
                    target: window,
                });
            }).not.toThrow();
            inputsHandlers['window'] = inputHandler;
        });

        test('with "document" as target', () => {
            let inputHandler!: InputsHandler;
            expect(() => {
                inputHandler = new InputsHandler({
                    target: document,
                });
            }).not.toThrow();
            inputsHandlers['document'] = inputHandler;
        });

        test('with "canvas" as target', () => {
            let inputHandler!: InputsHandler;
            expect(() => {
                inputHandler = new InputsHandler({
                    target: canvas,
                });
            }).not.toThrow();
            inputsHandlers['canvas'] = inputHandler;
        });

        test('with "div" as target', () => {
            let inputHandler!: InputsHandler;
            expect(() => {
                inputHandler = new InputsHandler({
                    target: div,
                });
            }).not.toThrow();
            inputsHandlers['div'] = inputHandler;
        });

        test('width a second "div" as target, then destroy to cleanup', () => {
            const elem = document.createElement('div');

            let inputHandler!: InputsHandler;

            expect(() => {
                inputHandler = new InputsHandler({
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
                new InputsHandler({
                    target: window,
                });
            }).toThrow();
        });

        test('"document" as target', () => {
            expect(() => {
                new InputsHandler({
                    target: document,
                });
            }).toThrow();
        });

        test('"canvas" as target', () => {
            expect(() => {
                new InputsHandler({
                    target: canvas,
                });
            }).toThrow();
        });

        test('"div" as target', () => {
            expect(() => {
                new InputsHandler({
                    target: div,
                });
            }).toThrow();
        });
    });

    test('can destroy the "document" InputsHandler and create a new one with the same "document" element', () => {
        let inputHandler = inputsHandlers['document'];

        expect(() => {
            inputHandler.destroy();
        }).not.toThrow();

        delete inputsHandlers['document'];

        expect(() => {
            inputHandler = new InputsHandler({
                target: document,
            });
        }).not.toThrow();

        inputsHandlers['document'] = inputHandler;
    });

    describe('when destroying...', () => {
        test('can destroy with "div" target', () => {
            let inputHandler = inputsHandlers['div'];
            expect(() => {
                inputHandler.destroy();
            }).not.toThrow();
        });

        test('calling destroy() on already destroyed throws an Error', () => {
            let inputHandler = inputsHandlers['div'];
            expect(() => {
                inputHandler.destroy();
            }).toThrow();
            delete inputsHandlers['div'];
        });

        test('can destroy with "window" target', () => {
            let inputHandler = inputsHandlers['window'];
            expect(() => {
                inputHandler.destroy();
            }).not.toThrow();
            delete inputsHandlers['window'];
        });

        test('can destroy with "canvas" target', () => {
            let inputHandler = inputsHandlers['canvas'];
            expect(() => {
                inputHandler.destroy();
            }).not.toThrow();
            delete inputsHandlers['canvas'];
        });

        test('can destroy with "document" target', () => {
            let inputHandler = inputsHandlers['document'];
            expect(() => {
                inputHandler.destroy();
            }).not.toThrow();
            delete inputsHandlers['document'];
        });
    });
});
