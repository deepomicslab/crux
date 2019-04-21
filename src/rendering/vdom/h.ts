import {vnode, VNode, VNodeData} from "./vnode";
export type VNodes = Array<VNode>;
export type VNodeChildElement = VNode | string | number | undefined | null;
export type ArrayOrElement<T> = T | T[];
export type VNodeChildren = ArrayOrElement<VNodeChildElement>;
import * as is from "./is";

function addNS(data: any, children: VNodes | undefined, sel: string | undefined): void {
  data.ns = "http://www.w3.org/2000/svg";
  if (sel !== "foreignObject" && children !== undefined) {
    for (const child of children) {
      const childData = child.data;
      if (childData !== undefined) {
        addNS(childData, (child as VNode).children as VNodes, child.sel);
      }
    }
  }
}

export function h(sel: string, dataOrChildren?: VNodeData | VNodeChildren): VNode;
export function h(sel: string, data: VNodeData, children: VNodeChildren): VNode;
export function h(sel: any, b?: any, c?: any): VNode {
  let data: VNodeData = {}, children: any, text: any, i: number;
  if (c !== undefined) {
    data = b;
    if (is.array(c)) { children = c; } else if (is.primitive(c)) { text = c; } else if (c && c.sel) { children = [c]; }
  } else if (b !== undefined) {
    if (is.array(b)) { children = b; } else if (is.primitive(b)) { text = b; } else if (b && b.sel) { children = [b]; } else { data = b; }
  }
  if (children !== undefined) {
    for (i = 0; i < children.length; ++i) {
      if (is.primitive(children[i])) children[i] = vnode(undefined, undefined, undefined, children[i], undefined);
    }
  }
  if (
    sel[0] === "s" && sel[1] === "v" && sel[2] === "g" &&
    (sel.length === 3 || sel[3] === "." || sel[3] === "#")
  ) {
    addNS(data, children, sel);
  }
  return vnode(sel, data, children, text, undefined);
}
export default h;
