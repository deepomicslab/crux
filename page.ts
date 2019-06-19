import { registerDefaultBioInfoComponents } from "./src/element/global";
import { visualize } from "./src/visualizer";

import { dataLoader } from "./reconstructed/data";
import { Reconstructed } from "./reconstructed/reconstructed";

import { simpleLinearRegression } from "./src/algo";

import t1 from "./test/templates/t1";
import tarea from "./test/templates/tarea";
import tbox from "./test/templates/tbox";
import tcircos from "./test/templates/tcircos";
import tdemo from "./test/templates/tdemo";
import tdemo2 from "./test/templates/tdemo2";

import bar from "./demo/bar/bar";
import box from "./demo/box/box";
import scatters from "./demo/box/demo_scatters";
import demo from "./demo/demo";
import regression from "./demo/line/demo_linear_regression";
import polyline from "./demo/line/demo_polyline";
import pie from "./demo/pie/pie";
import radar from "./demo/radar/demo_radar-chart";
import scatterData from "./demo/scatter-data";
import loadData from "./src/load-data";
import { DataSourceType } from "./src/utils/data-loader";
import { Clock } from "./test/templates/clock";

registerDefaultBioInfoComponents();

document.addEventListener("DOMContentLoaded", () => {
    const data = [];

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
    const regressionData = simpleLinearRegression(scatterData);
    const v = window["$v"] = visualize({
        el: "#canvas",
        template: demo,
        loadData: { data4: { content: "1" }},
        data: {
            array: [1, 3, 8, 6, 5, 4, 2, 7, 3],
            array2: [6, 4, 3, 2, 4, 9, 1, 5, 8],
            array3: [3, 7, 2, 5, 6, 5, 7, 3, 4],
            scatter_data: scatterData,
            regression_data: regressionData,
        },
        components: { Clock },
    });
});
