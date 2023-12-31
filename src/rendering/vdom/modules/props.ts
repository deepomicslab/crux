import {VNode, VNodeData} from "../vnode";
import {Module} from "./module";

export type Props = Record<string, any>;

function updateProps(oldVnode: VNode, vnode: VNode): void {
  const elm = vnode.elm;
  let key: string, cur: any, old: any,
      oldProps = (oldVnode.data as VNodeData).props,
      props = (vnode.data as VNodeData).props;

  if (!oldProps && !props) return;
  if (oldProps === props) return;
  oldProps = oldProps || {};
  props = props || {};

  for (key in oldProps) {
    if (!props[key]) {
      delete (elm as any)[key];
    }
  }

  // tslint:disable-next-line:forin
  for (key in props) {
    cur = props[key];
    old = oldProps[key];
    if (old !== cur && (key !== "value" || (elm as any)[key] !== cur)) {
      (elm as any)[key] = cur;
    }
  }
}

export const propsModule = {create: updateProps, update: updateProps} as Module;
export default propsModule;
