import { pipeline, Readable, Writable, Transform } from 'stream';
import { promisify } from 'util';
import { createWriteStream } from 'fs';

const pipeASync = promisify(pipeline);

{
	const readableStream = Readable({
		read: function () {
			this.push('hello due 1');
			this.push('hello due 2');
			this.push('hello due 3');
			this.push(null);
		},
	});

	const writeStream = Writable({
		write(chunk, encoding, callback) {
			console.log('msg', chunk);
			callback();
		},
	});

	await pipeASync(
		readableStream,
		// process.stdout
		writeStream
	);
	console.log('Acabou 01');
}
{
	const readableStream = Readable({
		read() {
			for (let i = 0; i < 1e5; i++) {
				const person = { id: Date.now() + i, name: `Iuri-${i}` };

				const data = JSON.stringify(person);

				this.push(data);
			}

			this.push(null);
		},
	});

	const writableMapToCSV = Transform({
		transform(chunk, encoding, callback) {
			const data = JSON.parse(chunk);

			const result = `${data.id}, ${data.name.toUpperCase()}\n`;

			callback(null, result);
		},
	});

	const setHeader = Transform({
		transform(chunk, encoding, callback) {
			this.counter = this.counter ?? 0;

			if (this.counter) {
				return callback(null, chunk);
			}

			this.counter += 1;
			callback(null, 'id, name\n'.concat(chunk));
		},
	});

	await pipeASync(
		readableStream,
		writableMapToCSV,
		setHeader,
		createWriteStream('my.csv')
	);
}
