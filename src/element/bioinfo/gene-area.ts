import d3 = require("d3-array");

import { stackedLayout } from "../../algo";
import { template } from "../../template/tag";
import { GeneData } from "../../utils/bioinfo/gene";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

export interface GeneAreaOption extends ComponentOption {
    genes: GeneData[];
}

export class GeneArea extends Component<GeneAreaOption> {
    public render = template`
    Component {
        xScale = scaleLinear([geneMinPos, geneMaxPos])

        @let layers = layout()

        @for (genes, layer) in layers {
            @for (gene, index) in genes {
                Component {
                    key          = gene.trans_name
                    x.scaled     = gene.most_left_pos
                    xEnd.scaled  = gene.most_right_pos
                    y            = layer * 24
                    height       = 20

                    @if prop.displayPromoters {
                        Rect {
                        }
                    }
                    Rect {
                        width = 100%
                        height = 100%
                        fill = "#66c"
                    }
                    Text {
                        y = 50%
                        anchor = left middle
                        text = gene.trans_name
                    }
                }
            }
        }
    }
    `;

    public layout(): GeneData[][] {
        return stackedLayout(this.prop.genes)
            .value(x => x.most_left_pos)
            .extent(x => [x.most_left_pos, x.most_right_pos])
            .run();
    }

    public get geneMinPos(): number {
        if (this.prop.genes.length === 0) return 0;
        return d3.min(this.prop.genes, g => g.most_left_pos);
    }

    public get geneMaxPos(): number {
        if (this.prop.genes.length === 0) return 0;
        return d3.max(this.prop.genes, g => g.most_right_pos);
    }

    private _processData() {

    }
}
