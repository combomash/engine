import {
    InitializeParams,
    Resolution,
    onDisposeData,
    onInitData,
    onLateUpdateData,
    onRenderData,
    onResizeData,
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

    private needsResize: boolean = false;
    private isInitialized: boolean = false;
    private isRunning: boolean = false;

    public onInit: (data: onInitData) => void = data => {};
    public onStart: (data: onStartData) => void = data => {};
    public onResize: (data: onResizeData) => void = data => {};
    public onUpdate: (data: onUpdateData) => void = data => {};
    public onLateUpdate: (data: onLateUpdateData) => void = data => {};
    public onRender: (data: onRenderData) => void = data => {};
    public onDispose: (data: onDisposeData) => void = data => {};

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
        if (this.isRunning) throw new Error(ERR_IS_RUNNING);
        this.isRunning = true;
        this.start();
    }

    public async destroy() {
        this.isRunning = false;
        this.dispose();
    }

    private start() {
        this.needsResize = true;
        this.onStart({});
        window.requestAnimationFrame(() => {
            this.tick();
        });
    }

    private tick() {
        this.update();
        this.lateUpdate();
        this.render();
        if (this.isRunning) {
            window.requestAnimationFrame(() => {
                this.tick();
            });
        }
    }

    private resize() {
        this.needsResize = false;

        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspect = this.#resolution.aspectRatio;
        const ratio = this.#resolution.devicePixelRatio;

        const DIM = {
            width: height * aspect >= width ? width : height * aspect,
            height: width / aspect >= height ? height : width / aspect,
        };

        this.#resolution.width = DIM.width * ratio;
        this.#resolution.height = DIM.height * ratio;

        this.#canvas.width = this.#resolution.width;
        this.#canvas.height = this.#resolution.height;
        this.#canvas.style.width = DIM.width + 'px';
        this.#canvas.style.height = DIM.height + 'px';

        this.onResize({resolution: this.#resolution});
    }

    private update() {
        if (this.needsResize) this.resize();
        this.onUpdate({});
    }

    private lateUpdate() {
        this.onLateUpdate({});
    }

    private render() {
        this.onRender({});
    }

    private dispose() {
        this.onDispose({});
    }
}

export {Engine};
