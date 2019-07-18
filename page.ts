// @ts-ignore
import * as d3 from "d3-array";

import { registerDefaultBioInfoComponents } from "./src/element/global";
import { visualize } from "./src/visualizer";

// @ts-ignore
import { dataLoader } from "./reconstructed/data";
// @ts-ignore
import { Reconstructed } from "./reconstructed/reconstructed";

import { confidenceBand, simpleLinearRegression } from "./src/algo";

// @ts-ignore
import t1 from "./test/templates/t1";
// @ts-ignore
import tarea from "./test/templates/tarea";
// @ts-ignore
import tbox from "./test/templates/tbox";
// @ts-ignore
import tcircos from "./test/templates/tcircos";
// @ts-ignore
import tdemo from "./test/templates/tdemo";
// @ts-ignore
import tdemo2 from "./test/templates/tdemo2";

// @ts-ignore
import bar from "./demo/bar/bar";
// @ts-ignore
import box from "./demo/box/box";
// @ts-ignore
import scatters from "./demo/box/demo_scatters";
// @ts-ignore
import { contourData, contourThresholds } from "./demo/contour-data";
// @ts-ignore
import contour from "./demo/contour/contour";
// @ts-ignore
import demo from "./demo/demo";
// @ts-ignore
import densityData from "./demo/density-data";
// @ts-ignore
import regression from "./demo/line/demo_linear_regression";
// @ts-ignore
import polyline from "./demo/line/demo_polyline";
// @ts-ignore
import pie from "./demo/pie/pie";
// @ts-ignore
import radar from "./demo/radar/demo_radar-chart";
// @ts-ignore
import scatterData from "./demo/scatter-data";
// @ts-ignore
import demo_vennDiagram from "./demo/venn/demo_venn-diagram";
// @ts-ignore
import violin from "./demo/violin/violin";

// @ts-ignore
import loadData from "./src/load-data";
import { parseNewick } from "./src/utils";
// @ts-ignore
import { DataSourceType } from "./src/utils/data-loader";
import { Visualizer } from "./src/visualizer/visualizer";
import { Clock } from "./test/templates/clock";
import newick from "./test/templates/newick";

// @ts-ignore
import demo_linear_regression from "./demo/line/demo_linear_regression";
// @ts-ignore
import demo_vennDiagram from "./demo/venn/demo_venn-diagram";

declare global {
    interface Window {
        $v: Visualizer;
    }
}

registerDefaultBioInfoComponents();

const treeData = parseNewick(newick);

document.addEventListener("DOMContentLoaded", () => {
    /*
    dataLoader.load().then((data) => {
        // console.log(data);
        const v = window["$v"] = visualize({
            el: "#canvas",
            root: new Reconstructed(0),
            props: {
                depth: data.depth,
                depthMax: data.depthMax,
                virus: data.virus,
                gene: data.gene,
                mutations: data.mutation,
            },
            width: "auto",
            height: 800,
        });
    });
    */

    // demo regression plot
    const regressionData = simpleLinearRegression(scatterData).data;
    const residualData = confidenceBand(scatterData);
    window.$v = visualize({
        el: "#canvas",
        template: violin,
        loadData: { data4: { content: "1" }},
        data: {
            array: [1, 3, 8, 6, 5, 4, 2, 7, 3],
            array2: [6, 4, 3, 2, 4, 9, 1, 5, 8],
            array3: [3, 7, 2, 5, 6, 5, 7, 3, 4],
            treeData,
            scatter_data: scatterData,
            regression_data: regressionData,
            contour_density_data: densityData,
            contour_data: contourData,
            contour_thresholds: contourThresholds,
            residual_data: residualData,
        },
        components: { Clock },
    });

    // // demo linear regression
    // const regressionData = simpleLinearRegression(scatterData).data;
    // const residualData = confidenceBand(scatterData);
    // window.$v = visualize({
    //     el: "#canvas",
    //     template: demo_linear_regression,
    //     data: {
    //         scatter_data: scatterData,
    //         regression_data: regressionData,
    //         residual_data: residualData,
    //     },
    // });

    // // demo scatters1d
    // const xAxisIndex = 4;
    // const yAxisIndex = 0;
    // const v = window["$v"] = visualize({
    //     el: "#canvas",
    //     template: scatters,
    //     loadData: {
    //         scatter_data: {
    //             url: "http://localhost:8080/scatter/scatter1.csv",
    //             type: "csv",
    //             loaded(data) {
    //                 // console.log("data", data);
    //                 const xLabels = [...new Set(data.map((d) => Object.values(d)[xAxisIndex]))].sort();
    //                 // console.log("xLabels", xLabels);
    //                 const scatterData = xLabels.map((l) => {
    //                     return { key: l, values: [] };
    //                 });
    //                 data.forEach((d) => {
    //                     const values = Object.values(d);
    //                     scatterData.forEach((s, sindex) => {
    //                         if (s.key === values[xAxisIndex]) {
    //                             scatterData[sindex].values.push(values[yAxisIndex]);
    //                         }
    //                     });
    //                 });
    //                 // console.log("scatterData", scatterData);
    //                 return scatterData;
    //             },
    //         },
    //     },
    // });

    // // demo polyline
    // const v = window["$v"] = visualize({
    //     el: "#canvas",
    //     template: polyline,
    //     data: {
    //     },
    // });

    // // demo venn diagram
    // const v = window["$v"] = visualize({
    //     el: "#canvas",
    //     template: demo_vennDiagram,
    //     loadData: {
    //         vennData: {
    //             url: "http://localhost:8080/venn/venn_sample_4.csv",
    //             type: "csv",
    //             loaded(data) {
    //                 const combinations = combine(data.columns.slice(1));
    //                 const vennData = combinations.map((l) => {
    //                     return { sets: l, size: 0 };
    //                 });
    //                 data.forEach((d: any) => {
    //                     vennData.forEach((v: any, index: number) => {
    //                         let found = true;
    //                         for (const k of v.sets) {
    //                             if (parseInt(d[k]) === 0) {
    //                                 found = false;
    //                                 break;
    //                             }
    //                         }
    //                         if (found) {
    //                             vennData[index].size++;
    //                         }
    //                     });
    //                 });
    //                 return vennData;
    //             },
    //         },
    //     },
    // });

});
