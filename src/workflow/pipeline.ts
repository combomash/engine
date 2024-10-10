import {Node} from './node';
import {Utils} from '../helpers/utils';
import {Registrar} from '../helpers/registrar';
import {FrameData} from '../core/engine.interface';

export interface PipelieneParams {
    label?: string;
    nodes: Array<Node>;
    globals?: {[key: string]: any};
}

let i = 0;

class PipelineRegistrar extends Registrar {
    static #instance: PipelineRegistrar;
    private constructor() {
        super();
    }
    static get instance(): PipelineRegistrar {
        if (!PipelineRegistrar.#instance) {
            PipelineRegistrar.#instance = new PipelineRegistrar();
        }
        return PipelineRegistrar.#instance;
    }
}

export class Pipeline {
    #label: string;
    get label() {
        return this.#label;
    }

    #nodes: Array<Node> = [];
    get nodes() {
        return this.#nodes;
    }

    #hasExecuted: boolean = false;
    get hasExecuted() {
        return this.#hasExecuted;
    }

    #outputs: {[key: string]: object} = {};
    get outputs() {
        return this.#outputs;
    }

    #globals: object;
    get globals() {
        return this.#globals;
    }

    private execNodes: Array<Node> = [];

    constructor({label, nodes = [], globals}: PipelieneParams) {
        this.#label = label ?? `pipeline_${i}`;
        this.#globals = globals ?? {};
        for (const node of nodes) this.#nodes.push(node);
        this.validate();
        i++;

        PipelineRegistrar.instance.register(this);
    }

    private validate() {
        // Zero nodes
        if (this.#nodes.length === 0) throw Error('At least one Node required');

        // Nodes cannot be registered in another Pipeline
        for (const record of PipelineRegistrar.instance.records) {
            for (const recordNode of record.nodes) {
                for (const node of this.#nodes) {
                    if (node === recordNode) throw Error(`Nodes can only belong to a single Pipeline`);
                }
            }
        }

        // No duplicates
        if (Utils.hasDuplicateObjects(this.#nodes)) throw Error('No duplicate Nodes allowed');

        // No orphans (children != parents) or links outside the pipeline's nodes
        for (const node of this.#nodes) {
            for (const parent of node.parents) {
                if (!parent.isParentOf(node)) throw Error(`Nodes ${node.label} and ${parent.label} have a broken Parent/Child connection`);
                if (!this.#nodes.includes(parent)) throw Error(`Node ${parent.label} was not provided to the Pipeline to execute`);
            }

            for (const child of node.children) {
                if (!child.isChildOf(node)) throw Error(`Nodes ${node.label} and ${child.label} have a broken Child/Parent connection`);
                if (!this.#nodes.includes(child)) throw Error(`Node ${child.label} was not provided to the Pipeline to execute`);
            }
        }

        // Identify exec Nodes
        for (const node of this.#nodes) {
            if (node.parents.length === 0) this.execNodes.push(node);
        }
        if (this.execNodes.length === 0) throw Error('No executatio Node detected!');

        // No looping graphs
        let loopDetected = false;
        for (const node of this.execNodes) {
            const visited = new Set();
            const recursionStack = new Set();

            const depthFirstSearch = (node: Node) => {
                if (recursionStack.has(node)) {
                    return true;
                }

                if (visited.has(node)) {
                    return false;
                }

                visited.add(node);
                recursionStack.add(node);

                for (const child of node.children) {
                    if (depthFirstSearch(child)) {
                        return true;
                    }
                }

                recursionStack.delete(node);
                return false;
            };

            for (const child of node.children) {
                if (depthFirstSearch(child)) {
                    loopDetected = true;
                }
                if (loopDetected) break;
            }
            if (loopDetected) break;
        }
        if (loopDetected) throw Error('Loop detected in Nodes');
    }

    reset() {
        for (const node of this.#nodes) {
            node.reset();
        }
        this.#hasExecuted = false;
        this.#outputs = {};
    }

    execute(frameData?: FrameData) {
        if (this.#hasExecuted) return;

        for (const node of this.execNodes) {
            node.execute({...this.#globals, ...frameData});
        }

        for (const node of this.#nodes) {
            this.#outputs[node.label] = node.output;
        }

        this.#hasExecuted = true;
    }

    destroy() {
        this.#outputs = {};
        for (const node of this.#nodes) {
            node.destroy();
        }
        this.#nodes.length = 0;
        this.execNodes.length = 0;
        this.#hasExecuted = false;
        PipelineRegistrar.instance.delist(this);
    }
}
