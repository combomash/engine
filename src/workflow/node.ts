import {Registrar} from '../helpers/registrar';
import {Callback} from '../core/engine.interface';

export interface NodeParams {
    label?: string;
    parents?: Array<Node>;
    children?: Array<Node>;
    callback: Callback;
}

let i = 0;

class NodeRegistrar extends Registrar {
    static #instance: NodeRegistrar;
    private constructor() {
        super();
    }
    static get instance(): NodeRegistrar {
        if (!NodeRegistrar.#instance) {
            NodeRegistrar.#instance = new NodeRegistrar();
        }
        return NodeRegistrar.#instance;
    }
}

export class Node {
    label: string;

    private callback: Callback;

    #parents: Array<Node> = [];
    get parents() {
        return this.#parents;
    }

    #children: Array<Node> = [];
    get children() {
        return this.#children;
    }

    #hasExecuted: boolean = false;
    get hasExecuted() {
        return this.#hasExecuted;
    }

    #output: object = {};
    get output() {
        return this.#output ?? {};
    }

    constructor({label, callback, parents = [], children = []}: NodeParams) {
        this.label = label ?? `node_${i}`;
        if (!NodeRegistrar.instance.register(this.label)) {
            throw new Error(`Node ${label} has already been created (must have unique label)`);
        }
        i++;

        for (const parent of parents) this.linkParent(parent);
        for (const child of children) this.linkChild(child);
        this.callback = callback;
    }

    isChildOf(node: Node) {
        return node.#children.includes(this);
    }

    isParentOf(node: Node) {
        return node.#parents.includes(this);
    }

    private checkForSelfLinking(node: Node) {
        if (node === this) throw Error('Nodes cannot be linked to themselves');
    }

    private hasParentToChildConnection(node: Node) {
        return this.isChildOf(node) && node.isParentOf(this);
    }

    linkParent(node: Node) {
        this.checkForSelfLinking(node);
        if (!this.hasParentToChildConnection(node)) {
            this.#parents.push(node);
            node.#children.push(this);
        } else {
            throw Error(`Linking Parent node ${node.label} has failed`);
        }
    }

    unlinkParent(node: Node) {
        this.checkForSelfLinking(node);
        if (this.hasParentToChildConnection(node)) {
            this.#parents.splice(this.#parents.indexOf(node), 1);
            node.#children.splice(node.#children.indexOf(this), 1);
        } else {
            throw Error(`Unlinking Parent node ${node.label} has failed`);
        }
    }

    private hasChildToParentConnection(node: Node) {
        return this.isParentOf(node) && node.isChildOf(this);
    }

    linkChild(node: Node) {
        this.checkForSelfLinking(node);
        if (!this.hasChildToParentConnection(node)) {
            this.#children.push(node);
            node.#parents.push(this);
        } else {
            throw Error(`Linking Child node ${node.label} has failed`);
        }
    }

    unlinkChild(node: Node) {
        this.checkForSelfLinking(node);
        if (this.hasChildToParentConnection(node)) {
            this.#children.splice(this.#children.indexOf(node), 1);
            node.#parents.splice(node.#parents.indexOf(this), 1);
        } else {
            throw Error(`Unlinking Child node ${node} has failed`);
        }
    }

    reset(): void {
        this.#hasExecuted = false;
        this.#output = {};
    }

    execute(globals: object): void {
        if (this.hasExecuted) return;

        let inputs: object = {};
        let allParentsHaveExecuted = true;
        for (const parent of this.#parents) {
            if (parent.hasExecuted) {
                inputs = {
                    ...inputs,
                    ...parent.output,
                };
                continue;
            }
            allParentsHaveExecuted = false;
            break;
        }

        if (!allParentsHaveExecuted) return;

        this.#output = this.callback({
            ...globals,
            ...inputs,
        });

        this.#hasExecuted = true;

        for (const child of this.#children) {
            child.execute({...globals});
        }
    }

    destroy() {
        NodeRegistrar.instance.delist(this.label);
        for (const parent of this.#parents) this.unlinkParent(parent);
        for (const child of this.#children) this.unlinkChild(child);
        this.callback = () => {
            return {};
        };
        this.#hasExecuted = false;
        this.#output = {};
    }
}
