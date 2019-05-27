import { Component } from "./src/element/component";
import { registerDefaultBioInfoComponents } from "./src/element/global";
import { visualize } from "./src/visualizer";

const t2 = `
svg {
    width = auto
    height = 600

    Rect {
        fill = "#f00"
        width = 100%; height = 100%;
    }
}
`;

const t3 = `
svg {
    width = auto
    height = 600

    GeneArea {
        width = 100%
        genes = prop.data
        zoom = true
    }
}`;

import { dataLoader } from "./reconstructed/data";
import { Reconstructed } from "./reconstructed/reconstructed";

import t1 from "./test/templates/t1";
import tbox from "./test/templates/tbox";

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
        template: tbox,
    });
});
