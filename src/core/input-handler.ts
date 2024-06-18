import {Entity} from './entity-manager-interfaces';
import {KeyBind} from './input-handler.interfaces';
import {validActionTypes, validKeyCodes} from './input-handler.constants';

export type Target = Window | Document | HTMLCanvasElement | HTMLElement;

export interface Command {
    execute(): void;
}

class TargetRegistrar {
    static #instance: TargetRegistrar;
    private constructor() {}
    static get instance(): TargetRegistrar {
        if (!TargetRegistrar.#instance) {
            TargetRegistrar.#instance = new TargetRegistrar();
        }
        return TargetRegistrar.#instance;
    }

    private targets: Array<Target> = [];

    register(target: Target): boolean {
        if (this.targets.includes(target)) return false;
        this.targets.push(target);
        return true;
    }

    delist(target: Target): boolean {
        if (!this.targets.includes(target)) return false;
        const index = this.targets.indexOf(target);
        this.targets.splice(index, 1);
        return true;
    }
}

export class InputHandler implements Entity {
    isActive: boolean = true;

    private target: Target;

    private keyLock: boolean = false;
    private keyBinds: {[key: string]: KeyBind} = {};

    private commandsToExecute: Array<Command> = [];

    constructor({target}: {target: Target}) {
        if (!TargetRegistrar.instance.register(target)) {
            throw new Error('Target has already been registered');
        }
        this.target = target;
        this.target.addEventListener('keydown', this.handleKeyDown);
        this.target.addEventListener('keyup', this.handleKeyUp);
    }

    isKeyBound(key: string) {
        return Object.keys(this.keyBinds).includes(key);
    }

    bindKey(bind: KeyBind) {
        const {key, action} = bind;

        if (!this.isValidKeyCode(key)) {
            throw new Error(`Key ${key} is not a valid Key Code`);
        }

        if (!this.isValidActionType(action)) {
            throw new Error(`ActionType ${action} is not a valid Action Key Code`);
        }

        if (!this.isKeyBound(key)) {
            this.keyBinds[key] = bind;
        } else {
            throw new Error(`Key ${key} is already bound, unbind first!`);
        }
    }

    unbindKey(key: string) {
        if (this.isKeyBound(key)) {
            delete this.keyBinds[key];
        } else {
            throw new Error(`Key ${key} was not bound`);
        }
    }

    private handleKeyDown = (e: Event | KeyboardEvent): void => {
        if (e instanceof KeyboardEvent) {
            const {key} = e;
            if (this.isKeyBound(key) && !this.keyLock) {
                const bind = this.keyBinds[key];
                if (bind.action !== 'hold' && e.repeat) return;
                if (bind.action === 'down' || bind.action === 'hold') bind.state = true;
            }
        }
    };

    private handleKeyUp = (e: Event | KeyboardEvent): void => {
        if (e instanceof KeyboardEvent) {
            const {key} = e;
            if (this.isKeyBound(key) && !this.keyLock) {
                const bind = this.keyBinds[key];
                if (bind.action === 'hold') bind.state = null;
                else if (bind.action === 'up') bind.state = true;
            }
        }
    };

    private isValidKeyCode(key: string): boolean {
        return validKeyCodes.has(key);
    }

    private isValidActionType(action: string): boolean {
        return validActionTypes.has(action);
    }

    update() {
        this.keyLock = true;

        for (const key of Object.keys(this.keyBinds)) {
            const bind = this.keyBinds[key];
            if (bind.state) {
                this.commandsToExecute.push(bind.command);
                if (bind.action === 'up' || bind.action === 'down') {
                    bind.state = null;
                }
            }
        }

        while (this.commandsToExecute.length > 0) {
            const command = this.commandsToExecute.pop();
            command?.execute();
        }

        this.keyLock = false;
    }

    destroy() {
        if (!TargetRegistrar.instance.delist(this.target)) {
            throw new Error('InputHandler has already been destroyed');
        }

        this.target.removeEventListener('keydown', this.handleKeyDown);
        this.target.removeEventListener('keyup', this.handleKeyUp);
    }
}
