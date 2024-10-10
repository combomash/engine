export type FitMode = 'fill' | 'aspect' | 'exact';
export type RenderMethod = 'realtime' | 'offline';

export interface Configuration {
    css?: string;
    seed?: string | number;
    canvas?: HTMLCanvasElement;
    canToggleFullscreen?: boolean;
    keepCanvasOnDestroy?: boolean;
    debounceResizeMs?: number;
    logRenderInfo?: boolean;

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
    sample: number;
    frame: number;
    fps: number;
}

export interface Entity {
    isActive?: boolean;
    start?: () => void;
    resize?: (resolution: Resolution) => void;
    update?: (frameData: FrameData) => void;
    lateUpdate?: (frameData: FrameData) => void;
    execute?: (frameData: FrameData) => void;
    finish?: () => void;
    destroy?: () => void;
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

export type Callback = (params?: {[key: string]: any}) => any;
