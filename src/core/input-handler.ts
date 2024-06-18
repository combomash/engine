import {Entity} from './entity-manager-interfaces';
import {Bind} from './input-handler.interfaces';
import {validActions, validKeyActions, validKeys, validMouseEvents, validTouchEvents} from './input-handler.constants';

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

    private lock: boolean = false;

    private binds: {[key: string]: Bind} = {};
    private deferredStateChanges: Array<{bind: Bind; newState: true | null}> = [];
    private commandsToExecute: Array<Command> = [];

    // TODO - add an object that tracks event listeners, only add them as binds require them

    constructor({target}: {target: Target}) {
        if (!TargetRegistrar.instance.register(target)) {
            throw new Error('Target has already been registered');
        }
        this.target = target;
        this.target.addEventListener('keydown', this.handleKeyDown);
        this.target.addEventListener('keyup', this.handleKeyUp);
        this.target.addEventListener('click', this.handleClick);
        this.target.addEventListener('dblclick', this.handleDblClick);
    }

    private handleKeyDown = (e: Event | KeyboardEvent): void => {
        if (e instanceof KeyboardEvent) {
            const {key} = e;
            if (this.isBound(key)) {
                const bind = this.binds[key];
                if (bind.action !== 'hold' && e.repeat) return;

                let newState = bind.state;
                if (bind.action === 'down' || bind.action === 'hold') newState = true;

                if (this.lock) {
                    this.deferredStateChanges.push({bind, newState});
                    return;
                }

                bind.state = newState;
            }
        }
    };

    private handleKeyUp = (e: Event | KeyboardEvent): void => {
        if (e instanceof KeyboardEvent) {
            const {key} = e;
            if (this.isBound(key)) {
                const bind = this.binds[key];

                let newState = bind.state;
                if (bind.action === 'hold') newState = null;
                else if (bind.action === 'up') newState = true;

                if (this.lock) {
                    this.deferredStateChanges.push({bind, newState});
                    return;
                }

                bind.state = newState;
            }
        }
    };

    private handleClick = (e: Event | PointerEvent): void => {
        if (e instanceof PointerEvent) {
            if (this.isBound('click')) {
                const bind = this.binds['click'];

                let newState = true;

                if (this.lock) {
                    this.deferredStateChanges.push({bind, newState});
                    return;
                }

                bind.state = newState;
            }
        }
    };

    private handleDblClick = (e: Event | MouseEvent): void => {
        if (e instanceof MouseEvent) {
            if (this.isBound('dblclick')) {
                const bind = this.binds['dblclick'];

                let newState = true;

                if (this.lock) {
                    this.deferredStateChanges.push({bind, newState});
                    return;
                }

                bind.state = newState;
            }
        }
    };

    // private handleTouchStart = (e: Event | TouchEvent): void => {}; // TODO
    // private handleTouchEnd = (e: Event | TouchEvent): void => {}; // TODO

    isBound(key: string) {
        return Object.keys(this.binds).includes(key);
    }

    bind(bind: Bind) {
        const {key, action} = bind;

        if (!this.isValidKey(key)) {
            throw new Error(`Bind key ${key} is not valid`);
        }

        if (!this.isValidAction(action)) {
            throw new Error(`Action ${action} is not valid`);
        }

        if (!validKeyActions.has(action)) {
            if (!this.isValidMouseOrTouch(key, action)) {
                throw new Error(`Bind key ${key} and Action ${action} must be the same for Mouse or Touch bindings`);
            }
        }

        if (!this.isBound(key)) {
            this.binds[key] = bind;
        } else {
            throw new Error(`Bind key ${key} is already bound`);
        }
    }

    unbind(key: string) {
        if (this.isBound(key)) {
            delete this.binds[key];
        } else {
            throw new Error(`Bind key ${key} was not bound`);
        }
    }

    private isValidKey(key: string): boolean {
        return validKeys.has(key);
    }

    private isValidAction(action: string): boolean {
        return validActions.has(action);
    }

    private isValidMouseOrTouch(key: string, action: string): boolean {
        return key === action && (validMouseEvents.has(key) || (validTouchEvents.has(key) && (validMouseEvents.has(action) || validTouchEvents.has(action))));
    }

    update() {
        this.lock = true;

        for (const key of Object.keys(this.binds)) {
            const bind = this.binds[key];
            if (bind.state) {
                this.commandsToExecute.push(bind.command);
                if (bind.action !== 'hold') {
                    bind.state = null;
                }
            }
        }

        while (this.commandsToExecute.length > 0) {
            const command = this.commandsToExecute.pop();
            command?.execute();
        }

        this.lock = false;
    }

    lateUpdate() {
        while (this.deferredStateChanges.length > 0) {
            const stateChange = this.deferredStateChanges.pop();
            if (stateChange) {
                this.binds[stateChange.bind.key].state = stateChange.newState;
            }
        }
    }

    destroy() {
        if (!TargetRegistrar.instance.delist(this.target)) {
            throw new Error('InputHandler has already been destroyed');
        }

        this.target.removeEventListener('keydown', this.handleKeyDown);
        this.target.removeEventListener('keyup', this.handleKeyUp);
    }
}
