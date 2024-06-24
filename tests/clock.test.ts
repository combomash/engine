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

    test('setting the initial elapsed time (ms) succeeds', () => {
        expect(() => {
            clock.setInitialElapsedTime(1000);
        }).not.toThrow();
        expect(clock.elapsed).toEqual(1000);

        expect(() => {
            clock.setInitialElapsedTime(0);
        }).not.toThrow();
        expect(clock.elapsed).toEqual(0);
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

        test('setting the initial elapsed time fails', () => {
            expect(() => {
                clock.setInitialElapsedTime(1000);
            }).toThrow();
        });
    });

    describe('after calling tick()', () => {
        beforeAll(() => {
            clock.tick();
        });

        test('elapsed should be one thousand ms (1000)', () => {
            expect(clock.elapsed).toBe(1000);
        });

        test('delta should be one thousand ms (1000)', () => {
            expect(clock.delta).toBe(1000);
        });

        test('setting the initial elapsed time fails', () => {
            expect(() => {
                clock.setInitialElapsedTime(1000);
            }).toThrow();
        });
    });

    describe('after calling tick() a second time', () => {
        beforeAll(() => {
            clock.tick();
        });

        test('elapsed should be two thousand ms (2000)', () => {
            expect(clock.elapsed).toBe(2000);
        });

        test('delta should be one thousand ms (1000)', () => {
            expect(clock.delta).toBe(1000);
        });
    });

    describe('after calling stop()', () => {
        beforeAll(() => {
            clock.stop();
        });

        test('isActive should be false', () => {
            expect(clock.isActive).toBe(false);
        });

        test('elapsed should be two thousand ms (2000)', () => {
            expect(clock.elapsed).toBe(2000);
        });

        test('delta should be zero', () => {
            expect(clock.delta).toBe(0);
        });

        test('tick() should have no affect on values', () => {
            clock.tick();
            expect(clock.isActive).toBe(false);
            expect(clock.elapsed).toBe(2000);
            expect(clock.delta).toBe(0);
        });

        test('setting the initial elapsed time fails', () => {
            expect(() => {
                clock.setInitialElapsedTime(1000);
            }).toThrow();
        });
    });

    describe('callilng start() after stop(), followed by two tick() calls', () => {
        beforeAll(() => {
            clock.start();
            clock.tick();
            clock.tick();
        });

        test('elapsed should be four thousand ms (4000)', () => {
            expect(clock.elapsed).toBe(4000);
        });

        test('delta should be one thousand ms (1000)', () => {
            expect(clock.delta).toBe(1000);
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

        test('setting the initial elapsed time succeeds', () => {
            expect(() => {
                clock.setInitialElapsedTime(1000);
            }).not.toThrow();
            expect(clock.elapsed).toBe(1000);
        });
    });
});
