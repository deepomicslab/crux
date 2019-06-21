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
        xScale = getScale(true) ? undefined : @scale-linear(geneMinPos, geneMaxPos)
        clip = @clip("bound")

        @let layers = layout()

        @for (genes, layer) in layers {
            @for (gene, index) in genes {
                @let gl = gene.most_left_pos
                @let gr = gene.most_right_pos
                Component {
                    key    = gene.trans_name
                    x      = @scaled(gl)
                    y      = layer * (prop.exonHeight + prop.rowGap)
                    width  = @scaled(gr) - @scaled(gl)
                    height = prop.exonHeight

                    @if prop.displayPromoters {
                        Rect {
                        }
                    }
                    Rect {
                        anchor = @anchor("left", "middle")
                        y      = 50%
                        width  = 100%
                        height = prop.intronHeight
                        fill   = "#66c"
                    }
                    @for (exon, index) in gene.exons {
                        @let el = exon.most_left_pos
                        @let er = exon.most_left_pos + exon.length
                        Rect {
                            key      = "ex" + index
                            x        = @scaled(el) - @scaled(gl)
                            width    = @scaled(er) - @scaled(el)
                            height   = 100%
                            minWidth = 1
                            fill     = "#66c"
                        }
                    }
                    Text(gene.trans_name) {
                        y = 50%
                        anchor = @anchor("left", "middle")
                    }
                }
            }
        }
    }
    `;

    public layout(): GeneData[][] {
        const data =  stackedLayout(this.prop.genes!)
            .value(x => x.most_left_pos)
            .extent(x => [x.most_left_pos, x.most_right_pos])
            .run();
        this._layerCount = data.length;
        return data;
    }

    public get geneMinPos(): number {
        if (this.prop.genes.length === 0) return 0;
        return d3.min(this.prop.genes, g => g.most_left_pos as number)!;
    }

    public get geneMaxPos(): number {
        if (this.prop.genes.length === 0) return 0;
        return d3.max(this.prop.genes, g => g.most_right_pos as number)!;
    }

    public didLayoutSubTree() {
        this._updateGeometry(
            "height",
            this._layerCount * (this.prop.exonHeight + this.prop.rowGap),
        );
    }
}
