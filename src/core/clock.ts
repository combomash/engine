export class Clock {
    #isActive: boolean = false;
    #isAtRest: boolean = true;
    #previous: number = 0;
    #current: number = 0;
    #start: number = 0;
    #delta: number = 0;
    #elapsed: number = 0;

    constructor() {
        if (typeof document !== 'undefined' && document.hidden !== undefined) {
            document.addEventListener('visibilitychange', this.handleVisibilityChange, false);
        }
    }

    private handleVisibilityChange = () => {
        if (document.visibilityState == 'visible') {
            this.#current = Clock.now() - this.#start;
        }
    };

    static now = () => (typeof performance === 'undefined' ? Date : performance).now();

    get isActive() {
        return this.#isActive;
    }

    get delta() {
        return this.#delta;
    }

    get elapsed() {
        return this.#elapsed;
    }

    setInitialElapsedTime(ms: number) {
        if (!this.#isAtRest) throw Error('Clock must not be active and reset() to set initial elapsed time');
        this.#elapsed = ms;
    }

    start() {
        if (this.#isActive) return;
        const now = Clock.now();
        this.#start = now;
        this.#current = now - this.#start;
        this.#isActive = true;
        this.#isAtRest = false;
    }

    stop() {
        if (!this.#isActive) return;
        this.#isActive = false;
        this.#delta = 0;
    }

    reset() {
        this.#isActive = false;
        this.#isAtRest = true;
        this.#previous = 0;
        this.#current = 0;
        this.#start = 0;
        this.#delta = 0;
        this.#elapsed = 0;
    }

    tick() {
        if (!this.#isActive) return;
        this.#previous = this.#current;
        this.#current = Clock.now() - this.#start;
        this.#delta = this.#current - this.#previous;
        this.#elapsed += this.#delta;
    }

    destroy() {
        this.stop();
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
}
