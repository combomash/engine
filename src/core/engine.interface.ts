export type Mode = 'realtime' | 'frames';

export interface RunRealtime {
    method: 'realtime';
}

export interface RunFrames {
    method: 'frames';
    framerate: number;
    startFrame: number;
}

export interface FitFillFrame {
    method: 'fill';
    devicePixelRatio?: number;
}

export interface FitAspectRatio {
    method: 'aspect';
    aspectRatio?: number;
    devicePixelRatio?: number;
}

export interface FitExactResolution {
    method: 'exact';
    width: number;
    height: number;
}

export interface ConfigParams {
    css?: string;
    canvas?: HTMLCanvasElement;
    debounceResizeMs?: number;
    canToggleFullscreen?: boolean;
    keepCanvasOnDestroy?: boolean;
    runConfig?: RunRealtime | RunFrames;
    fitConfig?: FitFillFrame | FitAspectRatio | FitExactResolution;
}

export interface Resolution {
    width: number;
    height: number;
    aspectRatio: number;
    devicePixelRatio: number;
    method: 'fill' | 'aspect' | 'exact';
}

export interface FrameData {
    deltaTime: number;
    elapsedTime: number;
    resolution: Resolution;
}

export interface Entity {
    isActive: boolean;
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
