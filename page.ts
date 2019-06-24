import { registerDefaultBioInfoComponents } from "./src/element/global";
import { visualize } from "./src/visualizer";

// @ts-ignore
import { dataLoader } from "./reconstructed/data";
// @ts-ignore
import { Reconstructed } from "./reconstructed/reconstructed";

import { simpleLinearRegression } from "./src/algo";

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
import demo from "./demo/demo";
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
import loadData from "./src/load-data";
// @ts-ignore
import { DataSourceType } from "./src/utils/data-loader";
import { Visualizer } from "./src/visualizer/visualizer";
import { Clock } from "./test/templates/clock";

declare global {
    interface Window {
        $v: Visualizer;
    }
}

registerDefaultBioInfoComponents();

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
    const regressionData = simpleLinearRegression(scatterData);
    window.$v = visualize({
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
