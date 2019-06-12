import { statistics } from "./statistics";

export function simpleLinearRegression<T>(data: T[] = []): {} {
    const n = data.length;
    let alpha = 0;
    let beta = 0;
    if (n > 0) {
        const xs: number[] = [];
        const ys: number[] = [];
        data.sort((x, y) => x[0] - y[0]);
        for (const d of data) {
            xs.push(d[0]);
            ys.push(d[1]);
        }
        const xMean = statistics(xs).getMean();
        const yMean = statistics(ys).getMean();
        let xyCov = 0;
        let xVar = 0;
        for (let i = 0; i < n; i++) {
            xyCov += (xs[i] - xMean) * (ys[i] - yMean);
            xVar += (xs[i] - xMean) ** 2;
        }
        beta = xyCov / xVar;
        alpha = yMean - beta * xMean;
    }
    const x1 = Math.floor(data[0][0]);
    const y1 = beta * x1 + alpha;
    const x2 = Math.ceil(data[n - 1][0]);
    const y2 = beta * x2 + alpha;
    return [[x1, y1], [x2, y2]];
}
