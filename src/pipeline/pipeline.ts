import {Node} from './node';
import {Utils} from '../helpers/utils';

interface Params {
    label?: string;
    nodes: Array<Node>;
}

let i = 0;

// TODO - add a Registrar requiring a unique Pipeline name

// TODO - make sure Nodes cannot be registered to multiple Pipelines

export class Pipeline {
    label: string;

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

    private execNodes: Array<Node> = [];

    constructor({label, nodes = []}: Params) {
        this.label = label ?? `pipeline_${i}`;
        for (const node of nodes) this.#nodes.push(node);
        this.validate();
        i++;
    }

    private validate() {
        // Zero nodes
        if (this.#nodes.length === 0) throw Error('At least one Node required');

        // No duplicates
        if (Utils.hasDuplicateObjects(this.#nodes)) throw Error('No duplicate Nodes allowed');

        // No orphans (children != parents)
        for (const node of this.#nodes) {
            for (const parent of node.parents) {
                if (!parent.isParentOf(node)) throw Error(`Nodes ${node.label} and ${parent.label} have a broken Parent/Child connection`);
            }

            for (const child of node.children)
                if (!child.isChildOf(node)) throw Error(`Nodes ${node.label} and ${child.label} have a broken Child/Parent connection`);
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

    execute() {
        if (this.#hasExecuted) return;

        for (const node of this.execNodes) {
            node.execute();
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
    }
}
