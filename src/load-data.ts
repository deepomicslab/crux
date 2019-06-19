import { DataLoader } from "./utils";
import { DataSource } from "./utils/data-loader";

export default function loadData<T = any>(sources: Record<string, DataSource<T, any>>) {
    const loader = new DataLoader({ sources });
    return loader.load();
}
