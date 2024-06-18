export type FillMode = 'fill' | 'aspect';

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
