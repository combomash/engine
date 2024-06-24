import {Clock} from './clock';
import {Utils} from '../helpers/utils';
import {EntityManager} from '../managers/entity-manager';

import * as I from './engine.interface';
import * as E from './engine.errors';

class Engine {
    constructor() {}

    #canvas!: HTMLCanvasElement;
    get canvas() {
        return this.#canvas;
    }

    #resolution!: I.Resolution;
    get resolution() {
        return this.#resolution;
    }

    entityManager!: EntityManager;

    private clock!: Clock;
    private mode: I.Mode = 'runtime';
    private frameData!: I.FrameData;

    private isActive: boolean = false;
    private isDestroyed: boolean = false;
    private needsResize: boolean = false;
    private isInitialized: boolean = false;
    private canToggleFullscreen!: boolean;
    private keepCanvasOnDestroy!: boolean;
    private doShutdown: boolean = false;

    private handleResize!: () => void;

    private setNeedsResize = () => {
        this.needsResize = true;
    };

    async init({css, canvas, aspectRatio, devicePixelRatio, debounceResizeMs, canToggleFullscreen, keepCanvasOnDestroy, runConfig}: I.InitConfig = {}) {
        if (this.isInitialized) throw new Error(E.IS_INITIALIZED);

        const CSS = document.createElement('style');
        CSS.innerHTML = `*{margin:0;padding:0;overflow:clip;background:#000;height:100%;}body{display:flex;justify-content:center;align-items:center;}${css ?? ''}`;
        document.body.appendChild(CSS);

        this.handleResize = Utils.debounce(this.setNeedsResize.bind(this), debounceResizeMs ?? 0);
        window.addEventListener('resize', this.handleResize);

        this.#canvas = canvas ?? document.createElement('canvas');
        document.body.appendChild(this.#canvas);

        this.#resolution = {
            width: window.innerWidth,
            height: window.innerHeight,
            aspectRatio: aspectRatio ?? window.innerWidth / window.innerHeight,
            devicePixelRatio: devicePixelRatio ?? (window.devicePixelRatio || 1),
            method: aspectRatio ? 'aspect' : 'fill',
        };

        this.canToggleFullscreen = canToggleFullscreen ?? true;
        this.keepCanvasOnDestroy = keepCanvasOnDestroy ?? false;

        this.clock = new Clock();

        this.entityManager = new EntityManager();

        if (runConfig) {
            this.mode = runConfig.mode;
            if (this.mode === 'frame') {
                if ('framerate' in runConfig && 'startFrame' in runConfig) {
                    const {framerate, startFrame} = runConfig;
                    if (!Number.isInteger(startFrame)) throw Error('startFrame must be an integer');
                    const msPerFrame = 1000 / framerate;
                    const elapsedMs = msPerFrame * startFrame;
                    this.clock.setInitialElapsedTime(elapsedMs);
                    this.doShutdown = true;
                } else {
                    throw Error('framerate (fps) and startFrame (int) are required for "frame" runConfig');
                }
            }
        }

        this.isInitialized = true;
    }

    private resolve: () => void = () => {};

    async run() {
        if (!this.isInitialized) throw new Error(E.NOT_INITIALIZED);
        if (this.isDestroyed) throw new Error(E.IS_DESTROYED);
        if (this.isActive) throw new Error(E.IS_RUNNING);
        return new Promise<void>(resolve => {
            this.resolve = resolve;
            this.start();
        });
    }

    shutdown() {
        this.isActive = false;
        this.doShutdown = true;
    }

    private start() {
        this.isActive = true;
        this.needsResize = true;
        this.entityManager.start({});
        if (this.mode === 'runtime') this.clock.start();
        window.requestAnimationFrame(() => {
            this.tick();
        });
    }

    private tick() {
        this.clock.tick();

        this.update();
        this.lateUpdate();
        this.execute();

        if (this.isActive && this.mode === 'runtime') {
            window.requestAnimationFrame(() => {
                this.tick();
            });
        }

        if (this.doShutdown) {
            this.resolve();
            this.destroy();
        }
    }

    private resize() {
        this.needsResize = false;

        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspectRatio = this.#resolution.method === 'aspect' ? this.#resolution.aspectRatio : width / height;
        const devicePixelRatio = this.#resolution.devicePixelRatio;

        const DIM = {
            width: height * aspectRatio >= width ? width : height * aspectRatio,
            height: width / aspectRatio >= height ? height : width / aspectRatio,
        };

        this.#resolution.width = DIM.width;
        this.#resolution.height = DIM.height;

        this.#canvas.width = this.#resolution.width * devicePixelRatio;
        this.#canvas.height = this.#resolution.height * devicePixelRatio;
        this.#canvas.style.width = DIM.width + 'px';
        this.#canvas.style.height = DIM.height + 'px';

        const params = {resolution: this.#resolution};

        this.entityManager.resize(params);
    }

    isFullscreen() {
        return (
            !document.fullscreenElement &&
            !(document as any).mozFullScreenElement &&
            !(document as any).webkitFullscreenElement &&
            !(document as any).msFullscreenElement
        );
    }

    toggleFullscreen() {
        if (!this.canToggleFullscreen) return;

        if (this.isFullscreen()) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if ((document.documentElement as any).msRequestFullscreen) {
                (document.documentElement as any).msRequestFullscreen();
            } else if ((document.documentElement as any).mozRequestFullScreen) {
                (document.documentElement as any).mozRequestFullScreen();
            } else if ((document.documentElement as any).webkitRequestFullscreen) {
                (document.documentElement as any).webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if ((document as any).msExitFullscreen) {
                (document as any).msExitFullscreen();
            } else if ((document as any).mozCancelFullScreen) {
                (document as any).mozCancelFullScreen();
            } else if ((document as any).webkitExitFullscreen) {
                (document as any).webkitExitFullscreen();
            }
        }
    }

    private update() {
        if (this.needsResize) this.resize();

        this.frameData = {
            deltaTime: this.clock.delta,
            elapsedTime: this.clock.elapsed,
            resolution: this.resolution,
        };

        this.entityManager.update(this.frameData);
    }

    private lateUpdate() {
        this.entityManager.lateUpdate(this.frameData);
    }

    private execute() {
        this.entityManager.execute(this.frameData);
    }

    private destroy() {
        this.isDestroyed = true;
        window.removeEventListener('resize', this.handleResize);
        this.entityManager?.destroy({});
        this.clock?.destroy();
        if (!this.keepCanvasOnDestroy) this.#canvas?.remove();
    }
}

export {Engine};
