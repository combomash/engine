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

export interface FrameParams {
    deltaTime: number;
    elapsedTime: number;
    resolution: Resolution;
}

export interface onInitParams {}

export interface onStartParams {}

export interface onResizeParams {
    resolution: Resolution;
}

export interface onUpdateParams extends FrameParams {}

export interface onLateUpdateParams {}

export interface onExecuteParams extends FrameParams {}

export interface onDestroyParams {}
