import { Anchor } from "../defs/geometry";

export function posWithAnchor(
    horizontal: boolean, orig: number, size: number, anchor: Anchor): number {
    if (horizontal) {
        if (anchor & Anchor.Left) {
            return orig;
        } else if (anchor & Anchor.Center) {
            return orig - size / 2;
        } else if (anchor & Anchor.Right) {
            return orig - size;
        }
    } else {
        if (anchor & Anchor.Top) {
            return orig;
        } else if (anchor & Anchor.Middle) {
            return orig - size / 2;
        } else if (anchor & Anchor.Bottom) {
            return orig - size;
        }
    }
    return 0;
}
