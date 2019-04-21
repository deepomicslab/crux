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
    exon_length: number[];
    exon_most_left_pos: number[];
    CDS_region: string;
}

function toNumArray(str: string): number[] {
    return str.split(",").filter(s => s).map(s => parseInt(s));
}

export function toGeneData(rawData: GeneRawData): GeneData {
    return {
        ...rawData,
        exon_length: toNumArray(rawData.exon_length),
        exon_most_left_pos: toNumArray(rawData.exon_most_left_pos),
    };
}
