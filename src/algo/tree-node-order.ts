import { minBy } from "lodash";
import { NewickNode } from "../utils";

// left, right, score
type Case = [number, number, number];
interface BestScore {
    score: number;
    order: number[];
    plan: Case[];
}

export interface Node extends NewickNode {
    color: number;
    children: Node[];
    cases?: Case[];
    dp: BestScore[][];
}

function isLeaf(node: NewickNode) {
    return !node.children || !node.children.length;
}

function* leaves(root: Node): Generator<Node> {
    if (isLeaf(root)) {
        yield root;
    } else {
        for (const child of root.children) {
            yield* leaves(child);
        }
    }
}

function range(len: number): number[] {
    return Array.from(Array(len), (_, i) => i);
}

function fill<T>(len: number, f: (d: undefined, i: number) => T): T[] {
    return Array.from(Array(len), f);
}

function* permutations<T>(arr: T[]): Generator<T[]> {
    const length = arr.length;
    const c = Array(length).fill(0);
    let i = 1,
        k: number,
        p: T;

    yield arr.slice();

    while (i < length) {
        if (c[i] < i) {
            k = i % 2 && c[i];
            p = arr[i];
            arr[i] = arr[k];
            arr[k] = p;
            ++c[i];
            i = 1;
            yield arr.slice();
        } else {
            c[i] = 0;
            ++i;
        }
    }
}

function* product<T>(...list: T[][]): Generator<T[]> {
    const [head, ...tail] = list;
    // @ts-ignore
    const remainder = tail.length > 0 ? product(...tail) : [[]];
    for (const r of remainder) for (const h of head) yield [h, ...r];
}

class Solver {
    colors: string[];
    colorRange: number[];

    constructor(colors: string[]) {
        this.colors = colors;
        this.colorRange = range(this.colors.length);
    }

    // @ts-ignore
    trace(node: Node, root?: Node, lr?: [number, number]) {
        if (isLeaf(node)) {
            root!.children.push(node);
            return;
        }

        const newSelf = {
            ...node,
            children: [],
        };
        let left: number;
        let right: number;
        if (lr) {
            left = lr[0];
            right = lr[1];
        } else {
            const minCase = minBy(node.cases, n => n[2])!;
            left = minCase[0];
            right = minCase[1];
        }

        const { order, plan } = node.dp[left][right];
        order.forEach((i, idx) => {
            this.trace(node.children[i], newSelf, [plan[idx][0], plan[idx][1]]);
        });

        if (root) {
            root.children.push(newSelf);
        } else {
            return newSelf;
        }
    }

    updateScoreWithOrder(node: Node, order: number[]) {
        const caseList = order.map(i => node.children[i].cases!);

        for (const plan of product(...caseList)) {
            let score = 0;
            let firstLeft = -1;
            let lastRight = -1;
            for (const [left, right, subScore] of plan) {
                score += subScore;
                if (lastRight >= 0) {
                    if (left !== lastRight) {
                        score += 1;
                    }
                } else {
                    firstLeft = left;
                }
                lastRight = right;
            }
            if (score < node.dp[firstLeft][lastRight].score) {
                node.dp[firstLeft][lastRight] = {
                    score,
                    order,
                    plan,
                };
            }
        }
    }

    updateScore(node: Node) {
        if (isLeaf(node)) return;

        // Update scores for all possible orders of children
        for (const order of permutations(range(node.children.length))) {
            this.updateScoreWithOrder(node, order);
        }

        // Gather stats for all cases for this node
        node.cases = [];
        for (const i of this.colorRange) {
            for (const j of this.colorRange) {
                const score = node.dp[i][j].score;
                if (isFinite(score)) node.cases.push([i, j, score]);
            }
        }
    }

    search(root: Node) {
        this.init(root);

        if (!isLeaf(root)) {
            for (const child of root.children) {
                this.search(child);
            }
        }
        this.updateScore(root);
    }

    init(root: Node) {
        if (!isLeaf(root)) {
            for (const child of root.children) {
                this.init(child);
            }
        }
        // init self
        root.dp = fill(this.colors.length, _ =>
            fill(this.colors.length, _ => ({
                score: Infinity,
                order: [],
                plan: [],
            })),
        );
        if (isLeaf(root)) {
            root.dp[root.color][root.color] = { score: 0, order: [], plan: [] };
            root.cases = [[root.color, root.color, 0]];
        }
    }
}

export function orderTreeNodes(root: Node, colorFunc: (node: Node) => string) {
    // return root;
    const colors: string[] = [];
    for (const leaf of leaves(root)) {
        const color = colorFunc(leaf);
        const index = colors.indexOf(color);
        if (index < 0) {
            colors.push(color);
            leaf.color = colors.length - 1;
        } else {
            leaf.color = index;
        }
    }
    const solver = new Solver(colors);
    solver.search(root);
    const newRoot = solver.trace(root);
    return newRoot;
}
