import {Clock} from './clock';
import {Utils} from '../helpers/utils';
import {EntityManager} from './entity-manager';

import * as I from './engine.interface';
import * as E from './engine.errors';

interface InitParams {
    canvas?: HTMLCanvasElement;
    aspectRatio?: number;
    devicePixelRatio?: number;
    debounceResizeMs?: number;
    canToggleFullscreen?: boolean;
    css?: string;
}

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

    private clock!: Clock;
    private frameData!: I.FrameData;

    private isActive: boolean = false;
    private needsResize: boolean = false;
    private isInitialized: boolean = false;
    private canToggleFullscreen: boolean = true;
    private doShutdown: boolean = false;

    entityManager!: EntityManager;

    private handleResize!: () => void;

    private setNeedsResize = () => {
        this.needsResize = true;
    };

    async init(params: InitParams = {}) {
        if (this.isInitialized) throw new Error(E.IS_INITIALIZED);

        const css = document.createElement('style');
        css.innerHTML = `
            *{margin:0;padding:0;overflow:clip;background: #000;height:100%;}
            body{display:flex;justify-content:center;align-items:center;}
            ${params.css ?? ''}
            `;
        document.body.appendChild(css);

        this.handleResize = Utils.debounce(this.setNeedsResize.bind(this), params.debounceResizeMs ?? 0);
        window.addEventListener('resize', this.handleResize);

        this.#canvas = params.canvas ?? document.createElement('canvas');
        document.body.appendChild(this.#canvas);

        this.#resolution = {
            width: window.innerWidth,
            height: window.innerHeight,
            aspectRatio: params.aspectRatio ?? window.innerWidth / window.innerHeight,
            devicePixelRatio: params.devicePixelRatio ?? (window.devicePixelRatio || 1),
            mode: params.aspectRatio ? 'aspect' : 'fill',
        };

        if ('canToggleFullscreen' in params) {
            console.log('here');
            this.canToggleFullscreen = params.canToggleFullscreen ?? this.canToggleFullscreen;
        }

        this.clock = new Clock();

        this.entityManager = new EntityManager();

        this.isInitialized = true;
    }

    private resolve: () => void = () => {};

    async run() {
        if (!this.isInitialized) throw new Error(E.NOT_INITIALIZED);
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
        this.clock.start();
        this.entityManager.start({});
        window.requestAnimationFrame(() => {
            this.tick();
        });
    }

    private tick() {
        this.clock.tick();

        this.update();
        this.lateUpdate();
        this.execute();

        if (this.isActive) {
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
        const aspectRatio = this.#resolution.mode === 'aspect' ? this.#resolution.aspectRatio : width / height;
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
        window.removeEventListener('resize', this.handleResize);
        this.entityManager?.destroy({});
        this.clock?.destroy();
        this.#canvas?.remove();
    }
}

export {Engine};
