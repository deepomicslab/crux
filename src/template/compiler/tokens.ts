export const BLOCK_NAME = `(svg|canvas|[A-Z][A-z\\d_\\-]+)(?:\\((.+?)\\))?`;
export const NAME = `[a-z][A-z0-9_\\-\\.:]*`;
export const FOR_EXPR = `[a-z][A-z\\.\\[\\]\\d]*`;
export const HELPER = /@([a-z\-]+)\((.+?)\)/g;
