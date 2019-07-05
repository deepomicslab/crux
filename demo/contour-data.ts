import * as d3 from "d3-array";

// demo contour plot
function goldsteinPrice(x: number, y: number) {
    return (1 + Math.pow(x + y + 1, 2) * (19 - 14 * x + 3 * x * x - 14 * y + 6 * x * x + 3 * y * y))
        * (30 + Math.pow(2 * x - 3 * y, 2) * (18 - 32 * x + 12 * x * x + 48 * y - 36 * x * y + 27 * y * y));
}
const n = 256, m = 256;
export const contourData = new Array(n * m);

for (let j = 0.5, k = 0; j < m; ++j) {
    for (let i = 0.5; i < n; ++i, ++k) {
        contourData[k] = goldsteinPrice(i / n * 4 - 2, 1 - j / m * 3);
    }
}

export const contourThresholds = d3.range(2, 21).map(p => Math.pow(2, p));
