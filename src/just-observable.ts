/*!
 * Just Observable <https://github.com/smujmaiku/just-observable>
 * Copyright(c) 2021 Michael Szmadzinski
 * MIT Licensed
 */

type JustObservableUnubscribe = () => void;
type JustObservableSubscribeCb<T> = (value: T) => void;
type JustObservableSubscribe<T> = (cb: JustObservableSubscribeCb<T>) => JustObservableUnubscribe;
type JustObservableNext<T> = (value: T) => void;
type JustObservableToPromise<T> = (timeout?: number) => Promise<T>;

interface JustObservable<T> {
	subscribe: JustObservableSubscribe<T>;
	next: JustObservableNext<T>
	toPromise: JustObservableToPromise<T>;
	readonly hasSubscribers: boolean;
}

function justObservable<T = unknown>(): JustObservable<T> {
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

	const toPromise: JustObservableToPromise<T> = async (timeout = -1) => {
		let unsubscribe: () => void = null!;

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
		toPromise,
		get hasSubscribers() { return Object.keys(subscribers).length > 0; },
	};
}

justObservable.justObservable = justObservable;
justObservable.default = justObservable;
export = justObservable;

declare namespace justObservable {
	export {
		JustObservableUnubscribe,
		JustObservableSubscribeCb,
		JustObservableSubscribe,
		JustObservableNext,
		JustObservableToPromise,
		JustObservable,
	}
}
