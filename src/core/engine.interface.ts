export interface InitializeParams {
    canvas?: HTMLCanvasElement;
    aspectRatio?: number;
    devicePixelRatio?: number;
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

export interface onInitData {}

export interface onStartData {}

export interface onResizeData {
    resolution: Resolution;
}

export interface onUpdateData extends FrameData {}

export interface onLateUpdateData {}

export interface onRenderData extends FrameData {}

export interface onQuitData {}

export interface onDestroyData {}
