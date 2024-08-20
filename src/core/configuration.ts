import {Random} from '../stochastic/random';
import {ConfigParams, FitToAspectRatio, ExactDimensions, FillWindow, Frame, Realtime} from './engine.interface';

export class Configuration {
    css: string;
    seed: string | number | undefined;
    canvas: HTMLCanvasElement | undefined;
    debounceResizeMs: number;

    canToggleFullscreen: boolean;
    keepCanvasOnDestroy: boolean;

    runConfig: Realtime | Frame = {method: 'realtime'};
    fitConfig: FillWindow | FitToAspectRatio | ExactDimensions = {method: 'fill'};

    userConfig: {[key: string]: any};

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

        const {css, canvas, debounceResizeMs, canToggleFullscreen, keepCanvasOnDestroy, seed, runConfig, fitConfig, ...userConfig} = params;

        this.css = css ?? '';
        this.canvas = canvas;
        this.debounceResizeMs = debounceResizeMs ?? 0;
        this.canToggleFullscreen = canToggleFullscreen ?? true;
        this.keepCanvasOnDestroy = keepCanvasOnDestroy ?? false;
        this.seed = seed ?? Random.generateHashSeed();

        this.runConfig = runConfig ?? this.runConfig;
        this.fitConfig = fitConfig ?? this.fitConfig;
        this.userConfig = {...userConfig};
    }
}
