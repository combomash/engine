import {Clock} from '../src/core/clock';

describe('Clock', () => {
    let clock: Clock;

    let nowCalls = 0;
    let nowMock: jest.SpyInstance<number, []>;

    beforeAll(() => {
        nowMock = jest.spyOn(Clock, 'now').mockImplementation(() => {
            nowCalls++;
            return 1000 * nowCalls;
        });
    });

    afterAll(() => {
        nowMock.mockRestore();
    });

    test('calling the create() method returns a Clock object', () => {
        clock = new Clock();
        expect(clock).toBeInstanceOf(Clock);
    });

    test('calling now (mocked) returns a value of 1000', () => {
        expect(Clock.now()).toBe(1000);
    });

    describe('after creating a clock', () => {
        test('isActive should be false', () => {
            expect(clock.isActive).toBe(false);
        });

        test('delta should be zero', () => {
            expect(clock.delta).toBe(0);
        });

        test('elapsed should be zero', () => {
            expect(clock.elapsed).toBe(0);
        });

        test('calling tick() should not change zero values', () => {
            clock.tick();
            expect(clock.delta).toBe(0);
            expect(clock.elapsed).toBe(0);
        });
    });

    describe('after calling start()', () => {
        beforeAll(() => {
            clock.start();
        });

        test('isActive should be true', () => {
            expect(clock.isActive).toBe(true);
        });

        test('elapsed should be zero', () => {
            expect(clock.elapsed).toBe(0);
        });

        test('delta should be zero', () => {
            expect(clock.delta).toBe(0);
        });
    });

    describe('after calling tick()', () => {
        beforeAll(() => {
            clock.tick();
        });

        test('elapsed should be one (1)', () => {
            expect(clock.elapsed).toBe(1);
        });

        test('delta should be one (1)', () => {
            expect(clock.delta).toBe(1);
        });
    });

    describe('after calling tick() a second time', () => {
        beforeAll(() => {
            clock.tick();
        });

        test('elapsed should be two (2)', () => {
            expect(clock.elapsed).toBe(2);
        });

        test('delta should be one (1)', () => {
            expect(clock.delta).toBe(1);
        });
    });

    describe('after calling stop()', () => {
        beforeAll(() => {
            clock.stop();
        });

        test('isActive should be false', () => {
            expect(clock.isActive).toBe(false);
        });

        test('elapsed should be two (2)', () => {
            expect(clock.elapsed).toBe(2);
        });

        test('delta should be zero', () => {
            expect(clock.delta).toBe(0);
        });

        test('tick() should have no affect on values', () => {
            clock.tick();
            expect(clock.isActive).toBe(false);
            expect(clock.elapsed).toBe(2);
            expect(clock.delta).toBe(0);
        });
    });

    describe('callilng start() after stop(), followed by two tick() calls', () => {
        beforeAll(() => {
            clock.start();
            clock.tick();
            clock.tick();
        });

        test('elapsed should be three (4)', () => {
            expect(clock.elapsed).toBe(4);
        });

        test('delta should be one (1)', () => {
            expect(clock.delta).toBe(1);
        });
    });

    describe('calling reset()', () => {
        beforeAll(() => {
            clock.reset();
        });

        test('isActive should be false', () => {
            expect(clock.isActive).toBe(false);
        });

        test('delta should be zero', () => {
            expect(clock.delta).toBe(0);
        });

        test('elapsed should be zero', () => {
            expect(clock.elapsed).toBe(0);
        });

        test('calling tick() should not change zero values', () => {
            clock.tick();
            expect(clock.delta).toBe(0);
            expect(clock.elapsed).toBe(0);
        });
    });
});
