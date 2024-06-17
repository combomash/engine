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

export class InputHandler implements Entity {
    private target: Target;

    constructor({target}: {target: Target}) {
        if (!TargetRegistrar.instance.register(target)) {
            throw new Error('Target has already been registered');
        }
        this.target = target;
    }

    public isActive: boolean = true;

    destroy() {
        if (!TargetRegistrar.instance.delist(this.target)) {
            throw new Error('InputHandler has already been destroyed');
        }
    }
}
