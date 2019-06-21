import {CreateHook, DestroyHook, PostHook, PreHook, RemoveHook, UpdateHook} from "../hooks";

export interface Module {
  pre: PreHook;
  create: CreateHook;
  update: UpdateHook;
  destroy: DestroyHook;
  remove: RemoveHook;
  post: PostHook;
}
