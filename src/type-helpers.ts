export type ReadonlyIfObject<T> = T extends object ? Readonly<T> : T;
