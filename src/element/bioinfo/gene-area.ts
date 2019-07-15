import * as d3 from "d3-array";

import { stackedLayout } from "../../algo";
import { template } from "../../template/tag";
import { GeneData } from "../../utils/bioinfo/gene";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

export interface GeneAreaOption extends ComponentOption {
    genes: GeneData[];
    rowHeight: number;
    exonHeight: number;
    intronHeight: number;
    rowGap: number;
    displayExon: boolean;
    activeGenes: string[];
}

export class GeneArea extends Component<GeneAreaOption> {
    private _layerCount = 0;

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
                    context = gene
                    ref    = "genes[]"
                    key    = gene.trans_name
                    x      = @scaled-x(gl)
                    y      = layer * (prop.exonHeight + prop.rowGap) + prop.rowGap * 0.5
                    width  = @scaled-x(gr) - @scaled-x(gl)
                    height = prop.rowHeight
                    stage  = isGeneActive(gene) ? "active": null
                    on:mouseenter = setFocusedGene($el.prop.context.trans_name)
                    on:mouseleave = setFocusedGene(null)
                    @props prop.opt.gene

                    @if prop.displayPromoters {
                        Rect {
                        }
                    }
                    Rect {
                        width  = 100%
                        height = 100%
                        fill   = "none"
                        @props prop.opt.bg
                    }
                    Rect {
                        anchor = @anchor("left", "middle")
                        y      = 50%
                        width  = 100%
                        height = prop.intronHeight
                        fill   = "#66c"
                        @props prop.opt.intron
                    }
                    @if prop.displayExon {
                        @for (exon, index) in gene.exons {
                            @let el = exon.most_left_pos
                            @let er = exon.most_left_pos + exon.length
                            Rect {
                                key      = "ex" + index
                                x        = @scaled-x(el) - @scaled-x(gl)
                                width    = @scaled-x(er) - @scaled-x(el)
                                height   = 100%
                                minWidth = 1
                                fill     = "#66c"
                                @props prop.opt.exon
                            }
                        }
                    }
                    Text(gene.trans_name) {
                        y = 50%
                        anchor = @anchor("left", "middle")
                        @props prop.opt.label
                    }
                }
            }
        }
    }
    `;

    public defaultProp() {
        return {
            ...super.defaultProp(),
            rowHeight: 20,
            exonHeight: 20,
            intronHeight: 4,
            rowGap: 4,
            activeGenes: [],
        };
    }

    public state = {
        stage: null,
        focusedGene: null,
    };

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

    // @ts-ignore
    private isGeneActive(gene) {
        return this.state.focusedGene === gene.trans_name || this.prop.activeGenes.indexOf(gene.trans_name) >= 0;
    }

    // @ts-ignore
    private setFocusedGene(gene) {
        this.setState({ focusedGene: gene });
    }

    public getGenes(position: number): Component[] {
        return (this.$ref.genes as Component[]).filter(g =>
            g.prop.context.most_left_pos <= position &&
            g.prop.context.most_right_pos >= position);
    }

    public didLayoutSubTree() {
        this._updateGeometry(
            "height",
            this._layerCount * (this.prop.exonHeight + this.prop.rowGap) + this.prop.rowGap,
        );
    }
}
