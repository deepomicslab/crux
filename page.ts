import { visualize } from "./src/visualizer";
import { template } from "./src/template/tag";
import { Component } from "./src/element/component";
import { updateTree } from "./src/rendering/render-tree";
import { toGeneData } from "./src/utils/bioinfo/gene";
import { registerDefaultBioInfoComponents } from "./src/element/global";

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

const url = `http://localhost:3034/v1/tabix/ensembl_Tpsl/?name=v75&seg=chr2&from=215770895&to=216095895&GenomeReference=hg19`;

registerDefaultBioInfoComponents();

document.addEventListener("DOMContentLoaded", () => {
    let data: any[] = [];

    const v = window["$v"] = visualize({
        el: "#canvas",
        template: t3,
        props: {
            data,
        },
    });

    fetch(url).then(x => x.json()).then(x => {
        const d: any[] = window["$dd"] = x.data.map(toGeneData);
        (v.root as any).prop.data = d;
        v.run();
    });
});
