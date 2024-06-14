import {Timer} from '../src/core/timer';

describe('Timer', () => {
    let timer: Timer;

    let nowCalls = 0;
    let nowMock: jest.SpyInstance<number, []>;

    beforeAll(() => {
        nowMock = jest.spyOn(Timer, 'now').mockImplementation(() => {
            nowCalls++;
            return 1000 * nowCalls;
        });
    });

    afterAll(() => {
        nowMock.mockRestore();
    });

    test('calling the create() method returns a Timer object', () => {
        timer = new Timer();
        expect(timer).toBeInstanceOf(Timer);
    });

    test('calling now (mocked) returns a value of 1000', () => {
        expect(Timer.now()).toBe(1000);
    });

    describe('after creating a timer', () => {
        test('isActive should be false', () => {
            expect(timer.isActive).toBe(false);
        });

        test('delta should be zero', () => {
            expect(timer.delta).toBe(0);
        });

        test('elapsed should be zero', () => {
            expect(timer.elapsed).toBe(0);
        });

        test('calling tick() should not change zero values', () => {
            timer.tick();
            expect(timer.delta).toBe(0);
            expect(timer.elapsed).toBe(0);
        });
    });

    describe('after calling start()', () => {
        beforeAll(() => {
            timer.start();
        });

        test('isActive should be true', () => {
            expect(timer.isActive).toBe(true);
        });

        test('elapsed should be zero', () => {
            expect(timer.elapsed).toBe(0);
        });

        test('delta should be zero', () => {
            expect(timer.delta).toBe(0);
        });
    });

    describe('after calling tick()', () => {
        beforeAll(() => {
            timer.tick();
        });

        test('elapsed should be one (1)', () => {
            expect(timer.elapsed).toBe(1);
        });

        test('delta should be one (1)', () => {
            expect(timer.delta).toBe(1);
        });
    });

    describe('after calling tick() a second time', () => {
        beforeAll(() => {
            timer.tick();
        });

        test('elapsed should be two (2)', () => {
            expect(timer.elapsed).toBe(2);
        });

        test('delta should be one (1)', () => {
            expect(timer.delta).toBe(1);
        });
    });

    describe('after calling stop()', () => {
        beforeAll(() => {
            timer.stop();
        });

        test('isActive should be false', () => {
            expect(timer.isActive).toBe(false);
        });

        test('elapsed should be two (2)', () => {
            expect(timer.elapsed).toBe(2);
        });

        test('delta should be zero', () => {
            expect(timer.delta).toBe(0);
        });

        test('tick() should have no affect on values', () => {
            timer.tick();
            expect(timer.isActive).toBe(false);
            expect(timer.elapsed).toBe(2);
            expect(timer.delta).toBe(0);
        });
    });

    describe('callilng start() after stop(), followed by two tick() calls', () => {
        beforeAll(() => {
            timer.start();
            timer.tick();
            timer.tick();
        });

        test('elapsed should be three (4)', () => {
            expect(timer.elapsed).toBe(4);
        });

        test('delta should be one (1)', () => {
            expect(timer.delta).toBe(1);
        });
    });

    describe('calling reset()', () => {
        beforeAll(() => {
            timer.reset();
        });

        test('isActive should be false', () => {
            expect(timer.isActive).toBe(false);
        });

        test('delta should be zero', () => {
            expect(timer.delta).toBe(0);
        });

        test('elapsed should be zero', () => {
            expect(timer.elapsed).toBe(0);
        });

        test('calling tick() should not change zero values', () => {
            timer.tick();
            expect(timer.delta).toBe(0);
            expect(timer.elapsed).toBe(0);
        });
    });
});
