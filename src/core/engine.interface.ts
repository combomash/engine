export type FitMode = 'fill' | 'aspect' | 'exact';
export type RenderMethod = 'realtime' | 'offline';

export interface ConfigParams {
    css?: string;
    seed?: string | number;
    canvas?: HTMLCanvasElement;
    canToggleFullscreen?: boolean;
    keepCanvasOnDestroy?: boolean;
    debounceResizeMs?: number;

    fitMode?: FitMode;

    width?: number;
    height?: number;
    aspectRatio?: number;
    devicePixelRatio?: number;
    canvasPadding?: number;

    renderMethod?: RenderMethod;

    frame?: number;
    samples?: number;
    framerate?: number;
}

export interface Resolution {
    width: number;
    height: number;
    aspectRatio: number;
    devicePixelRatio: number;
}

export interface FrameData {
    deltaTime: number;
    elapsedTime: number;
    resolution: Resolution;
}

export interface Entity {
    isActive?: boolean;
    start?: (params?: StartParams) => void;
    resize?: (params?: ResizeParams) => void;
    update?: (params?: UpdateParams) => void;
    lateUpdate?: (params?: LateUpdateParams) => void;
    execute?: (params?: ExecuteParams) => void;
    finish?: (params?: FinishParams) => void;
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

export interface StartParams {}

export interface ResizeParams {
    resolution: Resolution;
}

export interface UpdateParams extends FrameData {}

export interface LateUpdateParams extends FrameData {}

export interface ExecuteParams extends FrameData {}

export interface FinishParams {}

export interface DestroyParams {}
