export type PromiseOr<T> = T | Promise<T>;

export type CachedResult<T> = {
	readonly value: Promise<T>;
	subscribe: (fn: (result: T) => void) => () => void;
	revalidate: () => Promise<T>;
};

export interface Cache<Compat> {
	with<Key extends unknown[], T extends Compat>(
		key: Key,
		fn: (...args: Key) => Promise<T>,
	): CachedResult<T>;
	clear(): Promise<void>;
}

export type ValueExists<T> = { exists: true; value: T } | { exists: false };
export interface CacheStore<Compat> {
	get<T extends Compat>(key: string): PromiseOr<ValueExists<T>>;
	set<T extends Compat>(key: string, value: T): PromiseOr<void>;
	clear(): PromiseOr<void>;
}
