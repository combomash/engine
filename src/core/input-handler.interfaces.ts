import {Command} from './input-handler';

type KeyActionType = 'down' | 'up' | 'hold';
type MouseActionType = 'click';

type ActionType = KeyActionType | MouseActionType;

export interface Bind {
    key: string;
    action: ActionType;
    command: Command;
    state: true | null;
}
