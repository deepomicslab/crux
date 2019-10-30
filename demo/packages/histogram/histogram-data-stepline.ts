// @ts-ignore
import data from "./step-line.json";

import Crux from "../../../src";

const startingPoint = [0, 1, 2, 3];
const endPoint = [4, 4, 4, 9];
const columns = Object.keys(data[0]);
const length = data.length;
const colors = Crux.color.schemeCategoryAuto(columns).colors;

export const steplineData = {};
columns.forEach((k, i) => {
    const distArray = data.map((d, j) => ({
        value: parseFloat(d[k]),
        pos: startingPoint[i] + (j + 0.5) * (endPoint[i] - startingPoint[i]) / length,
    }));

    steplineData[k] = {
        values: distArray,
        color: colors[k],
        key: k,
    };
});
