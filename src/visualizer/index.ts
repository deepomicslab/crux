import loadData from "../load-data";
import { DataSource } from "../utils/data-loader";
import { Visualizer, VisualizerOption } from "./visualizer";

type VisualizeOption = VisualizerOption & {
    loadData?: Record<string, DataSource<any, any>>;
};

export function visualize(opt: VisualizeOption): Visualizer {
    const v = new Visualizer(opt);
    if (opt.loadData) {
        loadData(opt.loadData).then((d) => {
            v.data = { ...v.data, ...d };
            v.run();
        });
    } else {
        v.run();
    }
    return v;
}
