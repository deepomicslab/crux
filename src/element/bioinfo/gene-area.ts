import d3 = require("d3-array");

import { stackedLayout } from "../../algo";
import { template } from "../../template/tag";
import { GeneData } from "../../utils/bioinfo/gene";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

export interface GeneAreaOption extends ComponentOption {
    genes: GeneData[];
    exonHeight: number;
    intronHeight: number;
    rowGap: number;
}

export class GeneArea extends Component<GeneAreaOption> {
    private _layerCount = 0;

    public defaultProp() {
        return {
            ...super.defaultProp(),
            exonHeight: 20,
            intronHeight: 4,
            rowGap: 4,
        };
    }

    public render = template`
    Component {
        x = prop.x
        y = prop.y
        width = prop.width
        height = prop.height
        xScale = @scale-linear(geneMinPos, geneMaxPos)

        @let layers = layout()

        @for (genes, layer) in layers {
            @for (gene, index) in genes {
                Component {
                    key          = gene.trans_name
                    x.scaled     = gene.most_left_pos
                    xEnd.scaled  = gene.most_right_pos
                    y            = layer * (prop.exonHeight + prop.rowGap)
                    height       = prop.exonHeight

                    @if prop.displayPromoters {
                        Rect {
                        }
                    }
                    Rect {
                        anchor = @anchor(left, middle)
                        y      = 50%
                        width  = 100%
                        height = prop.intronHeight
                        fill   = "#66c"
                    }
                    @for (exon, index) in gene.exons {
                        Rect {
                            key          = "ex" + index
                            height       = 100%
                            x.scaled     = exon.most_left_pos
                            xEnd.scaled  = exon.most_left_pos + exon.length
                            minWidth     = 1
                            fill   = "#66c"
                        }
                    }
                    Text(gene.trans_name) {
                        y = 50%
                        anchor = @anchor(left, middle)
                    }
                }
            }
        }
    }
    `;

    public layout(): GeneData[][] {
        const data =  stackedLayout(this.prop.genes)
            .value(x => x.most_left_pos)
            .extent(x => [x.most_left_pos, x.most_right_pos])
            .run();
        this._layerCount = data.length;
        return data;
    }

    public get geneMinPos(): number {
        if (this.prop.genes.length === 0) return 0;
        return d3.min(this.prop.genes, g => g.most_left_pos);
    }

    public get geneMaxPos(): number {
        if (this.prop.genes.length === 0) return 0;
        return d3.max(this.prop.genes, g => g.most_right_pos);
    }

    public didLayoutSubTree() {
        this.$geometry.height = this._layerCount * (this.prop.exonHeight + this.prop.rowGap);
    }
}
