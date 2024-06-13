import {Timer} from './timer';

import {
    FrameData,
    InitializeParams,
    Resolution,
    onDestroyData,
    onInitData,
    onLateUpdateData,
    onRenderData,
    onResizeData,
    onQuitData,
    onStartData,
    onUpdateData,
} from './engine.interface';

import {ERR_IS_INITIALIZED, ERR_NOT_INITIALIZED, ERR_IS_RUNNING} from './engine.errors';

class Engine {
    constructor() {}

    #canvas!: HTMLCanvasElement;
    public get canvas() {
        return this.#canvas;
    }

    #resolution!: Resolution;
    get resolution() {
        return this.#resolution;
    }

    private timer!: Timer;

    private frameData!: FrameData;

    private isActive: boolean = false;
    private needsResize: boolean = false;
    private isInitialized: boolean = false;

    public onInit: (data: onInitData) => void = data => {};
    public onStart: (data: onStartData) => void = data => {};
    public onResize: (data: onResizeData) => void = data => {};
    public onUpdate: (data: onUpdateData) => void = data => {};
    public onLateUpdate: (data: onLateUpdateData) => void = data => {};
    public onRender: (data: onRenderData) => void = data => {};
    public onQuit: (data: onQuitData) => void = data => {};
    public onDestroy: (data: onDestroyData) => void = data => {};

    public async initialize(params: InitializeParams = {}) {
        if (this.isInitialized) throw new Error(ERR_IS_INITIALIZED);

        this.#canvas = params.canvas ?? document.createElement('canvas');
        document.body.appendChild(this.#canvas);

        this.#resolution = {
            width: 1,
            height: 1,
            aspectRatio: params.aspectRatio ?? 1,
            devicePixelRatio: params.devicePixelRatio ?? 1,
        };

        this.onInit({});
    }

    public async run() {
        if (!this.isInitialized) throw new Error(ERR_NOT_INITIALIZED);
        if (this.isActive) throw new Error(ERR_IS_RUNNING);

        this.start();

        return new Promise<void>(resolve => {
            const doShutdown = () => {
                this.shutdown();
                resolve();
            };

            window.addEventListener('keydown', event => {
                if (event.key === 'Escape') doShutdown();
            });
        });
    }

    public shutdown() {
        this.quit();
    }

    private start() {
        this.isActive = true;
        this.needsResize = true;
        this.timer.start();
        this.onStart({});
        window.requestAnimationFrame(() => {
            this.tick();
        });
    }

    private tick() {
        this.timer.tick();

        this.update();
        this.lateUpdate();
        this.render();

        if (this.isActive) {
            window.requestAnimationFrame(() => {
                this.tick();
            });
        }
    }

    private resize() {
        this.needsResize = false;

        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspectRatio = this.#resolution.aspectRatio;
        const devicePixelRatio = this.#resolution.devicePixelRatio;

        const DIM = {
            width: height * aspectRatio >= width ? width : height * aspectRatio,
            height: width / aspectRatio >= height ? height : width / aspectRatio,
        };

        this.#resolution.width = DIM.width * devicePixelRatio;
        this.#resolution.height = DIM.height * devicePixelRatio;

        this.#canvas.width = this.#resolution.width;
        this.#canvas.height = this.#resolution.height;
        this.#canvas.style.width = DIM.width + 'px';
        this.#canvas.style.height = DIM.height + 'px';

        this.onResize({resolution: this.#resolution});
    }

    private update() {
        if (this.needsResize) this.resize();

        this.frameData = {
            deltaTime: this.timer.delta,
            elapsedTime: this.timer.elapsed,
            resolution: this.resolution,
        };

        this.onUpdate(this.frameData);
    }

    private lateUpdate() {
        this.onLateUpdate({});
    }

    private render() {
        this.onRender(this.frameData);
    }

    private quit() {
        this.isActive = false;
        this.onQuit({});
        this.destroy();
    }

    private destroy() {
        this.onDestroy({});
        this.#canvas?.remove();
    }
}

export {Engine};
