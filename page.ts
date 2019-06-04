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
    });
});
