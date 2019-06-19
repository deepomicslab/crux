import { GeneData, toGeneData } from "../src/utils/bioinfo/gene";
import { DataLoader, DataSourceType } from "../src/utils/data-loader";

const variantAPIRoot = "http://localhost:3038";

export const dataLoader = new DataLoader({
    sources: {
        virus: {
            url: `${variantAPIRoot}/virus.json`,
            type: DataSourceType.JSON,
        },
        depth: {
            url: `${variantAPIRoot}/depth.json`,
            type: DataSourceType.JSON,
            loaded(d) {
                const depth = d.depth;
                this.data.depthMax = Math.max(...depth);
                // visualizer.data.depthScaleY.domain([0, this.data.depthMax]);
                // visualizer.data.depthScaleThumbY.domain([0, this.data.depthMax]);
                return depth;
            },
        },
        gene: {
            url: `${variantAPIRoot}/virus_hpv.json`,
            type: DataSourceType.JSON,
            dataPath: "data",
            loaded(d) {
                const genes = d.filter(x => x.trans_name.endsWith("001")).map(toGeneData);
                genes.forEach((gene: GeneData) => {
                    gene.trans_name = gene.trans_name.substr(6);
                });
                return genes;
            },
        },
        mutation: {
            dependsOn: ["virus", "ref"],
            url: `${variantAPIRoot}/mutations.json`,
            type: DataSourceType.JSON,
            dataPath: "mutations",
            loaded(d: any[]) {
                // visualizer.data.scaleX.domain([1, this.data.virus.orig_len]);
                return d.map((mut, index) => {
                    mut.origAllele = this.data.ref[index];
                    mut.genes = [];
                    mut._enabled = true;
                    return mut;
                });
            },
        },
        ref: {
            url: `${variantAPIRoot}/vseq.json`,
            type: DataSourceType.JSON,
            dataPath: "data.seq",
        },
        integrations: {
            url: `${variantAPIRoot}/sv_cases.json`,
            type: DataSourceType.JSON,
        },
    },
});
