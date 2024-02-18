import { expect, test, vi } from "vitest";
import { createCache, createMemoryStore } from "./index.js";

test("Get returning value of fetcher", async () => {
	const cache = createCache(createMemoryStore());
	const result = cache.with(["test"], async (_: string) => 42);
	await expect(result.value).resolves.toBe(42);
});

test("Get value from cache", async () => {
	const cache = createCache(createMemoryStore());
	await cache.with(["test"], async (_: string) => 42).value;
	const result = cache.with(["test"], async (_: string) => 0);
	await expect(result.value).resolves.toBe(42);
});

test("Multiple caches with different keys", async () => {
	const cache = createCache(createMemoryStore());
	const result1 = cache.with(["test1"], async (_: string) => 42);
	const result2 = cache.with(["test2"], async (_: string) => 0);
	await expect(result1.value).resolves.toBe(42);
	await expect(result2.value).resolves.toBe(0);
});

test("Revalidate cache", async () => {
	const cache = createCache(createMemoryStore());
	const cached1 = cache.with(["test"], async (_: string) => new Date());
	const firstValue = await cached1.value;
	const cached2 = cache.with(["test"], async (_: string) => new Date());
	await expect(cached1.value).resolves.toBe(firstValue);
	await expect(cached2.value).resolves.toBe(firstValue);
	await cached1.revalidate();
	await expect(cached1.value).resolves.not.toBe(firstValue);
	await expect(cached2.value).resolves.not.toBe(firstValue);
});

test("Subscribe to cache", async () => {
	const cache = createCache(createMemoryStore());
	const cached = cache.with(["test"], async (_: string) => 0);
	await expect(cached.value).resolves.toBe(0);
	const spy = vi.fn();
	const unsubscribe = cached.subscribe(spy);
	await expect(cached.revalidate()).resolves.toBe(0);
});
