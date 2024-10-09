import {Random} from '../stochastic/random';
import {ConfigParams, RenderMethod, FitMode} from './engine.interface';

export class Configuration {
    css: string;
    seed: string | number | undefined;
    canvas: HTMLCanvasElement | undefined;
    canToggleFullscreen: boolean;
    keepCanvasOnDestroy: boolean;
    debounceResizeMs: number;

    fitMode: FitMode;

    width: number;
    height: number;
    aspectRatio: number;
    devicePixelRatio: number;
    canvasPadding: number;

    renderMethod: RenderMethod;

    frame: number;
    samples: number;
    framerate: number;

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

        const {
            css,
            canvas,
            debounceResizeMs,
            canToggleFullscreen,
            keepCanvasOnDestroy,
            seed,
            fitMode,
            width,
            height,
            aspectRatio,
            devicePixelRatio,
            canvasPadding,
            renderMethod,
            frame,
            samples,
            framerate,

            ...userConfig
        } = params;

        this.css = css ?? '';
        this.canvas = canvas;
        this.debounceResizeMs = debounceResizeMs ?? 0;
        this.canToggleFullscreen = canToggleFullscreen ?? true;
        this.keepCanvasOnDestroy = keepCanvasOnDestroy ?? false;
        this.seed = seed ?? Random.generateHashSeed();

        this.fitMode = fitMode ?? 'fill';
        this.width = width ?? window.innerWidth;
        this.height = height ?? window.innerHeight;
        this.aspectRatio = aspectRatio ?? this.width / this.height;
        this.devicePixelRatio = devicePixelRatio ?? (window.devicePixelRatio || 1);
        this.canvasPadding = canvasPadding ?? 0;

        this.renderMethod = renderMethod ?? 'realtime';

        this.frame = frame ?? 0;
        this.samples = samples ?? 1;
        this.framerate = framerate ?? 30;

        this.userConfig = {...userConfig};
    }
}
