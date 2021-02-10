import justObservable from './just-observable';

describe('just-observable', () => {
	it('should observe', () => {
		const observer = justObservable();
		const list = [];

		observer.emit('too early');

		const unsubscribe = observer.subscribe(value => {
			list.push(value);
		});
		expect(observer.hasSubscribers).toBe(true);

		observer.emit('some data');
		observer.emit('more data');

		unsubscribe();
		expect(observer.hasSubscribers).toBe(false);

		observer.emit('too late');

		expect(list).toEqual([
			'some data',
			'more data',
		]);
	});

	describe('next', () => {
		it('should wait for next value', async () => {
			const observer = justObservable();

			setTimeout(() => { observer.emit('data') }, 1);
			await observer.next();

			const expectedError = new Error('This should have happened');
			try {
				setTimeout(() => { observer.emit('data') }, 1);
				await observer.next(5);
				throw expectedError;
			} catch (err) {
				expect(err).toEqual(expectedError);
			}

			expect(observer.hasSubscribers).toBe(false);
		});

		it('should timeout', async () => {
			const observer = justObservable();

			const timeoutError = new Error('This should have timed out');
			try {
				setTimeout(() => { observer.emit('data') }, 5);
				await observer.next(1);
				throw timeoutError;
			} catch (err) {
				expect(err).not.toEqual(timeoutError);
			}

			expect(observer.hasSubscribers).toBe(false);
		});
	})

});
