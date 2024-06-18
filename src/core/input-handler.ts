import {Entity} from './entity-manager-interfaces';
import {Bind} from './input-handler.interfaces';
import {validEvents, validKeyActions, validKeyCodes, validMouseEvents, validTouchEvents} from './input-handler.constants';

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

    private eventListeners: {[key: string]: (e: Event | KeyboardEvent | MouseEvent | PointerEvent | TouchEvent) => void} = {};

    constructor({target}: {target: Target}) {
        if (!TargetRegistrar.instance.register(target)) {
            throw new Error('Target has already been registered');
        }
        this.target = target;
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

    isBound(key: string) {
        return Object.keys(this.binds).includes(key);
    }

    bind(bind: Bind) {
        const {key, action} = bind;

        if (!validEvents.has(key)) {
            throw new Error(`Bind key ${key} is not valid`);
        }

        if (validKeyCodes.has(key)) {
            // Key
            if (!validKeyActions.has(action)) {
                throw new Error(`Action ${action} is not a valid Key action`);
            }
            if (action === 'up') {
                if (!Object.keys(this.eventListeners).includes('keyup')) {
                    this.target.addEventListener('keyup', this.handleKeyUp);
                    this.eventListeners['keyup'] = this.handleKeyUp;
                }
            } else if (action === 'down' || action === 'hold') {
                if (!Object.keys(this.eventListeners).includes('keydown')) {
                    this.target.addEventListener('keydown', this.handleKeyDown);
                    this.eventListeners['keydown'] = this.handleKeyDown;
                }
            }
        } else if (validMouseEvents.has(key)) {
            // Mouse
            if (!Object.keys(this.eventListeners).includes(key)) {
                if (key === 'click') {
                    this.target.addEventListener(key, this.handleClick);
                    this.eventListeners['keydown'] = this.handleClick;
                } else if (key === 'dblclick') {
                    this.target.addEventListener(key, this.handleDblClick);
                    this.eventListeners['keydown'] = this.handleDblClick;
                }
            }
        } else if (validTouchEvents.has(key)) {
            // Touch
        } else {
            throw new Error(`Bind key ${key} is unkown!`);
        }

        if (this.isBound(key)) {
            throw new Error(`Bind key ${key} is already bound`);
        }

        this.binds[key] = bind;
    }

    unbind(key: string) {
        if (this.isBound(key)) {
            delete this.binds[key];
        } else {
            console.warn(`Bind key ${key} was not bound`);
        }
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
        for (const key of Object.keys(this.eventListeners)) {
            this.target.removeEventListener(key, this.eventListeners[key]);
        }
    }
}
