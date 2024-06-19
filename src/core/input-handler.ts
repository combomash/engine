import {Entity} from './entity-manager-interfaces';
import {Bind} from './input-handler.interfaces';
import {supportedEvents, validActions, validKeyCodes, validMouseEvents, validTouchEvents} from './input-handler.constants';

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
                if (bind.keyAction !== 'hold' && e.repeat) return;

                let newState = bind.state ?? null;
                if (bind.keyAction === 'down' || bind.keyAction === 'hold') newState = true;

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

                let newState = bind.state ?? null;
                if (bind.keyAction === 'hold') newState = null;
                else if (bind.keyAction === 'up') newState = true;

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

    isBound(input: string) {
        return Object.keys(this.binds).includes(input);
    }

    bind(bind: Bind) {
        const {input, keyAction, command} = bind;

        if (!command) {
            throw new Error(`A valid Command must be provided`);
        }

        if (!supportedEvents.has(input)) {
            throw new Error(`Bind input ${input} is not valid`);
        }

        if (validKeyCodes.has(input)) {
            // Key
            if (!keyAction) throw new Error(`You must provide an keyAction for Key inputs: ['down', 'up', 'hold']`);

            if (!validActions.has(keyAction)) {
                throw new Error(`Action ${keyAction} is not a valid Key keyAction`);
            }

            if (keyAction === 'up') {
                if (!Object.keys(this.eventListeners).includes('keyup')) {
                    this.target.addEventListener('keyup', this.handleKeyUp);
                    this.eventListeners['keyup'] = this.handleKeyUp;
                }
            } else if (keyAction === 'down' || keyAction === 'hold') {
                if (!Object.keys(this.eventListeners).includes('keydown')) {
                    this.target.addEventListener('keydown', this.handleKeyDown);
                    this.eventListeners['keydown'] = this.handleKeyDown;
                }
            }
        } else if (validMouseEvents.has(input)) {
            // Mouse
            if (!Object.keys(this.eventListeners).includes(input)) {
                if (input === 'click') {
                    this.target.addEventListener(input, this.handleClick);
                    this.eventListeners['keydown'] = this.handleClick;
                } else if (input === 'dblclick') {
                    this.target.addEventListener(input, this.handleDblClick);
                    this.eventListeners['keydown'] = this.handleDblClick;
                }
            }
        } else if (validTouchEvents.has(input)) {
            // Touch
        } else {
            throw new Error(`Bind input ${input} is unkown!`);
        }

        if (this.isBound(input)) {
            throw new Error(`Bind input ${input} is already bound`);
        }

        this.binds[input] = bind;
    }

    unbind(input: string) {
        if (this.isBound(input)) {
            delete this.binds[input];
        } else {
            console.warn(`Bind input ${input} was not bound`);
        }
    }

    update() {
        this.lock = true;

        for (const key of Object.keys(this.binds)) {
            const bind = this.binds[key];
            if (bind.state) {
                this.commandsToExecute.push(bind.command);
                if (bind.keyAction !== 'hold') {
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
                this.binds[stateChange.bind.input].state = stateChange.newState;
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
