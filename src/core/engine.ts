import {Clock} from './clock';
import {Utils} from '../helpers/utils';
import * as I from './engine.interface';
import * as ERROR from './engine.errors';

class Engine {
    constructor() {}

    #canvas!: HTMLCanvasElement;
    public get canvas() {
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

    public onInit: (data: I.onInitData) => void = data => {};
    public onStart: (data: I.onStartData) => void = data => {};
    public onResize: (data: I.onResizeData) => void = data => {};
    public onUpdate: (data: I.onUpdateData) => void = data => {};
    public onLateUpdate: (data: I.onLateUpdateData) => void = data => {};
    public onRender: (data: I.onRenderData) => void = data => {};
    public onQuit: (data: I.onQuitData) => void = data => {};
    public onDestroy: (data: I.onDestroyData) => void = data => {};

    public async initialize(params: I.InitializeParams = {}) {
        if (this.isInitialized) throw new Error(ERROR.IS_INITIALIZED);

        const style = document.createElement('style');
        style.innerHTML = `
        * {
            margin: 0;
            padding: 0;
            overflow: clip;
            background: #000;
            height: 100%;
        }
        body {
            display: flex;
            justify-content: center;
            align-items: center;
        }
        `;
        document.body.appendChild(style);

        window.addEventListener(
            'resize',
            Utils.debounce(() => {
                this.needsResize = true;
            }, 300),
        );

        this.#canvas = params.canvas ?? document.createElement('canvas');
        document.body.appendChild(this.#canvas);

        this.#resolution = {
            width: 1,
            height: 1,
            aspectRatio: params.aspectRatio ?? 1,
            devicePixelRatio: params.devicePixelRatio ?? 1,
        };

        this.clock = new Clock();

        this.isInitialized = true;

        this.onInit({});
    }

    public async run() {
        if (!this.isInitialized) throw new Error(ERROR.NOT_INITIALIZED);
        if (this.isActive) throw new Error(ERROR.IS_RUNNING);

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
        this.clock.start();
        this.onStart({});
        window.requestAnimationFrame(() => {
            this.tick();
        });
    }

    private tick() {
        this.clock.tick();

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
            deltaTime: this.clock.delta,
            elapsedTime: this.clock.elapsed,
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
        this.#canvas?.remove();
        this.clock?.destroy();
        this.onDestroy({});
    }
}

export {Engine};
