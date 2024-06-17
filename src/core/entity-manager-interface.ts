import {FrameParams, Resolution} from './engine.interface';

export interface StartParams {}

export interface ResizeParams {
    resolution: Resolution;
}

export interface UpdateParams extends FrameParams {}

export interface LateUpdateParams extends FrameParams {}

export interface ExecuteParams extends FrameParams {}

export interface DestroyParams {}
