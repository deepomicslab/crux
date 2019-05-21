import { Component } from "./src/element/component";
import { registerDefaultBioInfoComponents } from "./src/element/global";
import { visualize } from "./src/visualizer";

const t1 = `
svg {
    width = auto
    height = 1200

    @let array = [1, 3, 8, 6, 5, 4, 2, 7, 3]
    @let array2 = [6, 4, 3, 2, 4, 9, 1, 5, 8]

    Rows {
        XYPlot {
            height = 300
            width = 500
            padding-y = 20
            padding-x = 20
            data = { array, array2 }
            Rect { fill = "#efefef" }
            AxisBackground {}
            Bars {
                data = "array2"
            }
            Bars {
                data = "array"
                barFill = "red"
            }
            Labels {
                data = "array2"
                labelGetter = d => "Value:" + d.value
            }
            Axis {
                orientation = "bottom"
                y = 100%
            }
            Axis {
                x = 100%
                orientation = "right"
            }
        }
        XYPlot {
            height = 300
            width = 500
            padding-y = 20
            padding-x = 20
            data = array
            invertValueAxis = true
            Rect { fill = "#efefef" }
            Bars {
            }
            Labels {
                labelGetter = d => "Value:" + d.value
            }
            Axis {
                orientation = "top"
            }
            Axis {
                x = 100%
                orientation = "right"
            }
        }
        XYPlot {
            height = 300
            width = 500
            padding-y = 20
            padding-x = 20
            data = array
            flip = true
            invertValueAxis = true
            Rect { fill = "#efefef" }
            Bars {
            }
            Labels {
                labelGetter = d => "Value:" + d.value
            }
            Axis {
                orientation = "top"
            }
            Axis {
                orientation = "left"
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
        template: t1,
    });
});
