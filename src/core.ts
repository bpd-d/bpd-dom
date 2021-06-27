import { DomTask, IDomCore, ITaskBuffer } from "./interfaces";

export default class BpdDomCore implements IDomCore {
	private _buffer: ITaskBuffer;

	constructor(buffer: ITaskBuffer) {
		this._buffer = buffer;
	}

	mutate<T>(task: DomTask<T>): void {
		this._buffer.push(task);
	}
}
