import { Visualizer, VisualizerOption } from "./visualizer";

export function visualize(opt: VisualizerOption): Visualizer {
    const v = new Visualizer(opt);
    v.run();
    return v;
}
