export interface GeneRawData {
    gene_name: string;
    start_codon: string;
    end_codon: string;
    ENSPID: string;
    ENSTID: string;
    strand: "+" | "-";
    trans_name: string;
    trans_name_orig: string;
    biotype: string;
    refseg: string;
    cytoband: string;
    most_left_pos: number;
    most_right_pos: number;
    exon_number: number;
    exon_length: string;
    exon_most_left_pos: string;
    CDS_region: string;
}

export interface GeneData {
    gene_name: string;
    start_codon: string;
    end_codon: string;
    ENSPID: string;
    ENSTID: string;
    strand: "+" | "-";
    trans_name: string;
    trans_name_orig: string;
    biotype: string;
    refseg: string;
    cytoband: string;
    most_left_pos: number;
    most_right_pos: number;
    exon_number: number;
    exons: { most_left_pos: number, length: number }[];
    CDS_region: string;
    cdsRegions: { start: number, end: number, length: number}[];
    color?: string;
}

function toNumArray(str: string): number[] {
    return str.split(",").filter(s => s).map(s => parseInt(s));
}

export function toGeneData(rawData: GeneRawData): GeneData {
    const exons = [];
    const lenArray = toNumArray(rawData.exon_length);
    const leftArray = toNumArray(rawData.exon_most_left_pos);
    for (let i = 0; i < rawData.exon_number; i++) {
        exons[i] = {
            most_left_pos: leftArray[i] + 1,
            length: lenArray[i],
        };
    }
    const cdsRegions = rawData.CDS_region.split(",").slice(0, -1)
        .filter(s => s)
        .map(s => {
            const [start_, length] = s.slice(0, -1).split("(").map(x => parseInt(x));
            const start = start_ + 1;
            const end = start_ + length;
            return { start, end, length };
        });
    return {
        ...rawData,
        most_left_pos: rawData.most_left_pos + 1,
        exons,
        cdsRegions,
    };
}
