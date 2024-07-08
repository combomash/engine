import {Random} from '../stochastic/random';
import {ConfigParams, FitToAspectRatio, ExactResolution, FillWindow, Frame, Realtime} from './engine.interface';

export class Configuration {
    css: string;
    seed: string | number;
    canvas: HTMLCanvasElement | undefined;
    debounceResizeMs: number;

    canToggleFullscreen: boolean;
    keepCanvasOnDestroy: boolean;

    runConfig: Realtime | Frame = {method: 'realtime'};
    fitConfig: FillWindow | FitToAspectRatio | ExactResolution = {method: 'fill'};

    constructor(params: ConfigParams) {
        const urlParams: URLSearchParams = new URLSearchParams(window.location.search);

        if (urlParams.has('config')) {
            const json = urlParams.get('config');
            if (json) {
                const config = JSON.parse(json);
                params = {
                    ...params,
                    ...config,
                };
            }
        }

        const {css, canvas, debounceResizeMs, canToggleFullscreen, keepCanvasOnDestroy, runConfig, fitConfig, seed} = params;

        this.css = css ?? '';
        this.canvas = canvas;
        this.debounceResizeMs = debounceResizeMs ?? 0;
        this.canToggleFullscreen = canToggleFullscreen ?? true;
        this.keepCanvasOnDestroy = keepCanvasOnDestroy ?? false;
        this.runConfig = runConfig ?? this.runConfig;
        this.fitConfig = fitConfig ?? this.fitConfig;
        this.seed = seed ?? Random.generateHashSeed();
    }
}
