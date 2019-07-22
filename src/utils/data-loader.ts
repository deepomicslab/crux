import axios from "axios";
import * as d3 from "d3";
import * as _ from "lodash";
import * as Mustache from "mustache";

import { event } from "./";
import { parseNewick } from "./newick";

declare global {
    interface GonInfo {
        urls?: any;
    }
    interface Window {
        gon: GonInfo;
    }
}

export interface FileInfo {
    filename: string;
    file_key?: string;
    description?: string;
    belongs_to_sets?: string[];
    id: number;
    url: string;
    size: number;
    created_at: string;
    metadata: {[key: string]: string};
}

export type DataSourceLoader<T> = (this: DataLoader<T>, load: (options?: any) => void) => void;
export type DataSourceCallback<T, U> = (this: DataLoader<T>, data: any, def: DataSource<T, U>) => U;

export enum DataSourceType {
    CSV = "csv",
    TSV = "tsv",
    JSON = "json",
    TEXT = "text",
    NEWICK = "newick",
}

export type DSVRowType = "string" | "int" | "float" | "skip";
export type DSVRowDef = [DSVRowType, string?];

export interface DataSource<T extends {}, U> {
    _type?: U;
    url?: string | ((dl: DataLoader<T>) => string);
    fileKey?: string;
    content?: string;
    type?: DataSourceType | string;
    dataPath?: string | ((data: any) => U);
    dsvRowDef?: { [name: string]: DSVRowDef };
    dsvRowParser?: (rawRow: d3.DSVRowString | string[], index: number, columns: string[]) => any;
    dsvHasHeader?: boolean;
    loader?: DataSourceLoader<T>;
    loaded?: DataSourceCallback<T, U>;
    optional?: boolean;
    multiple?: boolean;
    dependsOn?: string[];
    includeCredentials?: boolean;
}

export interface DataLoaderOption<T> {
    sources: { [key in keyof T]: DataSource<T, T[key]> };
    calbacks?: Array<{ after: string[], do: () => void }>;
    debug?: boolean;
}

export class DataLoader<T extends { [key: string]: any } = { [key: string]: any }> {
    public data: T & { [otherData: string]: any };
    public metadata?: { [key: string]: any };
    public fileMissing = false;

    protected dataTypes: string[];
    protected dataSources: { [key in keyof T]: DataSource<T, T[key]> };
    protected selectedFiles: { [key: string]: { url: string, metadata: any } | Array<{ url: string, metadata: any }> } = {};

    private debugMode: boolean;

    constructor(options: DataLoaderOption<T>) {
        this.data = {} as T;
        this.dataSources = options.sources;
        this.dataTypes = Object.keys(this.dataSources).filter(x => x[0] !== "@");
        this.debugMode = options.debug || false;
    }

    public async load(): Promise<any> {
        const checkDependence = (dt: string, orig: string): boolean => {
            const dp = this.dataSources[dt].dependsOn;
            if (!dp) { return true; }
            let result = true;
            for (const p of dp) {
                if (p === orig) { return false; }
                result = result && checkDependence(p, orig);
            }
            return result;
        };

        event.emit(event.DATA_LOADING_STARTED);

        // load data
        if (window.gon && window.gon.urls) {
            const paths = await axios.get(window.gon.urls.chosen_file_paths);
            this.selectedFiles = paths.data;
            this.metadata = _.mapValues(this.selectedFiles, x => {
                if (x instanceof Array) {
                    return x.map(z => z.metadata);
                }
                return x.metadata;
            });
        }

        for (const dt of this.dataTypes) {
            if (!checkDependence(dt, dt)) {
                console.error("Circular data dependency detected");
                return;
            }
        }
        const loadOrder = this.dataTypes.sort((a, b) => {
            const da = this.dataSources[a];
            const db = this.dataSources[b];
            if (_.includes(da.dependsOn, b)) {
                return 1;
            } else if (_.includes(db.dependsOn, a)) {
                return -1;
            }
            return 0;
        });
        for (const key of loadOrder) {
            await this.loadDataFor(key).then((rawData) => {
                const def = this.dataSources[key];
                let data = rawData;
                if (typeof def.dataPath === "string") {
                    data = _.get(rawData, def.dataPath);
                } else if (typeof def.dataPath === "function") {
                    data = def.dataPath.call(this, rawData);
                }
                (this.data as any)[key] = data;
                if (typeof def.loaded === "function") {
                    const result = def.loaded.call(this, data, def);
                    if (typeof result !== "undefined") {
                        (this.data as any)[key] = result;
                    }
                }
                if (this.debugMode) {
                    // tslint:disable-next-line
                    console.log(key);
                }
            });
        }
        if (this.debugMode) {
            // tslint:disable-next-line
            console.log(this.data);
        }

        event.emit(event.DATA_LOADING_FINISHED);
        event.emit("bvd3.dataLoaded", this.data);
        return Promise.resolve(this.data);
    }

    public async loadDataFor(key: string): Promise<any> {
        const def = this.dataSources[key];
        const isRawData = typeof def.content === "string";

        const createPromise = (path: string | null, loader: any) => {
            return new Promise<any>((fullfill, reject) => {
                // If file key is optional
                if (path === null && !isRawData) {
                    fullfill(null);
                    return;
                }

                const dsvHasHeader = def.dsvHasHeader !== false;
                const dsvRowParser = def.type === DataSourceType.CSV || def.type === DataSourceType.TSV ?
                    def.dsvRowDef === undefined ?
                    def.dsvRowParser : (data: any) => {
                        const result: any = {};
                        _.forOwn(data, (value, key) => {
                            const rowDef = def.dsvRowDef![key] || ["string"];
                            const k = rowDef[1] || key;
                            switch (rowDef[0]) {
                                case "int": result[k] = parseInt(value); break;
                                case "float": result[k] = parseFloat(value); break;
                                case "string": result[k] = value; break;
                                default: break;
                            }
                        });
                        return result;
                    } : undefined;

                let load: Promise<any>;
                if (isRawData) {
                    load = Promise.resolve(def.content);
                } else {
                    const init: RequestInit = {};
                    if (def.includeCredentials) {
                        init.credentials = "include";
                    }
                    load = loader.call(this, path, init);
                }
                load.then((rawData) => {
                    let data: any;
                    if ((def.type === DataSourceType.CSV || def.type === DataSourceType.TSV) && (rawData as string).charAt(0) === "#") {
                        data = rawData.substr(1);
                    } else {
                        data = rawData;
                    }
                    switch (def.type) {
                        // cast to any because the definition doesn't support passing undefined as the second arg
                        case DataSourceType.CSV:
                            data = dsvHasHeader ?
                                d3.csvParse(data, dsvRowParser as any) :
                                d3.csvParseRows(data, dsvRowParser as any);
                            break;
                        case DataSourceType.TSV:
                            data = dsvHasHeader ?
                                d3.tsvParse(data, dsvRowParser as any) :
                                d3.tsvParseRows(data, dsvRowParser as any);
                            break;
                        case DataSourceType.JSON:
                            if (isRawData)
                                data = JSON.parse(data);
                            break;
                        case DataSourceType.NEWICK:
                            data = parseNewick(data);
                            break;
                    }
                    fullfill(data);
                }).catch((error) => {
                    console.error(`Error loading ${key}: ${error}`);
                    reject(error);
                });
            });
        };

        const dataType = def.type || DataSourceType.TEXT;
        const d3Loader = dataType === DataSourceType.JSON ? d3.json : d3.text;

        if (typeof def.loader === "function") {
            const tasks: Array<Promise<any>> = [];
            // Load data for a key manually, using given options.
            const origLoader = (options: any) => {
                tasks.push(createPromise(this.apiPath(key, options), d3Loader));
            };
            def.loader.call(this, origLoader);
            return Promise.all(tasks);
        } else if (def.multiple) {
            return Promise.all(this.apiPathMultiple(key).map(x => createPromise(x, d3Loader)));
        } else if (isRawData) {
            return createPromise(null, null);
        } else {
            return createPromise(this.apiPath(key), d3Loader);
        }
    }

    protected apiPathMultiple(type: string): string[] {
        return this._apiPath(type, null, true);
    }

    protected apiPath(type: string, options= null): string {
        return this._apiPath(type, options);
    }

    protected _apiPath(type: string, options: any, multiple?: false): string;
    protected _apiPath(type: string, options: any, multiple?: true): string[];
    protected _apiPath(type: string, options: any = null, multiple = false): string | string[] {
        const def = this.dataSources[type];
        if (typeof def.url === "string") {
            return Mustache.render(def.url, options ? options : this);
        } else if (typeof def.url === "function") {
            return def.url.call(this, this);
        } else if (typeof def.fileKey === "string") {
            if ((window as any).BVD_CUSTOM_DATA_PROVIDER) {
                const dataList: any[] = (window as any).BVD_CUSTOM_DATA_PROVIDER;
                return dataList.find(d => d.fileKey === def.fileKey).url;
            }
            const info = this.selectedFiles[def.fileKey];
            if (!info) {
                throw new Error("DataLoader: File key misconfigured. The visualization module required a key that is not available in this analysis.");
            }
            if (multiple) {
                if (info instanceof Array) {
                    return info.map(x => x.url);
                } else {
                    console.error(`DataLoader: multiple = true for file key "${type}", but this key doesn't accept multiple files.`);
                }
            } else {
                if (info instanceof Array) {
                    throw new Error(`DataLoader: multiple = false for file key "${type}", but this key accepts multiple files.`);
                } else {
                    return info.url;
                }
            }
        }
        throw new Error(`DataLoader: Data source is invalid for type ${type}.`);
    }
}
