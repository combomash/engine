export type FillMode = 'fill' | 'aspect';

export interface InitializeParams {
    canvas?: HTMLCanvasElement;
    aspectRatio?: number;
    devicePixelRatio?: number;
    debounceResizeMs?: number;
    css?: string;
}

export interface Resolution {
    width: number;
    height: number;
    aspectRatio: number;
    devicePixelRatio: number;
    fillMode: FillMode;
}

export interface FrameParams {
    deltaTime: number;
    elapsedTime: number;
    resolution: Resolution;
}
