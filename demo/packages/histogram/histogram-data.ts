// tslint:disable-next-line: max-line-length
const rawData = `11,12,55,44,13,30,29,49,35,24,13,22,64,38,30,41,108,38,62,43,42,19,28,37,46,55,20,39,40,27,35,39,42,40,44,45,46,23,26,25,12,9,29,39,37,47,42,46,34,35,36,34,35,36,35,35,36,36,36,37,36,24,34,35,36,36,37,33,32,31,32,33`;

const distArray = rawData.split(",").map(x => parseInt(x));

const range = [...Array(Math.ceil(Math.max.apply(null, distArray) / 10) * 3).keys()];

export const distData = range.map(r => {
    return {
        value: (distArray.filter(d => d > r * 10 / 3 && d < (r + 1) * 10 / 3)).length / distArray.length,
        pos: (r + 0.5) * 10 / 3,
    };
});

export const accumulatedData: {value: number, pos: number}[] = [];

distData.reduce((a, b, i) => accumulatedData[i] = {
    value: a.value + b.value,
    pos: b.pos,
}, {value: 0, pos: 0});

export const revAccumulatedData = accumulatedData.map(d => ({ value: d.value = 1 - d.value, pos: d.pos }));

export const bins = [5, 20, 30, 35, 40, 50, 120];

export const unequalData = [...Array(bins.length - 1).keys()].map(r => {
    return {
        value: distArray.filter(d => d >= bins[r] && d < bins[r + 1]).length / distArray.length,
        pos: bins[r],
    };
});
