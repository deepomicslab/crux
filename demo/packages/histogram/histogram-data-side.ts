// @ts-ignore
import data from "./hist-multi.json";

import Crux from "../../../src";

const numberOfBins = 30;
const columns = Object.keys(data[0]);
const colors = Crux.color.schemeCategoryAuto(columns).colors;
const max = Math.max.apply(null, columns.map(s => Math.max.apply(null, data.map(d => parseFloat(d[s])))));
const min = Math.min.apply(null, columns.map(s => Math.min.apply(null, data.map(d => parseFloat(d[s])))));
const gap = (max - min) / numberOfBins;

export const sideData = [];
columns.forEach((k, i) => {
    const distArray = data.map(d => parseFloat(d[k]));
    const range = [...Array(numberOfBins).keys()];
    const distData = range.map(r => {
        return {
            value: (distArray.filter(d => d >= min + r * gap && d <= min + (r + 1) * gap)).length / distArray.length,
            pos: min + r * gap,
        };
    });
    sideData.push({
        values: distData,
        color: colors[k],
        key: k,
        min, max, gap,
    });
});
