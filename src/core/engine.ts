import {Clock} from './clock';
import {Utils} from '../helpers/utils';
import {EntityManager} from '../managers/entity-manager';
import {InputsHandler} from '../interaction/inputs-handler';

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
    inputHandler!: InputsHandler;

    private clock!: Clock;
    private frameData!: I.FrameData;
    private runMode: I.Mode = 'realtime';

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

    async init({css, canvas, debounceResizeMs, canToggleFullscreen, keepCanvasOnDestroy, runConfig, fitConfig}: I.ConfigParams = {}) {
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
            aspectRatio: window.innerWidth / window.innerHeight,
            devicePixelRatio: window.devicePixelRatio || 1,
            method: 'fill',
            ...fitConfig,
        };

        this.canToggleFullscreen = canToggleFullscreen ?? true;
        this.keepCanvasOnDestroy = keepCanvasOnDestroy ?? false;

        this.clock = new Clock();

        this.entityManager = new EntityManager();

        this.inputHandler = new InputsHandler({target: this.canvas});

        if (runConfig) {
            this.runMode = runConfig.method;
            if (this.runMode === 'frames') {
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

        this.resize();

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
        this.entityManager.start();
        if (this.runMode === 'realtime') this.clock.start();
        window.requestAnimationFrame(() => {
            this.tick();
        });
    }

    private tick() {
        this.clock.tick();

        this.update();
        this.lateUpdate();
        this.execute();
        this.finish();

        if (this.isActive && this.runMode === 'realtime') {
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

        const {method, width, height, aspectRatio, devicePixelRatio} = this.#resolution;

        const w = method === 'exact' ? width : window.innerWidth;
        const h = method === 'exact' ? height : window.innerHeight;
        const d = method === 'exact' ? 1 : devicePixelRatio;
        const a = method === 'aspect' ? aspectRatio : w / h;

        const resolution = {
            width: h * a >= w ? w : h * a,
            height: w / a >= h ? h : w / a,
        };

        this.#resolution.width = resolution.width;
        this.#resolution.height = resolution.height;

        this.#canvas.width = this.#resolution.width * d;
        this.#canvas.height = this.#resolution.height * d;
        this.#canvas.style.width = resolution.width + 'px';
        this.#canvas.style.height = resolution.height + 'px';

        this.entityManager.resize({resolution: this.#resolution});
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

    private finish() {
        this.entityManager.finish();
    }

    private destroy() {
        this.isDestroyed = true;
        window.removeEventListener('resize', this.handleResize);
        this.inputHandler.destroy();
        this.entityManager.destroy();
        this.clock?.destroy();

        if (!this.keepCanvasOnDestroy) this.#canvas?.remove();
    }
}

export {Engine};
