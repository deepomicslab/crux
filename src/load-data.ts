import { DataLoader } from "./utils";
import { DataSource } from "./utils/data-loader";

export default function loadData(sources: Record<string, DataSource<any, any>>) {
    const loader = new DataLoader({ sources });
    return loader.load();
}
