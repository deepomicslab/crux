import { Component } from "./src/element/component";
import { registerDefaultBioInfoComponents } from "./src/element/global";
import { visualize } from "./src/visualizer";

const t1 = `
svg {
    width = auto
    height = 600

    @let array = [1, 2, 3, 4]

    Rows {
        Rows {
            @for (data, index) in array {
                Container {
                    key = index;
                    padding-b = 10;
                    Rect {
                        width = 300; height = data * 20;
                        fill = "#aaa"
                        fill-opacity = 0.5
                    }
                }
            }
        }
        Container {
            Rect {
                width = 300; height = 200;
                fill = "#aaa";
            }
        }
    }
}
`;

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
import { template as tt } from "./reconstructed/template";
import { Reconstructed } from "./reconstructed/reconstructed";

registerDefaultBioInfoComponents();

document.addEventListener("DOMContentLoaded", () => {
    const data = [];

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

    // fetch(url).then(x => x.json()).then(x => {
    //     const d: any[] = window["$dd"] = x.data.map(toGeneData);
    //     (v.root as any).prop.data = d;
    //     v.run();
    // });
});
