export type Mode = 'runtime' | 'frame';

export interface FrameConfig {
    mode: 'frame';
    framerate: number;
    startFrame: number;
}

export interface FillFrame {
    method: 'fill';
    devicePixelRatio?: number;
}

export interface AspectFit {
    method: 'aspect';
    aspectRatio?: number;
    devicePixelRatio?: number;
}

export interface ExactResolution {
    method: 'exact';
    width: number;
    height: number;
}

export interface InitConfig {
    css?: string;
    canvas?: HTMLCanvasElement;
    debounceResizeMs?: number;
    canToggleFullscreen?: boolean;
    keepCanvasOnDestroy?: boolean;
    runConfig?: {mode: 'runtime'} | FrameConfig;
    fitConfig?: FillFrame | AspectFit | ExactResolution;
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
