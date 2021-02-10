# Just Observable

Do you need an observable that can be subscribed and emitted?
Are you looking for a single emitter to observe?
Would you like to wait on the next emitter event?

## Installation

`npm i just-observable`

## Usage

```js
const justObservable = require('just-observable');
const observer = justObservable();

const unsubscribe = observer.subscribe(callback);

observer.emit('some data');
observer.emit('more data');

unsubscribe();
```

### next method

Create a Promise that resolves at the next emitted value.
Sequential `next` methods may miss data if the `emit` method is called repeatedly while blocking.

```js
const justObservable = require('just-observable');
const observer = justObservable();

setTimeout(() => {
	observer.emit('data1');
	observer.emit('data2');	// will be missed by `next`
}, 5);
setTimeout(() => {
	observer.emit('data3');
}, 10);

const value1 = await observer.next();
// value1: "data1"

const value2 = await observer.next();
// value2: "data3"

await observer.next(100);	// Optional timeout in 100ms
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

observer.emit('some data');
```

## License

Copyright (c) 2020, Michael Szmadzinski. (MIT License)
