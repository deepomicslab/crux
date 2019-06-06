import { registerDefaultBioInfoComponents } from "./src/element/global";
import { visualize } from "./src/visualizer";

import { dataLoader } from "./reconstructed/data";
import { Reconstructed } from "./reconstructed/reconstructed";

import t1 from "./test/templates/t1";
import tarea from "./test/templates/tarea";
import tbox from "./test/templates/tbox";
import tcircos from "./test/templates/tcircos";
import tdemo from "./test/templates/tdemo";
import tdemo2 from "./test/templates/tdemo2";

import pie from "./demo/pie/pie";

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

    const v = window["$v"] = visualize({
        el: "#canvas",
        template: tdemo,
        data: {
            array: [1, 3, 8, 6, 5, 4, 2, 7, 3],
            array2: [6, 4, 3, 2, 4, 9, 1, 5, 8],
            array3: [3, 7, 2, 5, 6, 5, 7, 3, 4],
        },
    });
});
