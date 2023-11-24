# Just Observable

Do you need an observable that can be subscribed and emitted?
Are you looking for a single emitter to observe like rxjs subject?
Would you like a promise to wait on the next event?

## Installation

`npm i just-observable`

## Usage

```js
const justObservable = require('just-observable');
const observer = justObservable();

const unsubscribe = observer.subscribe(callback);

observer.next('some data');
observer.next('more data');

unsubscribe();
```

### toPromise method

Create a Promise that resolves at the next emitted value.
Sequential `toPromise` methods may miss data if the `next` method is called repeatedly while blocking.

```js
const justObservable = require('just-observable');
const observer = justObservable();

setTimeout(() => {
	observer.next('data1');
	observer.next('data2');	// will be missed by `toPromise`
}, 5);
setTimeout(() => {
	observer.next('data3');
}, 10);

const value1 = await observer.toPromise();
// value1: "data1"

const value2 = await observer.toPromise();
// value2: "data3"

await observer.toPromise(100);	// Optional timeout in 100ms
// Error: timeout
```

## Examples

### Create queue

```js
const justObservable = require('just-observable');
const observer = justObservable();

const unsubscribe = observer.subscribe((report) => queue.push(report));

(async () => {
	const queue = [];
	while (true) {
		if (queue.length === 0) {
			await observer.next();
		}

		while(queue.length > 0) {
			const row = queue.shift();
			console.log(row);
		}
	}
})();

observer.next('some data');
```

## License

Copyright (c) 2021, Michael Szmadzinski. (MIT License)
