export interface Entity {
    isActive: boolean;
    start?: (params?: StartParams) => void;
    resize?: (params?: ResizeParams) => void;
    update?: (params?: UpdateParams) => void;
    lateUpdate?: (params?: LateUpdateParams) => void;
    execute?: (params?: ExecuteParams) => void;
    destroy?: (params?: DestroyParams) => void;
}

export interface Command {
    execute: () => void;
}

export interface Bind {
    input: string;
    keyAction?: string;
    command: Command;
    state?: true | null;
}

export interface Resolution {
    width: number;
    height: number;
    aspectRatio: number;
    devicePixelRatio: number;
    fillMode: 'fill' | 'aspect';
}

export interface FrameData {
    deltaTime: number;
    elapsedTime: number;
    resolution: Resolution;
}

export interface InitializeParams {
    canvas?: HTMLCanvasElement;
    aspectRatio?: number;
    devicePixelRatio?: number;
    debounceResizeMs?: number;
    canToggleFullscreen?: boolean;
    css?: string;
}

export interface StartParams {}

export interface ResizeParams {
    resolution: Resolution;
}

export interface UpdateParams extends FrameData {}

export interface LateUpdateParams extends FrameData {}

export interface ExecuteParams extends FrameData {}

export interface DestroyParams {}
