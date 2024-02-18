import type { DevalueValue } from "./devalue.js";
import { parse, stringify } from "./devalue.js";
import type { Cache, CacheStore, PromiseOr, ValueExists } from "./types.js";

/**
 * create a cache control object
 * @param store store to use for caching backend
 * @returns cache control object
 * @import.meta.vitest
 * ```js
 * const cache = createCache(createMemoryStore());
 * const { value } = cache.with(["key"], async () => "value");
 * expect(await value).toBe("value");
 * ```
 */
export const createCache = <Compat, Store extends CacheStore<Compat>>(
	store: Store,
): Cache<Compat> => {
	// biome-ignore lint/suspicious/noExplicitAny:
	const subscribers = new Map<string, Set<(result: any) => void>>();
	return {
		with<Key extends unknown[], T extends Compat>(
			key: Key,
			fn: (...args: Key) => Promise<T>,
		): {
			value: Promise<T>;
			subscribe: (fn: (result: T) => void) => () => void;
			revalidate: () => Promise<T>;
		} {
			let current: T;
			const stringKey = stringify(key);
			const subscribe = (onChange: (result: T) => void) => {
				let set = subscribers.get(stringKey);
				if (!set) {
					set = new Set();
					subscribers.set(stringKey, set);
				}
				set.add(onChange);
				return () => {
					let set = subscribers.get(stringKey);
					if (!set) {
						set = new Set();
						subscribers.set(stringKey, set);
					}
					set.delete(onChange);
					if (set.size === 0) subscribers.delete(stringKey);
				};
			};
			const revalidate = async () => {
				const result = await fn(...key);
				const subscribersSet = subscribers.get(stringKey);
				if (subscribersSet && current !== result) {
					current = result;
					for (const subscriber of subscribersSet) subscriber(result);
				}
				await store.set(stringKey, result);
				return result;
			};
			return {
				get value() {
					return Promise.resolve(store.get<T>(stringKey)).then((cached) => {
						if (cached.exists) return cached.value;
						return revalidate();
					});
				},
				subscribe,
				revalidate,
			};
		},
		async clear() {
			await store.clear();
		},
	};
};

export const createStorageStore = (
	storage: Storage,
): CacheStore<DevalueValue> => {
	return {
		get<T extends DevalueValue>(key: string): PromiseOr<ValueExists<T>> {
			const value = storage.getItem(key);
			if (value) return { exists: true, value: parse(value) };
			return { exists: false };
		},
		set<T extends DevalueValue>(key: string, value: T) {
			storage.setItem(key, stringify(value));
		},
		clear() {
			storage.clear();
		},
	};
};

// biome-ignore lint/suspicious/noExplicitAny:
export const createMemoryStore = (): CacheStore<any> => {
	// biome-ignore lint/suspicious/noExplicitAny:
	const store = new Map<string, any>();
	return {
		get<T>(key: string): PromiseOr<ValueExists<T>> {
			const value = store.get(key);
			if (value !== undefined) return { exists: true, value: value as T };
			return { exists: false };
		},
		set<T>(key: string, value: T) {
			store.set(key, value);
		},
		clear() {
			store.clear();
		},
	};
};

export type * from "./types.js";
