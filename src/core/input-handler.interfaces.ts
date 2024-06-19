import {Command} from './input-handler';

export interface Bind {
    input: string;
    keyAction?: string;
    command: Command;
    state?: true | null;
}
