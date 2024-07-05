import {ConfigParams, FitAspectRatio, FitExactResolution, FitFillFrame, RunFrames, RunRealtime} from './engine.interface';

export class Configuration {
    css: string;
    canvas: HTMLCanvasElement | undefined;
    debounceResizeMs: number;

    canToggleFullscreen: boolean;
    keepCanvasOnDestroy: boolean;

    runMethod: 'realtime' | 'frames' = 'realtime';
    runConfig: RunFrames | RunRealtime = {method: 'realtime'};

    fitConfig: FitFillFrame | FitAspectRatio | FitExactResolution = {method: 'fill'};

    constructor(params: ConfigParams) {
        const {css, canvas, debounceResizeMs, canToggleFullscreen, keepCanvasOnDestroy, runConfig, fitConfig} = params;

        this.css = css ?? '';
        this.canvas = canvas;
        this.debounceResizeMs = debounceResizeMs ?? 0;
        this.canToggleFullscreen = canToggleFullscreen ?? true;
        this.keepCanvasOnDestroy = keepCanvasOnDestroy ?? false;

        if (runConfig) {
            this.runMethod = runConfig.method;
            this.runConfig = runConfig;
        }

        if (fitConfig) {
            this.fitConfig = fitConfig;
        }
    }
}
