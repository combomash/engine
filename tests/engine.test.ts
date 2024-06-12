import Engine from '../src/index';

describe('Engine instantiation', () => {
    test('returns a string correctly', () => {
        const engine = new Engine();
        const result = engine.hello('World');
        expect(result).toBe('Hello, World!');
    });
});
