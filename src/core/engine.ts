import {Clock} from './clock';
import {Utils} from '../helpers/utils';
import {Configuration} from './configuration';
import {EntityManager} from '../managers/entity-manager';
import {InputsHandler} from '../interaction/inputs-handler';

import {Resolution, FrameData, ConfigParams} from './engine.interface';

import * as ERR from './engine.errors';

class Engine {
    constructor() {}

    #canvas!: HTMLCanvasElement;
    get canvas() {
        return this.#canvas;
    }

    #resolution!: Resolution;
    get resolution() {
        return this.#resolution;
    }

    entityManager!: EntityManager;
    inputsHandler!: InputsHandler;

    #config!: Configuration;

    get config() {
        return this.#config;
    }

    get seed() {
        return this.#config.seed;
    }

    private clock!: Clock;
    private frameData!: FrameData;

    private isActive: boolean = false;
    private isDestroyed: boolean = false;
    private needsResize: boolean = false;
    private isInitialized: boolean = false;
    private doShutdown: boolean = false;

    private handleResize!: () => void;

    private setNeedsResize = () => {
        this.needsResize = true;
    };

    async init(params: ConfigParams = {}) {
        if (this.isInitialized) throw new Error(ERR.IS_INITIALIZED);

        this.#config = new Configuration(params);

        this.clock = new Clock();
        this.inputsHandler = new InputsHandler({target: window});
        this.entityManager = new EntityManager();

        const CSS = document.createElement('style');
        CSS.innerHTML = `*{margin:0;padding:0;overflow:clip;background:#000;height:100%;}body{display:flex;justify-content:center;align-items:center;}${this.#config.css ?? ''}`;
        document.body.appendChild(CSS);

        this.handleResize = Utils.debounce(this.setNeedsResize.bind(this), this.#config.debounceResizeMs);
        window.addEventListener('resize', this.handleResize);

        this.#canvas = this.#config.canvas ?? document.createElement('canvas');
        document.body.appendChild(this.#canvas);

        this.#resolution = {
            width: 1,
            height: 1,
            devicePixelRatio: window.devicePixelRatio || 1,
            aspectRatio: window.innerWidth / window.innerHeight,
            ...this.#config.fitConfig,
        };

        if (this.#config.renderMethod === 'offline') {
            const {framerate, frame} = this.#config;
            if (framerate && frame) {
                if (!Number.isInteger(frame)) throw Error('frame must be an integer');
                const msPerFrame = 1000 / framerate;
                const elapsedMs = msPerFrame * frame;
                this.clock.setInitialElapsedTime(elapsedMs);
                this.doShutdown = true;
            } else {
                throw Error('framerate (fps) and frame (int) are required for "offline" renders');
            }
        }

        this.resize();

        this.isInitialized = true;
    }

    export: () => Promise<void> = async () => {};

    private resolve: () => void = () => {};

    async run() {
        if (!this.isInitialized) throw new Error(ERR.NOT_INITIALIZED);
        if (this.isDestroyed) throw new Error(ERR.IS_DESTROYED);
        if (this.isActive) throw new Error(ERR.IS_RUNNING);
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
        if (this.#config.renderMethod === 'realtime') this.clock.start();
        window.requestAnimationFrame(() => {
            this.tick();
        });
    }

    private async tick() {
        this.clock.tick();

        this.update();
        this.lateUpdate();
        this.execute();
        this.finish();

        if (this.isActive && this.#config.renderMethod === 'realtime') {
            window.requestAnimationFrame(() => {
                this.tick();
            });
            return;
        }

        await this.export();
        window.parent.postMessage({type: 'status', data: 'done'}, '*');

        if (this.doShutdown) {
            this.resolve();
            this.destroy();
        }
    }

    private resize() {
        this.needsResize = false;

        const {method} = this.#config.fitConfig;
        const {aspectRatio, devicePixelRatio} = this.#resolution;

        const w = method === 'exact' ? this.#config.fitConfig.width : window.innerWidth;
        const h = method === 'exact' ? this.#config.fitConfig.height : window.innerHeight;
        const d = method === 'exact' ? this.#config.fitConfig.devicePixelRatio ?? 1 : devicePixelRatio;
        const p = method !== 'exact' ? this.#config.fitConfig.padding ?? 0 : 0;
        const a = method === 'aspect' ? aspectRatio : w / h;

        const resolution = {
            width: h * a >= w ? w : h * a,
            height: w / a >= h ? h : w / a,
        };

        this.#resolution.width = resolution.width * d;
        this.#resolution.height = resolution.height * d;
        this.#resolution.aspectRatio = resolution.width / resolution.height;
        this.#resolution.devicePixelRatio = d;

        if (p > 0 && p <= 0.5) {
            const min = Math.min(this.#resolution.width, this.#resolution.height);
            this.#resolution.width -= min * p;
            this.#resolution.height -= min * p;
        }

        this.#canvas.width = this.#resolution.width;
        this.#canvas.height = this.#resolution.height;
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
        if (!this.#config.canToggleFullscreen) return;

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

        this.inputsHandler.update();
        this.entityManager.update(this.frameData);
    }

    private lateUpdate() {
        this.inputsHandler.lateUpdate();
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
        this.entityManager.destroy();
        this.inputsHandler.destroy();
        this.clock?.destroy();

        if (!this.#config.keepCanvasOnDestroy) this.#canvas?.remove();
    }
}

export {Engine};
