import {Node} from '../src/pipeline/node';
import {Pipeline} from '../src/pipeline/pipeline';

const callback: (params: object) => object = params => {
    return {...params};
};

const none = {};

describe('Pipeline', () => {
    let pipeline: Pipeline;
    let nodes: Array<Node> = [];

    beforeAll(() => {
        // Node setup matching "node.test.ts"
        nodes.push(new Node({callback}));
        nodes.push(
            new Node({
                parents: [nodes[0]],
                callback: params => {
                    return {...params, more: 'more'};
                },
            }),
        );
        nodes.push(new Node({callback, children: [nodes[0]], globals: {info: 'info'}}));
        nodes.push(new Node({callback, parents: [nodes[2]], children: [nodes[1]]}));
        nodes.push(new Node({callback, children: [nodes[1]]}));
        nodes.push(new Node({callback, parents: [nodes[2]]}));
        nodes.push(new Node({callback, label: 'alone'}));

        // Quick validate setup
        expect(nodes[0].parents.length).toBe(1);
        expect(nodes[0].children.length).toBe(1);
        expect(nodes[1].parents.length).toBe(3);
        expect(nodes[1].children.length).toBe(0);
        expect(nodes[2].parents.length).toBe(0);
        expect(nodes[2].children.length).toBe(3);
        expect(nodes[3].parents.length).toBe(1);
        expect(nodes[3].children.length).toBe(1);
        expect(nodes[4].parents.length).toBe(0);
        expect(nodes[4].children.length).toBe(1);
        expect(nodes[5].parents.length).toBe(1);
        expect(nodes[5].children.length).toBe(0);
        expect(nodes[6].parents.length).toBe(0);
        expect(nodes[6].children.length).toBe(0);
    });

    describe('when creating a Pipeline', () => {
        test('it fails when providing zero Nodes', () => {
            expect(() => {
                new Pipeline({nodes: []});
            }).toThrow();
        });

        test('it fails if you provide duplicate Nodes', () => {
            const nodeA = new Node({callback});
            const nodeB = new Node({callback});
            expect(() => {
                new Pipeline({nodes: [nodeA, nodeB, nodeA]});
            }).toThrow();

            nodes.push(nodeA); // 7
            nodes.push(nodeB); // 8
        });

        test('it fails if you provide orphaned Nodes', () => {
            const nodeA = nodes[7];
            const nodeB = nodes[8];
            nodeA.linkChild(nodeB);

            let parentMock = jest.spyOn(nodeA, 'isParentOf').mockImplementation(() => {
                return false;
            });

            expect(() => {
                new Pipeline({nodes: [nodeA, nodeB]});
            }).toThrow();

            parentMock.mockRestore();

            let childMock = jest.spyOn(nodeB, 'isChildOf').mockImplementation(() => {
                return false;
            });

            expect(() => {
                new Pipeline({nodes: [nodeA, nodeB]});
            }).toThrow();

            childMock.mockRestore();
            nodeA.unlinkChild(nodeB);
        });

        test('it fails if no execution nodes are detected', () => {
            const nodeA = nodes[7];
            const nodeB = nodes[8];
            const nodeC = new Node({callback});
            nodes.push(nodeC);

            // Perfect loop
            nodeA.linkChild(nodeB);
            nodeB.linkChild(nodeC);
            nodeC.linkChild(nodeA);

            expect(() => {
                new Pipeline({nodes: [nodeA, nodeB, nodeC]});
            }).toThrow();
        });

        test('it fails if a loop is detected in the graph', () => {
            const nodeA = nodes[7];
            const nodeB = nodes[8];
            const nodeC = nodes[9];
            const nodeD = new Node({callback});

            nodeD.linkChild(nodeA);

            expect(() => {
                new Pipeline({nodes: [nodeA, nodeB, nodeC, nodeD]});
            }).toThrow();

            // Cleanup
            nodeA.destroy();
            nodeB.destroy();
            nodeC.destroy();
            nodeD.destroy();

            nodes.splice(nodes.length - 1, 1);
            nodes.splice(nodes.length - 1, 1);
            nodes.splice(nodes.length - 1, 1);

            expect(nodes.length).toBe(7);
        });

        test('it fails if Nodes are connected to Nodes not in the list', () => {
            // Parent
            expect(() => {
                new Pipeline({nodes: [nodes[0], nodes[1], nodes[2], nodes[3], nodes[5], nodes[6]]});
            }).toThrow();

            // Child
            expect(() => {
                new Pipeline({nodes: [nodes[0], nodes[1], nodes[2], nodes[3], nodes[4], nodes[6]]});
            }).toThrow();
        });

        test('it succeeds when creating with the valid node array', () => {
            const p = new Pipeline({nodes});
            expect(p).toBeInstanceOf(Pipeline);
            pipeline = p;
        });
    });

    describe('when executing the Pipeline', () => {
        test('before execution, outputs is an empty object', () => {
            expect(pipeline.outputs).toEqual(none);
        });

        test('execution runs succesfully, with outputs listing an object for every node', () => {
            expect(() => {
                pipeline.execute();
            }).not.toThrow();

            const nodes = pipeline.nodes;
            for (const node of nodes) {
                expect(node.hasExecuted).toBeTruthy();
            }

            expect(pipeline.outputs).toBeInstanceOf(Object);
            for (const node of pipeline.nodes) {
                expect(Object.keys(pipeline.outputs)).toContain(node.label);
                expect(pipeline.outputs[node.label]).toBeInstanceOf(Object);
            }
        });

        test('running the exectuion again will do nothing (skips)', () => {
            expect(() => {
                pipeline.execute();
            }).not.toThrow();
        });

        test('calling reset() will reset all Nodes and clear output data', () => {
            expect(() => {
                pipeline.reset();
            }).not.toThrow();

            for (const node of nodes) {
                expect(node.hasExecuted).toBeFalsy();
            }

            expect(pipeline.outputs).toEqual(none);
        });

        test('executing once more works as expected', () => {
            expect(() => {
                pipeline.execute();
            }).not.toThrow();

            const nodes = pipeline.nodes;
            for (const node of nodes) {
                expect(node.hasExecuted).toBeTruthy();
            }

            expect(pipeline.outputs).toBeInstanceOf(Object);
            for (const node of pipeline.nodes) {
                expect(Object.keys(pipeline.outputs)).toContain(node.label);
                expect(pipeline.outputs[node.label]).toBeInstanceOf(Object);
            }
        });
    });

    describe('when creating a second Pipeline', () => {
        test('it should fail if using nodes in another Pipeline', () => {
            expect(() => {
                new Pipeline({nodes});
            }).toThrow();
        });

        test('it should work given new Nodes', () => {
            const n = new Node({callback});
            const p = new Pipeline({nodes: [n]});
            expect(p).toBeInstanceOf(Pipeline);
            p.destroy();
        });
    });

    describe('when destroying a Pipeline', () => {
        test('it should succeed', () => {
            expect(() => {
                pipeline.destroy();
            }).not.toThrow();
        });

        test('all nodes should be destroyed', () => {
            for (const node of nodes) {
                expect(node.children.length).toBe(0);
                expect(node.parents.length).toBe(0);
                expect(node.hasExecuted).toBeFalsy();
                expect(node.output).toEqual(none);
            }
        });

        test('outputs should be set to an empty object', () => {
            expect(pipeline.outputs).toEqual(none);
        });

        test('nodes should be an empty array', () => {
            expect(pipeline.nodes.length).toBe(0);
        });
    });
});
