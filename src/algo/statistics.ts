export function statistics(data: number[]): Statistics {
    return new Statistics(data);
}

export class Statistics {
    private _data: number[];
    private _min: number;
    private _max: number;
    private _sum: number;
    private _mean: number;
    private _median: number;
    private _firstQuartile: number;
    private _thirdQuartile: number;
    private _length: number;

    constructor(data: number[]) {
        this._data = data.sort((x, y) => x - y);
        this._length = this._data.length;
        if (this._length === 1) {
            this._firstQuartile = this._data[0];
            this._thirdQuartile = this._data[0];
            this._mean = this._data[0];
            this._median = this._data[0];
        } else if (this._length === 2) {
            this._firstQuartile = this._data[0];
            this._thirdQuartile = this._data[1];
            this._mean = (this._data[0] + this._data[1]) / 2;
            this._median = (this._data[0] + this._data[1]) / 2;
        } else if (this._length === 3) {
            this._firstQuartile = this._data[0];
            this._thirdQuartile = this._data[2];
            this._mean = (this._data[0] + this._data[1] + this._data[2]) / 3;
            this._median = this._data[1];
        } else {
            const tmpFirstQuartile = this._length * 25 / 100;
            this._firstQuartile = Number.isInteger(tmpFirstQuartile) ?
            (this._data[tmpFirstQuartile - 1] + this._data[tmpFirstQuartile]) / 2 : this._data[Math.ceil(tmpFirstQuartile)];

            this._median = this._length % 2 === 0 ? (this._data[this._length / 2 - 1] +
                this._data[this._length / 2]) / 2 : this._data[Math.floor(this._length / 2)];

                const tmpThirdQuartile = this._length * 75 / 100;
            this._thirdQuartile = Number.isInteger(tmpThirdQuartile) ?
            (this._data[tmpThirdQuartile - 1] + this._data[tmpThirdQuartile]) / 2 : this._data[Math.ceil(tmpThirdQuartile) - 1];
        }
        if (this._data.length > 0) {
            let sum = 0;
            let min = this._data[0];
            let max = this._data[0];
            for (const d of this._data) {
                sum += d;
                min = d < min ? d : min;
                max = d > max ? d : max;
            }
            this._min = min;
            this._max = max;
            this._sum = sum;
            this._mean = sum / this._length;
        } else {
            throw new Error(`Data is empty`);
        }
    }

    public getData(): number[] { return this._data; }

    public length(): number { return this._length; }

    public sum(): number { return this._sum; }

    public min(): number { return this._min; }

    public max(): number { return this._max; }

    public mean(): number { return this._mean; }

    public median(): number { return this._median; }

    public Q1(): number { return this._firstQuartile; }

    public Q3(): number { return this._thirdQuartile; }

    public variance(): number {
        const mean = this.mean();
        const squaredSum = this._data.reduce((squaredSum, current) => squaredSum + (current - mean) ** 2, 0);
        return squaredSum / this._length;
    }

    public std(): number {
        const mean = this.mean();
        return Math.sqrt(this._data.reduce((squaredSum, current) => squaredSum + (current - mean) ** 2, 0)  / this._length);
    }
}

export function tDistribution<Number>(df: number, confidence: number = 0.8): number {
    const tTable: {} = {
        // tslint:disable-next-line:max-line-length
        0.8 : {1: 3.078, 2: 1.886, 3: 1.638, 4: 1.533, 5: 1.476, 6: 1.44, 7: 1.415, 8: 1.397, 9: 1.383, 10: 1.372, 11: 1.363, 12: 1.356, 13: 1.35, 14: 1.345, 15: 1.341, 16: 1.337, 17: 1.333, 18: 1.33, 19: 1.328, 20: 1.325, 21: 1.323, 22: 1.321, 23: 1.319, 24: 1.318, 25: 1.316, 26: 1.315, 27: 1.314, 28: 1.313, 29: 1.311, 30: 1.31, 31: 1.309, 32: 1.309, 33: 1.308, 34: 1.307, 35: 1.306, 36: 1.306, 37: 1.305, 38: 1.304, 39: 1.304, 40: 1.303, 42: 1.302, 44: 1.301, 46: 1.3, 48: 1.299, 50: 1.299, 60: 1.296, 70: 1.294, 80: 1.292, 90: 1.291, 100: 1.29, 120: 1.289, 150: 1.287, 200: 1.286, 300: 1.284, 500: 1.283, "inf": 1.282},
        // tslint:disable-next-line:max-line-length
        0.9 : {1: 6.314, 2: 2.92, 3: 2.353, 4: 2.132, 5: 2.015, 6: 1.943, 7: 1.895, 8: 1.86, 9: 1.833, 10: 1.812, 11: 1.796, 12: 1.782, 13: 1.771, 14: 1.761, 15: 1.753, 16: 1.746, 17: 1.74, 18: 1.734, 19: 1.729, 20: 1.725, 21: 1.721, 22: 1.717, 23: 1.714, 24: 1.711, 25: 1.708, 26: 1.706, 27: 1.703, 28: 1.701, 29: 1.699, 30: 1.697, 31: 1.695, 32: 1.694, 33: 1.692, 34: 1.691, 35: 1.69, 36: 1.688, 37: 1.687, 38: 1.686, 39: 1.685, 40: 1.684, 42: 1.682, 44: 1.68, 46: 1.679, 48: 1.677, 50: 1.676, 60: 1.671, 70: 1.667, 80: 1.664, 90: 1.662, 100: 1.66, 120: 1.658, 150: 1.655, 200: 1.652, 300: 1.65, 500: 1.648, "inf": 1.645},
        // tslint:disable-next-line:max-line-length
        0.95 : {1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571, 6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228, 11: 2.201, 12: 2.179, 13: 2.16, 14: 2.145, 15: 2.131, 16: 2.12, 17: 2.11, 18: 2.101, 19: 2.093, 20: 2.086, 21: 2.08, 22: 2.074, 23: 2.069, 24: 2.064, 25: 2.06, 26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045, 30: 2.042, 31: 2.04, 32: 2.037, 33: 2.035, 34: 2.032, 35: 2.03, 36: 2.028, 37: 2.026, 38: 2.024, 39: 2.023, 40: 2.021, 42: 2.018, 44: 2.015, 46: 2.013, 48: 2.011, 50: 2.009, 60: 2.0, 70: 1.994, 80: 1.99, 90: 1.987, 100: 1.984, 120: 1.98, 150: 1.976, 200: 1.972, 300: 1.968, 500: 1.965, "inf": 1.96},
        // tslint:disable-next-line:max-line-length
        0.98 : {1: 31.82, 2: 6.965, 3: 4.541, 4: 3.747, 5: 3.365, 6: 3.143, 7: 2.998, 8: 2.897, 9: 2.821, 10: 2.764, 11: 2.718, 12: 2.681, 13: 2.65, 14: 2.625, 15: 2.602, 16: 2.584, 17: 2.567, 18: 2.552, 19: 2.539, 20: 2.528, 21: 2.518, 22: 2.508, 23: 2.5, 24: 2.492, 25: 2.485, 26: 2.479, 27: 2.473, 28: 2.467, 29: 2.462, 30: 2.457, 31: 2.453, 32: 2.449, 33: 2.445, 34: 2.441, 35: 2.438, 36: 2.434, 37: 2.431, 38: 2.429, 39: 2.426, 40: 2.423, 42: 2.418, 44: 2.414, 46: 2.41, 48: 2.407, 50: 2.403, 60: 2.39, 70: 2.381, 80: 2.374, 90: 2.369, 100: 2.364, 120: 2.358, 150: 2.351, 200: 2.345, 300: 2.339, 500: 2.334, "inf": 2.326},
        // tslint:disable-next-line:max-line-length
        0.99 : {1: 63.657, 2: 9.925, 3: 5.841, 4: 4.604, 5: 4.032, 6: 3.707, 7: 3.499, 8: 3.355, 9: 3.25, 10: 3.169, 11: 3.106, 12: 3.055, 13: 3.012, 14: 2.977, 15: 2.947, 16: 2.921, 17: 2.898, 18: 2.878, 19: 2.861, 20: 2.845, 21: 2.831, 22: 2.819, 23: 2.807, 24: 2.797, 25: 2.787, 26: 2.779, 27: 2.771, 28: 2.763, 29: 2.756, 30: 2.75, 31: 2.744, 32: 2.738, 33: 2.733, 34: 2.728, 35: 2.724, 36: 2.719, 37: 2.715, 38: 2.712, 39: 2.708, 40: 2.704, 42: 2.698, 44: 2.692, 46: 2.687, 48: 2.682, 50: 2.678, 60: 2.66, 70: 2.648, 80: 2.639, 90: 2.632, 100: 2.626, 120: 2.617, 150: 2.609, 200: 2.601, 300: 2.592, 500: 2.586, "inf": 2.576},
        // tslint:disable-next-line:max-line-length
        0.995 : {1: 127.321, 2: 14.089, 3: 7.453, 4: 5.598, 5: 4.773, 6: 4.317, 7: 4.029, 8: 3.833, 9: 3.69, 10: 3.581, 11: 3.497, 12: 3.428, 13: 3.372, 14: 3.326, 15: 3.286, 16: 3.252, 17: 3.222, 18: 3.197, 19: 3.174, 20: 3.153, 21: 3.135, 22: 3.119, 23: 3.104, 24: 3.09, 25: 3.078, 26: 3.067, 27: 3.057, 28: 3.047, 29: 3.038, 30: 3.03, 31: 3.022, 32: 3.015, 33: 3.008, 34: 3.002, 35: 2.996, 36: 2.991, 37: 2.985, 38: 2.98, 39: 2.976, 40: 2.971, 42: 2.963, 44: 2.956, 46: 2.949, 48: 2.943, 50: 2.937, 60: 2.915, 70: 2.899, 80: 2.887, 90: 2.878, 100: 2.871, 120: 2.86, 150: 2.849, 200: 2.839, 300: 2.828, 500: 2.82, "inf": 2.807},
        // tslint:disable-next-line:max-line-length
        0.998 : {1: 318.309, 2: 22.327, 3: 10.215, 4: 7.173, 5: 5.893, 6: 5.208, 7: 4.785, 8: 4.501, 9: 4.297, 10: 4.144, 11: 4.025, 12: 3.93, 13: 3.852, 14: 3.787, 15: 3.733, 16: 3.686, 17: 3.646, 18: 3.61, 19: 3.579, 20: 3.552, 21: 3.527, 22: 3.505, 23: 3.485, 24: 3.467, 25: 3.45, 26: 3.435, 27: 3.421, 28: 3.408, 29: 3.396, 30: 3.385, 31: 3.375, 32: 3.365, 33: 3.356, 34: 3.348, 35: 3.34, 36: 3.333, 37: 3.326, 38: 3.319, 39: 3.313, 40: 3.307, 42: 3.296, 44: 3.286, 46: 3.277, 48: 3.269, 50: 3.261, 60: 3.232, 70: 3.211, 80: 3.195, 90: 3.183, 100: 3.174, 120: 3.16, 150: 3.145, 200: 3.131, 300: 3.118, 500: 3.107, "inf": 3.09},
        // tslint:disable-next-line:max-line-length
        0.999 : {1: 636.619, 2: 31.599, 3: 12.924, 4: 8.61, 5: 6.869, 6: 5.959, 7: 5.408, 8: 5.041, 9: 4.781, 10: 4.587, 11: 4.437, 12: 4.318, 13: 4.221, 14: 4.14, 15: 4.073, 16: 4.015, 17: 3.965, 18: 3.922, 19: 3.883, 20: 3.85, 21: 3.819, 22: 3.792, 23: 3.768, 24: 3.745, 25: 3.725, 26: 3.707, 27: 3.69, 28: 3.674, 29: 3.659, 30: 3.646, 31: 3.633, 32: 3.622, 33: 3.611, 34: 3.601, 35: 3.591, 36: 3.582, 37: 3.574, 38: 3.566, 39: 3.558, 40: 3.551, 42: 3.538, 44: 3.526, 46: 3.515, 48: 3.505, 50: 3.496, 60: 3.46, 70: 3.435, 80: 3.416, 90: 3.402, 100: 3.391, 120: 3.373, 150: 3.357, 200: 3.34, 300: 3.323, 500: 3.31, "inf": 3.291},
    };
    const kConfidence: string = confidence.toString();
    // console.log("kConfidence", kConfidence);
    const kDF: string = df.toString();
    // console.log("kDF", kDF);
    let tValue: number;
    if (kConfidence in tTable) {
        if (kDF in tTable[kConfidence]) {
            tValue = (tTable[kConfidence][kDF] as number);
        } else {
            const keys = Object.keys(tTable[kConfidence]);
            if (df >= parseInt(keys[keys.length - 2])) {
                tValue = tTable[kConfidence][keys.length - 1];
            } else {
                for (let i = 0; i < keys.length - 2; i++) {
                    // console.log("parseInt(keys[i])", parseInt(keys[i]), "df", df, "parseInt(keys[i + 1])", parseInt(keys[i + 1]));
                    if (df >= parseInt(keys[i]) && df < parseInt(keys[i + 1])) {
                        tValue = tTable[kConfidence][keys[i]];
                        break;
                    }
                }
            }
        }
    }
    return tValue!;
}

export function simpleLinearRegression<T>(data: T[] = []): {
    start: {x: number, y: number}, end: {x: number, y: number}, slope: number, intercept: number, data: number[][]} {
    // function: y = alpha + beta * x
    const n = data.length;
    let alpha = 0;
    let beta = 0;
    const xs: number[] = [];
    const ys: number[] = [];
    if (n > 0) {
        data.sort((x, y) => x[0] - y[0]);
        for (const d of data) {
            xs.push(d[0]);
            ys.push(d[1]);
        }
        const xMean = statistics(xs).mean();
        const yMean = statistics(ys).mean();
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
    const predict: number[][] = [];
    for (let i = 0; i < n; i++) {
        predict.push([xs[i], beta * xs[i] + alpha]);
    }
    return { start: {x: x1, y: y1}, end: {x: x2, y: y2}, slope: beta, intercept: alpha, data: predict };
}

export function logisticRegression<T>(data: T[] = []): {} {
    return [];
}

export function confidenceBand<T>(data: T[] = [], method: string = "simple_linear", level: number = 0.8): number[][] {
    const n = data.length;
    const xList: number[] = data.map((d) => d[0]);
    const yList: number[] = data.map((d) => d[0]);
    const xStat = statistics(xList);
    let eList: any;
    if (method === "simple_linear") {
        eList = simpleLinearRegression(data);
    } else {
        eList = simpleLinearRegression(data);
    }
    const yStdResidual: number = Math.sqrt(yList.reduce((yStdResidual, yI, cI) => {
        // console.log("yI", yI, "cI", cI, "eList.data[cI][1]", eList.data[cI][1]);
        return yStdResidual + (yI - eList.data[cI][1]) ** 2;
    }) / (n - 2));
    // console.log("yStdResidual", yStdResidual);
    const xSumSquaredError: number = xList.reduce((xSumSquaredError, xI) => xSumSquaredError + (xI - xStat.mean()) ** 2);
    // console.log("xSumSquaredError", xSumSquaredError);
    const eStdResidualList: number[] = xList.map((x, i) => yStdResidual * Math.sqrt(1 / n + (x - xStat.mean()) ** 2) / xSumSquaredError);
    // console.log("eStdResidualList", eStdResidualList);
    const t = tDistribution(n - 2, level);
    // console.log("t", t);
    const cb = xList.map((x, i) => {
        // console.log("x", x, "i", i);
        const cbDataTmp = [x, eList.data[i][1] - t * eStdResidualList[i], eList.data[i][1] + t * eStdResidualList[i]];
        // console.log("[x, y1, y2]", cbDataTmp);
        return cbDataTmp;
    });
    return cb;
}

export function combine<T>(a: T[], min: number = 1): any[] {
    const fn = (n: number, src: any[], got: any[], all: any[]): void => {
        if (n === 0) {
            if (got.length > 0) {
                all[all.length] = got;
            }
            return;
        }
        for (let j = 0; j < src.length; j++) {
            fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
        }
        return;
    };
    const all: any[] = [];
    for (let i = min; i < a.length; i++) {
        fn(i, a, [], all);
    }
    all.push(a);
    return all;
}
