export class Clock {
    #isActive: boolean = false;
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

    public static now = () => (typeof performance === 'undefined' ? Date : performance).now();

    public get isActive() {
        return this.#isActive;
    }

    public get delta() {
        return this.#delta / 1000;
    }

    public get elapsed() {
        return this.#elapsed / 1000;
    }

    public start() {
        if (this.#isActive) return;
        const now = Clock.now();
        this.#start = now;
        this.#current = now - this.#start;
        this.#isActive = true;
    }

    public stop() {
        if (!this.#isActive) return;
        this.#isActive = false;
        this.#delta = 0;
    }

    public reset() {
        this.#isActive = false;
        this.#previous = 0;
        this.#current = 0;
        this.#start = 0;
        this.#delta = 0;
        this.#elapsed = 0;
    }

    public tick() {
        if (!this.#isActive) return;
        this.#previous = this.#current;
        this.#current = Clock.now() - this.#start;
        this.#delta = this.#current - this.#previous;
        this.#elapsed += this.#delta;
    }

    public destroy() {
        this.stop();
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
}
