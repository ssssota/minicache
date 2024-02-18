# minicache

A simple cache library for JS/TS.
Inspired by [SWR](https://swr.vercel.app/).

## Installation

```sh
npm install minicache
```

## Usage

```ts
import { createCache, createMemoryStore } from 'minicache';
const cache = createCache(createMemoryStore());
const result = cache.with(["key"], async (_: string) => "value");
expect(await result.value).toBe("value");
```

`createMemoryStore` is a store that uses `Map` to store the cache.
If you want to use with localStorage/sessionStorage, you can use `createStorageStore`.

```ts
import { createCache, createStorageStore } from 'minicache';
const cache = createCache(createStorageStore(window.localStorage));
const result = cache.with(["key"], async (_: string) => "value");
expect(await result.value).toBe("value");
```

## API

### `createCache(store: Store): Cache`

Create a new cache instance.

#### `cache.with(key, fetcher): CachedResult`

Fetch the data from the cache or fetcher.

##### `cachedResult.value: Promise<T>`

The fetched/cached value.

##### `cachedResult.subscribe(callback: (value: T) => void)`

Subscribe to the value change.
It returns a function to unsubscribe.

##### `cachedResult.revalidate(): Promise<T>`

Revalidate the value with the provided fetcher.

#### `cache.clear()`

Clear the cache.

## License

MIT
