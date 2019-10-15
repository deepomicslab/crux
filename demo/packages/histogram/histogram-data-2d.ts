// @ts-ignore
import data from "./hist-multi.json";

const numberOfBins = 60;
const columns = Object.keys(data[0]);
const max1 = Math.max.apply(Math, data.map(d => d[columns[0]]));
const max2 = Math.max.apply(Math, data.map(d => d[columns[1]]));
const min1 = Math.min.apply(Math, data.map(d => d[columns[0]]));
const min2 = Math.min.apply(Math, data.map(d => d[columns[1]]));
const gap1 = (max1 - min1) / numberOfBins;
const gap2 = (max2 - min2) / numberOfBins;

export const hist2dData = Array.from(Array(numberOfBins), _ => Array(numberOfBins).fill(0));
data.forEach(d => {
    let index1 = Math.floor((max2 - (d[columns[1]])) / gap2);
    let index2 = Math.floor((d[columns[0]] - min1) / gap1);
    index1 = index1 === numberOfBins ? numberOfBins - 1 : index1;
    index2 = index2 === numberOfBins ? numberOfBins - 1 : index2;
    hist2dData[index1][index2] += 1;
});
