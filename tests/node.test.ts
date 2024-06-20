import {Node} from '../src/pipeline/node';

type Callback = (params: object) => object;

/*
> all nodes pass inputs along in the output object
> node_2 adds info via globals that is passed along
> node_1 adds more when it returns

            node_4 -->|
node_2 ---> node_0 ----> node_1
	   |--> node_3 -->|
	   |--> node_5

node_6
*/

describe('Node', () => {
    let node: Node;
    let nodes: Array<Node> = [];
    let callback: Callback = params => {
        return {...params};
    };

    describe('when creating the Node (0)', () => {
        beforeEach(() => {
            node = nodes[0];
        });

        test('with only a callback is a success', () => {
            const n = new Node({callback});
            expect(n).toBeInstanceOf(Node);
            nodes.push(n);
        });

        test('label is "node_0"', () => {
            expect(node.label).toBe('node_0');
        });

        test('it has not executed', () => {
            expect(node.hasExecuted).toBe(false);
        });

        test('it does not have children Nodes', () => {
            expect(node.children.length).toBe(0);
        });

        test('it is not a parent of any Nodes', () => {
            expect(node.parents.length).toBe(0);
        });

        test('output is an empty object', () => {
            expect(node.output).toEqual({});
        });

        test('calling execute() sets hasExecuted to true', () => {
            node.execute();
            expect(node.hasExecuted).toBeTruthy();
        });

        test('calling reset() sets hasExecuted to false', () => {
            node.reset();
            expect(node.hasExecuted).toBeFalsy();
        });
    });

    describe('when creating Node (1)', () => {
        beforeEach(() => {
            node = nodes[1];
        });

        test('providing a callback that returns additional data', () => {
            const n = new Node({
                callback: params => {
                    return {...params, more: 'more'};
                },
            });
            expect(n).toBeInstanceOf(Node);
            nodes.push(n);
        });

        test('using linkParent to connect to itself throws an Error', () => {
            expect(() => {
                node.linkParent(node);
            }).toThrow();
        });

        test('using linkParent to connect to node_0 succeeds', () => {
            expect(() => {
                node.linkParent(nodes[0]);
            }).not.toThrow();

            expect(node.parents.length).toBe(1);
            expect(node.parents.includes(nodes[0])).toBeTruthy();

            expect(nodes[0].children.length).toBe(1);
            expect(nodes[0].children.includes(node)).toBeTruthy();
        });

        test('using linkParent again to connect to node_0 throws an Error', () => {
            expect(() => {
                node.linkParent(nodes[0]);
            }).toThrow();
        });

        test('using unlinkParent to remove node_0 succeeds', () => {
            expect(() => {
                node.unlinkParent(nodes[0]);
            }).not.toThrow();
            expect(node.parents.length).toBe(0);
            expect(nodes[0].children.length).toBe(0);
        });

        test('using unlinkParent again to remove node_0 throw an Error', () => {
            expect(() => {
                node.unlinkParent(nodes[0]);
            }).toThrow();
        });

        test('using linkParent again after unlinking to connect node_0 succeeds', () => {
            expect(() => {
                node.linkParent(nodes[0]);
            }).not.toThrow();

            expect(node.parents.length).toBe(1);
            expect(node.parents.includes(nodes[0])).toBeTruthy();

            expect(nodes[0].children.length).toBe(1);
            expect(nodes[0].children.includes(node)).toBeTruthy();
        });
    });

    describe('when creating Node (2)', () => {
        beforeEach(() => {
            node = nodes[2];
        });

        test('providing a globals object succeeds', () => {
            const n = new Node({callback, globals: {info: 'info'}});
            expect(n).toBeInstanceOf(Node);
            expect(n.label).toBe('node_2');
            nodes.push(n);
        });

        test('using linkChild to connect to itself throws an Error', () => {
            expect(() => {
                node.linkChild(node);
            }).toThrow();
        });

        test('using linkChild to connect node_0 succeeds', () => {
            expect(() => {
                node.linkChild(nodes[0]);
            }).not.toThrow();

            expect(node.children.length).toBe(1);
            expect(node.children.includes(nodes[0])).toBeTruthy();

            expect(nodes[0].parents.length).toBe(1);
            expect(nodes[0].parents.includes(node)).toBeTruthy();
        });

        test('using linkChild again to connect to node_0 throws an Error', () => {
            expect(() => {
                node.linkChild(nodes[0]);
            }).toThrow();
        });

        test('using unlinkChild to remove node_0 succeeds', () => {
            expect(() => {
                node.unlinkChild(nodes[0]);
            }).not.toThrow();
            expect(node.children.length).toBe(0);
            expect(nodes[0].parents.length).toBe(0);
        });

        test('using unlinkChild again to remove node_0 throw an Error', () => {
            expect(() => {
                node.unlinkChild(nodes[0]);
            }).toThrow();
        });

        test('using linkChild again after unlinking to connect node_0 succeeds', () => {
            expect(() => {
                node.linkChild(nodes[0]);
            }).not.toThrow();

            expect(node.children.length).toBe(1);
            expect(node.children.includes(nodes[0])).toBeTruthy();

            expect(nodes[0].parents.length).toBe(1);
            expect(nodes[0].parents.includes(node)).toBeTruthy();
        });
    });

    describe('when creating Node (3)', () => {
        beforeEach(() => {
            node = nodes[3];
        });

        test('providing node_1 as a parent and node_2 as a child succesfully links them', () => {
            const parent = nodes[2];
            const child = nodes[1];

            const node = new Node({callback, parents: [parent], children: [child]});
            expect(node).toBeInstanceOf(Node);
            nodes.push(node);

            expect(node.parents.length).toBe(1);
            expect(node.children.length).toBe(1);
            expect(node.parents.includes(parent)).toBeTruthy();
            expect(node.children.includes(child)).toBeTruthy();

            expect(parent.children.length).toBe(2);
            expect(parent.children.includes(node)).toBeTruthy();

            expect(child.parents.length).toBe(2);
            expect(child.parents.includes(node)).toBeTruthy();
        });
    });

    describe('completing the node graph', () => {
        test('creating Node (4) as a root parent of node_1', () => {
            const n = new Node({callback, children: [nodes[1]]});
            expect(n).toBeInstanceOf(Node);
            expect(n.children.length).toBe(1);
            expect(nodes[1].parents.length).toBe(3);
            nodes.push(n);
        });

        test('creating Node (5) as leaf child of node_2', () => {
            const n = new Node({callback, parents: [nodes[2]]});
            expect(n).toBeInstanceOf(Node);
            expect(n.parents.length).toBe(1);
            expect(nodes[2].children.length).toBe(3);
            nodes.push(n);
        });

        test('creating Node (6) as float (no parents or children), with a custom label', () => {
            const n = new Node({callback, label: 'alone'});
            expect(n).toBeInstanceOf(Node);
            expect(n.label).toBe('alone');
            nodes.push(n);
        });
    });

    const resetAll = () => {
        for (let i = 0; i < 7; i++) {
            nodes[i].reset();
        }
    };

    describe('when executing each of the nodes from a reset state', () => {
        const executions = [
            {
                run: [0],
                has: [],
                not: [0, 1, 2, 3, 4, 5, 6],
            },
            {
                run: [1],
                has: [],
                not: [0, 1, 2, 3, 4, 5, 6],
            },
            {
                run: [2],
                has: [0, 2, 3, 5],
                not: [1, 4, 6],
            },
            {
                run: [3],
                has: [],
                not: [0, 1, 2, 3, 4, 5, 6],
            },
            {
                run: [4],
                has: [4],
                not: [0, 1, 2, 3, 5, 6],
            },
            {
                run: [5],
                has: [],
                not: [0, 1, 2, 3, 4, 5, 6],
            },
            {
                run: [6],
                has: [6],
                not: [0, 1, 2, 3, 4, 5],
            },
            {
                run: [2, 4],
                has: [0, 1, 2, 3, 4, 5],
                not: [6],
            },
            {
                run: [2, 4, 6],
                has: [0, 1, 2, 3, 4, 5, 6],
                not: [],
            },
        ];

        beforeEach(resetAll);

        for (const e of executions) {
            test(`Executing nodes [${e.run}] should result in [${e.has}] executing, while [${e.not}] do not`, () => {
                for (const r of e.run) {
                    nodes[r].execute();
                }

                const checks = new Set();

                for (const h of e.has) {
                    expect(nodes[h].hasExecuted).toBeTruthy();
                    checks.add(h);
                }

                for (const n of e.not) {
                    expect(nodes[n].hasExecuted).toBeFalsy();
                    checks.add(n);
                }

                expect(checks.size).toBe(7);
            });
        }
    });

    describe('when executing the full graph', () => {
        const none = {};
        const info = {info: 'info'};
        const more = {...info, more: 'more'};

        beforeAll(() => {
            resetAll();
            nodes[2].execute();
            nodes[4].execute();
            nodes[6].execute();
        });

        test('"info" and "more" data is propagated through the graph correctly', () => {
            expect(nodes[0].output).toEqual(info);
            expect(nodes[1].output).toEqual(more);
            expect(nodes[2].output).toEqual(info);
            expect(nodes[3].output).toEqual(info);
            expect(nodes[4].output).toEqual(none);
            expect(nodes[5].output).toEqual(info);
            expect(nodes[6].output).toEqual(none);
        });

        test('executing everything again should have no affect on the output (skips)', () => {
            nodes[2].execute();
            nodes[4].execute();
            nodes[6].execute();
            expect(nodes[0].output).toEqual(info);
            expect(nodes[1].output).toEqual(more);
            expect(nodes[2].output).toEqual(info);
            expect(nodes[3].output).toEqual(info);
            expect(nodes[4].output).toEqual(none);
            expect(nodes[5].output).toEqual(info);
            expect(nodes[6].output).toEqual(none);
        });

        test('calling reset() will set ouput back to an empty object', () => {
            resetAll();
            expect(nodes[0].output).toEqual(none);
            expect(nodes[1].output).toEqual(none);
            expect(nodes[2].output).toEqual(none);
            expect(nodes[3].output).toEqual(none);
            expect(nodes[4].output).toEqual(none);
            expect(nodes[5].output).toEqual(none);
            expect(nodes[6].output).toEqual(none);
        });
    });
});
