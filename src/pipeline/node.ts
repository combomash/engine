type Callback = (params: object) => any;

interface Params {
    label?: string;
    parents?: Array<Node>;
    children?: Array<Node>;
    globals?: object;
    callback: Callback;
}

let i = 0;

export class Node {
    label: string;

    private callback: Callback;
    private parents: Array<Node> = [];
    private children: Array<Node> = [];
    private globals: object = {};

    #hasExecuted: boolean = false;
    get hasExecuted() {
        return this.#hasExecuted;
    }

    #output: object = {};
    get output() {
        return this.#output;
    }

    constructor({label, callback, parents = [], children = [], globals = {}}: Params) {
        this.label = label ?? `label_${i}`;
        this.callback = callback;
        this.parents.push(...parents);
        this.children.push(...children);
        this.globals = globals;
        i++;
    }

    isChildOf(node: Node) {
        return node.children.includes(this);
    }

    isParentOf(node: Node) {
        return node.parents.includes(this);
    }

    linkChild(node: Node) {
        if (!this.isParentOf(node) && !node.isChildOf(this)) {
            this.parents.push(node);
            node.children.push(this);
        }
    }

    linkParent(node: Node) {
        if (!this.isChildOf(node) && !node.isParentOf(this)) {
            this.children.push(node);
            node.parents.push(this);
        }
    }

    unlinkChild(node: Node) {
        if (this.isParentOf(node) && node.isChildOf(this)) {
            this.parents.splice(this.parents.indexOf(node), 1);
            node.children.splice(node.children.indexOf(this), 1);
        }
    }

    unlinkParent(node: Node) {
        if (this.isChildOf(node) && node.isParentOf(this)) {
            this.children.splice(this.children.indexOf(node), 1);
            node.parents.splice(node.parents.indexOf(this), 1);
        }
    }

    reset(): void {
        this.#hasExecuted = false;
    }

    execute(): void {
        if (this.hasExecuted) return;

        let inputs: object = {};
        let allParentsHaveExecuted = true;
        for (const parent of this.parents) {
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
            ...inputs,
            ...this.globals,
        });

        this.#hasExecuted = true;

        for (const child of this.children) {
            child.execute();
        }
    }
}
