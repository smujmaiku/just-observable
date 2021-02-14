import justObservable from './just-observable';

describe('just-observable', () => {
	it('should observe', () => {
		const observer = justObservable();
		const list = [];

		observer.next('too early');

		const unsubscribe = observer.subscribe(value => {
			list.push(value);
		});
		expect(observer.hasSubscribers).toBe(true);

		observer.next('some data');
		observer.next('more data');

		unsubscribe();
		expect(observer.hasSubscribers).toBe(false);

		observer.next('too late');

		expect(list).toEqual([
			'some data',
			'more data',
		]);
	});

	describe('promise', () => {
		it('should wait for next value', async () => {
			const observer = justObservable();

			setTimeout(() => { observer.next('data') }, 1);
			await observer.promise();

			const expectedError = new Error('This should have happened');
			try {
				setTimeout(() => { observer.next('data') }, 1);
				await observer.promise(5);
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
				setTimeout(() => { observer.next('data') }, 5);
				await observer.promise(1);
				throw timeoutError;
			} catch (err) {
				expect(err).not.toEqual(timeoutError);
			}

			expect(observer.hasSubscribers).toBe(false);
		});
	})

});
