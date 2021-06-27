import { DomTask, ITaskExecutor } from "./interfaces";

const raf = requestAnimationFrame;

export default class DomActionsExecutor implements ITaskExecutor {
	constructor() {}

	execute<T>(task: DomTask<T>, whenDone: () => void): void {
		if (!task || !task.actions || task.actions.length === 0) {
			if (task.onResolve) task.onResolve(undefined);
			whenDone();
			return;
		}
		raf((timestamp) => {
			let result = undefined;
			try {
				result = task.actions.reduce((result, current) => {
					return current(timestamp, result);
				}, task.init);
			} catch (e) {
				if (task.onError) task.onError(e);
				whenDone();
				return;
			}
			whenDone();
			if (task.onResolve) task.onResolve(result);
		});
	}
}
