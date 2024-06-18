import {Resolution, FrameData} from './engine.interface';

export interface Entity {
    isActive: boolean;
    start?: (params: StartParams) => void;
    resize?: (params: ResizeParams) => void;
    update?: (params: UpdateParams) => void;
    lateUpdate?: (params: LateUpdateParams) => void;
    execute?: (params: ExecuteParams) => void;
    destroy?: (params: DestroyParams) => void;
}

export interface StartParams {}

export interface ResizeParams {
    resolution: Resolution;
}

export interface UpdateParams extends FrameData {}

export interface LateUpdateParams extends FrameData {}

export interface ExecuteParams extends FrameData {}

export interface DestroyParams {}
