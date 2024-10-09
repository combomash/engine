export type RenderMethod = 'realtime' | 'offline';

export interface FillWindow {
    method: 'fill';
    devicePixelRatio?: number;
    padding?: number;
}

export interface FitToAspectRatio {
    method: 'aspect';
    aspectRatio?: number;
    devicePixelRatio?: number;
    padding?: number;
}

export interface ExactDimensions {
    method: 'exact';
    width: number;
    height: number;
    devicePixelRatio?: number;
}

export interface ConfigParams {
    css?: string;
    seed?: string | number;
    canvas?: HTMLCanvasElement;
    debounceResizeMs?: number;
    canToggleFullscreen?: boolean;
    keepCanvasOnDestroy?: boolean;

    renderMethod?: RenderMethod;

    // Offline Render
    frame?: number;
    samples?: number;
    framerate?: number;

    fitConfig?: FillWindow | FitToAspectRatio | ExactDimensions;
    export?: () => Promise<void>;
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
