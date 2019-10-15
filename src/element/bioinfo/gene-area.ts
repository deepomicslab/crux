import * as d3 from "d3-array";

import { stackedLayout } from "../../algo";
import { template } from "../../template/tag";
import { GeneData } from "../../utils/bioinfo/gene";
import { measuredTextSize } from "../../utils/text-size";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

type ScaledGeneData = GeneData & {
    _x0?: number;
    _x1?: number;
};

export interface GeneAreaOption extends ComponentOption {
    genes: ScaledGeneData[];
    rowHeight: number;
    exonHeight: number;
    intronHeight: number;
    rowGap: number;
    displayExon: boolean;
    activeGenes: string[];
    layout: "packed" | "merged";
    labelPos: "innerLeft" | "right" | "none";
    labelText: (g: GeneData) => string;
    labelSize: number;
}

export class GeneArea extends Component<GeneAreaOption> {
    public render = template`
    Component {
        x = prop.x
        y = prop.y
        width = prop.width
        height = calculatedHeight
        xScale = geneScale
        clip = @clip("bound")

        @for (genes, layer) in layers {
            @for (gene, index) in genes {
                @let geneName = prop.labelText(gene)
                Component {
                    context = gene
                    ref    = "genes[]"
                    key    = gene.trans_name_orig
                    x      = gene._x0
                    y      = layer * (prop.exonHeight + prop.rowGap) + prop.rowGap * 0.5
                    width  = Math.max(gene._x1 - gene._x0, 1)
                    height = prop.rowHeight
                    stage  = isGeneActive(gene) ? "active": null
                    on:mouseenter = (_, el) => setFocusedGene(el.prop.context.trans_name)
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
                        fill   = prop.geneColor(gene)
                        @props prop.opt.intron
                        behavior:tooltip {
                            content = geneName + "<br>" + gene.most_left_pos + "-" + gene.most_right_pos
                        }
                    }
                    @if prop.displayExon {
                        @for (exon, index) in gene.exons {
                            @let el = exon.most_left_pos
                            @let er = exon.most_left_pos + exon.length
                            Rect {
                                key      = "ex" + index
                                x        = @scaledX(el) - gene._x0
                                width    = Math.max(@scaledX(er) - @scaledX(el), 1)
                                height   = 100%
                                minWidth = 1
                                fill     = prop.geneColor(gene)
                                @props prop.opt.exon
                                behavior:tooltip {
                                    content = "Exon " + getExonIndex(gene, index) + ": " + el + "-" + er
                                }
                            }
                        }
                    }
                    Text {
                        text = geneName
                        y = 50%
                        anchor = @anchor("left", "middle")
                        fontSize = prop.labelSize
                        @props getGeneLabelProps(gene)
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
            geneColor: (gene: GeneData) => gene.color || "#66f",
            layout: "packed",
            labelPos: "innerLeft",
            labelText: (gene: GeneData) => gene.trans_name_orig,
            labelSize: 12,
        };
    }

    public state = {
        stage: null,
        focusedGene: null,
    };

    private geneScale!: any;
    // @ts-ignore
    private layers!: ScaledGeneData[][];

    public willRender() {
        const parentScale = this.getScale(true);
        this.geneScale = parentScale ? undefined : this._createScaleLinear(true, [this.geneMinPos, this.geneMaxPos]);
        const scale = parentScale || this.geneScale;
        this.prop.genes!.forEach(g => {
            g._x0 = scale(g.most_left_pos);
            g._x1 = scale(g.most_right_pos);
        });
        this.layers = this.layout();
    }

    public layout(): ScaledGeneData[][] {
        if (this.prop.layout === "packed") {
            return stackedLayout(this.prop.genes!)
                .value(x => x._x0!)
                .extent(x => [
                    x._x0!,
                    this.prop.labelPos === "right" ?
                        x._x1! + measuredTextSize(this.prop.labelText(x), this.prop.labelSize).width + 2 :
                        x._x1!,
                ])
                .run();
        } else if (this.prop.layout === "merged") {
            return [this.prop.genes!];
        }
        return [];
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
    public getExonIndex(gene: ScaledGeneData, index: number) {
        return gene.strand === "-" ? gene.exon_number - index : index + 1;
    }

    // @ts-ignore
    private getGeneLabelProps(gene: ScaledGeneData) {
        switch (this.prop.labelPos) {
            case "innerLeft":
                return {};
            case "right":
                return { x: gene._x1! - gene._x0! + 2 };
        }
    }

    // @ts-ignore
    private isGeneActive(gene) {
        return this.state.focusedGene === gene.trans_name || this.prop.activeGenes.indexOf(gene.trans_name) >= 0;
    }

    // @ts-ignore
    private setFocusedGene(gene) {
        this.setState({ focusedGene: gene });
    }

    private get calculatedHeight(): number {
        return this.layers.length * (this.prop.exonHeight + this.prop.rowGap) + this.prop.rowGap;
    }

    public getGenes(position: number): Component[] {
        return (this.$ref.genes as Component[]).filter(g =>
            g.prop.context.most_left_pos <= position &&
            g.prop.context.most_right_pos >= position);
    }

    public didLayoutSubTree() {
        this._updateGeometry("height", this.calculatedHeight);
    }
}
