import TaskBuilder, { ITaskBuilder } from "./builders/base";
import FetchTaskBuilder from "./builders/fetch";
import LoopTaskBuilder from "./builders/loop";
import { DomAction, IDomCore } from "./interfaces";

export default class BpdDom {
	private _core: IDomCore;
	constructor(core: IDomCore) {
		this._core = core;
	}

	mutate<T>(...actions: DomAction<T>[]): ITaskBuilder<T> {
		return TaskBuilder(this._core, {
			actions: [...actions],
		});
	}

	fetch<T>(callback: DomAction<T>) {
		return FetchTaskBuilder(this._core, {
			fetch: callback,
		});
	}

	loop<T>(callback: DomAction<T>) {
		return LoopTaskBuilder(this._core, {
			mutationAction: callback,
		});
	}

	create() {
		return new BpdDom(this._core);
	}
}
