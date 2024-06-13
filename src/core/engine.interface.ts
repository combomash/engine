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

export interface onInitData {}

export interface onStartData {}

export interface onResizeData {
    resolution: Resolution;
}

export interface onUpdateData {}

export interface onLateUpdateData {}

export interface onRenderData {}

export interface onDisposeData {}
