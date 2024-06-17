type Target = Window | Document | HTMLCanvasElement | HTMLElement;

class TargetRegistrar {
    static #instance: TargetRegistrar;

    private targets: Array<Target> = [];

    private constructor() {}

    public static get instance(): TargetRegistrar {
        if (!TargetRegistrar.#instance) {
            TargetRegistrar.#instance = new TargetRegistrar();
        }
        return TargetRegistrar.#instance;
    }

    public addTarget(target: Target): boolean {
        if (this.targets.includes(target)) return false;
        this.targets.push(target);
        return true;
    }

    public removeTarget(target: Target): boolean {
        if (this.targets.includes(target)) {
            const index = this.targets.indexOf(target);
            this.targets.splice(index, 1);
            return true;
        }
        return false;
    }
}

export class InputHandler {
    private target: Target;

    constructor({target}: {target: Target}) {
        if (!TargetRegistrar.instance.addTarget(target)) {
            throw new Error('Target has already been registered');
        }
        this.target = target;
    }

    destroy() {
        if (!TargetRegistrar.instance.removeTarget(this.target)) {
            throw new Error('InputHandler has already been destroyed');
        }
    }
}
