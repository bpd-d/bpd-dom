import { CuiDomBufferError } from "./errors";
import {
	ITaskBuffer,
	DomTask,
	ITaskExecutor,
	TaskBufferOptions,
} from "./interfaces";

export default class DomTaskBufferCls implements ITaskBuffer {
	private _buffer: DomTask<any>[];
	private _lock: boolean;
	private _executor: ITaskExecutor;
	private _options: TaskBufferOptions;

	constructor(executor: ITaskExecutor, options?: TaskBufferOptions) {
		if (!executor)
			throw new CuiDomBufferError(
				"You initialize buffer without an executor!"
			);
		this._buffer = [];
		this._executor = executor;
		this._options = options ?? {};
		this._lock = false;
	}

	push<T>(task: DomTask<T>): void {
		if (this._options.onBeforePush) {
			this._options.onBeforePush(task);
		}
		if (!task) return;
		this._buffer.push(task);
		if (this._lock) return;
		this.flush();
	}

	private flush() {
		if (this._options.onBeforeFlush)
			this._options.onBeforeFlush(this._buffer);
		let task = null;
		const _bufferLength = this._buffer.length;
		const _copy = this._buffer.splice(0, _bufferLength);
		let _currentIteration = 0;
		while ((task = _copy.shift())) {
			this._lock = true;

			if (this._options.onLock) this._options.onLock();

			this._executor.execute(task, () => {
				_currentIteration++;

				// Check if already finished all items
				if (_currentIteration >= _bufferLength) {
					this._lock = false;
					if (this._options.onUnlock) this._options.onUnlock();
				}

				// Check whether there is something in buffer
				if (this._buffer.length > 0) {
					this.flush();
				}
			});
		}
	}
}
