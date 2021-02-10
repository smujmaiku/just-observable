/*!
 * Just Observable <https://github.com/smujmaiku/just-observable>
 * Copyright(c) 2020 Michael Szmadzinski
 * MIT Licensed
 */

type JustObservableUnubscribe = () => void;
type JustObservableSubscribeCb<T> = (value: T) => void;
type JustObservableSubscribe<T> = (cb: JustObservableSubscribeCb<T>) => JustObservableUnubscribe;
type JustObservableEmit<T> = (value: T) => void;
type JustObservableNext<T> = (timeout?: number) => Promise<T>;

interface JustObservable<T> {
	subscribe: JustObservableSubscribe<T>;
	emit: JustObservableEmit<T>
	next: JustObservableNext<T>;
	readonly hasSubscribers: boolean;
}

module.exports = function justObservable<T>(): JustObservable<T> {
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

	const emit: JustObservableEmit<T> = (value) => {
		for (const cb of Object.values(subscribers)) {
			cb(value);
		}
	};

	const next: JustObservableNext<T> = async (timeout = -1) => {
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
		emit,
		next,
		get hasSubscribers() { return Object.keys(subscribers).length > 0; },
	};
}
