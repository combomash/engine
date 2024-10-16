import {Random} from '../stochastic/random';
import {Configuration, RenderMethod, FitMode, Seed} from '../core/engine.interface';

export class ConfigManager implements Configuration {
    css: string;
    seed: Seed;
    canvas: HTMLCanvasElement | undefined;

    canToggleFullscreen: boolean;
    keepCanvasOnDestroy: boolean;
    debounceResizeMs: number;
    logRenderInfo: boolean;

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

    constructor(params: Configuration) {
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
            seed,
            canvas,
            canToggleFullscreen,
            keepCanvasOnDestroy,
            debounceResizeMs,
            logRenderInfo,
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
        this.seed = seed ?? Random.generateHashSeed();
        this.canvas = canvas;

        this.canToggleFullscreen = canToggleFullscreen ?? true;
        this.keepCanvasOnDestroy = keepCanvasOnDestroy ?? false;
        this.debounceResizeMs = debounceResizeMs ?? 0;
        this.logRenderInfo = logRenderInfo ?? false;

        this.fitMode = fitMode ?? 'fill';
        this.width = width ?? window.innerWidth;
        this.height = height ?? window.innerHeight;
        this.aspectRatio = aspectRatio ?? window.innerWidth / window.innerHeight;
        this.devicePixelRatio = devicePixelRatio ?? (window.devicePixelRatio || 1);
        this.canvasPadding = canvasPadding ?? 0;

        this.renderMethod = renderMethod ?? 'realtime';

        this.frame = frame ?? 0;
        this.samples = samples ?? 1;
        this.framerate = framerate ?? 30;

        this.userConfig = {...userConfig};
    }
}
