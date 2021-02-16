/*!
 * Just Observable <https://github.com/smujmaiku/just-observable>
 * Copyright(c) 2021 Michael Szmadzinski
 * MIT Licensed
 */

type JustObservableUnubscribe = () => void;
type JustObservableSubscribeCb<T> = (value: T) => void;
type JustObservableSubscribe<T> = (cb: JustObservableSubscribeCb<T>) => JustObservableUnubscribe;
type JustObservableNext<T> = (value: T) => void;
type JustObservablePromise<T> = (timeout?: number) => Promise<T>;

interface JustObservable<T> {
	subscribe: JustObservableSubscribe<T>;
	next: JustObservableNext<T>
	promise: JustObservablePromise<T>;
	readonly hasSubscribers: boolean;
}

export = function justObservable<T>(): JustObservable<T> {
	let count = 0;
	const subscribers: Record<string, JustObservableSubscribeCb<T>> = {};

	const subscribe: JustObservableSubscribe<T> = (cb) => {
		const id = count.toString(36);
		count += 1;
		subscribers[id] = cb;
		return () => {
			delete subscribers[id];
		};
	};

	const next: JustObservableNext<T> = (value) => {
		for (const cb of Object.values(subscribers)) {
			cb(value);
		}
	};

	const promise: JustObservablePromise<T> = async (timeout = -1) => {
		/* istanbul ignore next: imposible to enter */
		let unsubscribe = () => { return; };

		try {
			const result: T = await new Promise((resolve, reject) => {
				unsubscribe = subscribe(resolve);
				if (timeout >= 0) {
					setTimeout(() => { reject(new Error('timeout')); }, timeout);
				}
			});
			unsubscribe();
			return result;
		} catch (error) {
			unsubscribe();
			throw error;
		}
	};

	return {
		subscribe,
		next,
		promise,
		get hasSubscribers() { return Object.keys(subscribers).length > 0; },
	};
}
