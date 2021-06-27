import {
	DomTask,
	IDomCore,
	DomAction,
	DomErrorCallback,
	DomResolveCallback,
	ITaskBuilderBase,
} from "../interfaces";

export interface ITaskBuilder<T> extends ITaskBuilderBase<T> {
	/**
	 * Sets initial value that will be passed to first action
	 * @param value value passed to the action
	 */
	initWith(init: T): ITaskBuilder<T>;
	/**
	 * Adds actions to list of actions
	 * @param actions actions list
	 * @returns
	 */
	push(...actions: DomAction<T>[]): ITaskBuilder<T>;
}

export default function TaskBuilderFn<T>(
	core: IDomCore,
	task: DomTask<T>
): ITaskBuilder<T> {
	const instance: ITaskBuilder<T> = {
		initWith: (init: T) => {
			return TaskBuilderFn(core, { ...task, init });
		},
		push: (...actions: DomAction<T>[]) => {
			return TaskBuilderFn(core, {
				...task,
				actions: [...task.actions, ...actions],
			});
		},
		exec: (onResolve?: (t?: T) => void, onReject?: DomErrorCallback) => {
			task.onResolve = onResolve;
			task.onError = onReject;

			core.mutate(task);
		},
		async: () => {
			return new Promise((resolve, reject) => {
				instance.exec(resolve, reject);
			});
		},
	};

	return instance;
}
