import {Command} from './input-handler';

export type KeyActionType = 'down' | 'up' | 'hold';

export interface KeyBind {
    key: string;
    action: KeyActionType;
    command: Command;
    state: true | null;
}
