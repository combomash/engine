import {Command} from './input-handler';

export interface Bind {
    key: string;
    action: string;
    command: Command;
    state: true | null;
}
