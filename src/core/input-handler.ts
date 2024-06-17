import {Entity} from './entity-manager';

type Target = Window | Document | HTMLCanvasElement | HTMLElement;

class TargetRegistrar {
    static #instance: TargetRegistrar;
    private constructor() {}
    public static get instance(): TargetRegistrar {
        if (!TargetRegistrar.#instance) {
            TargetRegistrar.#instance = new TargetRegistrar();
        }
        return TargetRegistrar.#instance;
    }

    private targets: Array<Target> = [];

    public register(target: Target): boolean {
        if (this.targets.includes(target)) return false;
        this.targets.push(target);
        return true;
    }

    public delist(target: Target): boolean {
        if (this.targets.includes(target)) {
            const index = this.targets.indexOf(target);
            this.targets.splice(index, 1);
            return true;
        }
        return false;
    }
}

// TODO - Replace with registering Bind (UP or DOWN)
// TODO - Add in a continuous method... if you hold 'DOWN'
const KEYSTATE: {[key: string]: number} = {
    WAIT: 0,
    DOWN: 1,
    UP: 2,
};

export class InputHandler implements Entity {
    public isActive: boolean = true;

    private target: Target;
    private keyState: {[key: string]: number} = {};

    handleKeyDown = (e: Event | KeyboardEvent): void => {
        if (e instanceof KeyboardEvent) {
            console.log(e.key);
            console.log(this.keyState);
            this.keyState[e.key] = KEYSTATE.DOWN;
        }
    };

    handleKeyUp = (e: Event | KeyboardEvent): void => {
        if (e instanceof KeyboardEvent) this.keyState[e.key] = KEYSTATE.UP;
    };

    constructor({target}: {target: Target}) {
        if (!TargetRegistrar.instance.register(target)) {
            throw new Error('Target has already been registered');
        }
        this.target = target;

        this.target.addEventListener('keydown', this.handleKeyDown);
        this.target.addEventListener('keyup', this.handleKeyUp);
    }

    lateUpdate() {
        for (const key of Object.keys(this.keyState)) {
            if (this.keyState[key] === KEYSTATE.UP) {
                this.keyState[key] = KEYSTATE.WAIT;
                // TODO replace with a bind to a Command, set back to a NULL
            }
        }
    }

    // TODO - remove this, replace with Command registrations
    getKeyState(key: string) {
        return this.keyState[key];
    }

    destroy() {
        if (!TargetRegistrar.instance.delist(this.target)) {
            throw new Error('InputHandler has already been destroyed');
        }
        this.target.removeEventListener('keydown', this.handleKeyDown);
        this.target.removeEventListener('keyup', this.handleKeyUp);
    }
}
