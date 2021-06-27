import { CuiDomFetchTaskError } from "../errors";
import {
	DomTask,
	IDomCore,
	DomAction,
	DomResolveCallback,
	DomErrorCallback,
	ITaskBuilderBase,
} from "../interfaces";

interface TaskBuilderConfig<T> {
	actions?: DomAction<T>[];
	fetch?: DomAction<T>;
	init?: T;
}

export interface IFetchTaskBuilder<T> extends ITaskBuilderBase<T>{
	/**
	 * Sets initial value that will be passed to first action
	 * @param value value passed to the action
	 */
	initWith(init: T): IFetchTaskBuilder<T>;
	/**
	 * Adds actions to list of mutation actions
	 * @param actions actions list
	 * @returns
	 */
	thenMutate(...actions: DomAction<T>[]): IFetchTaskBuilder<T>;
}

function validateConfig<T>(config: TaskBuilderConfig<T>) {
	if (!config) {
		throw new CuiDomFetchTaskError("Task is not configured");
	}

	if (!config.fetch) {
		throw new CuiDomFetchTaskError("Fetch callback is not set");
	}

	if (!config.actions) {
		throw new CuiDomFetchTaskError("Mutation actions are not set");
	}
}

export default function FetchTaskBuilder<T>(
	core: IDomCore,
	config: TaskBuilderConfig<T>
): IFetchTaskBuilder<T> {
	const instance: IFetchTaskBuilder<T> = {
		initWith: (init: T) => {
			return FetchTaskBuilder(core, {
				...config,
				init,
			});
		},
		thenMutate: (...actions: DomAction<T>[]) => {
			return FetchTaskBuilder(core, {
				...config,
				actions: [...actions],
			});
		},
		exec: (
			onResolve?: DomResolveCallback<T>,
			onReject?: DomErrorCallback
		) => {
			try {
				validateConfig(config);

				const fetchTask: DomTask<T> = {
					init: config.init,
					onError: onReject,
					actions: [
						// @ts-ignore it is checked
						config.fetch,
						(ti: number, prev?: T) => {
							core.mutate({
								init: prev,
								onError: onReject,
								onResolve,
								// @ts-ignore it is checked
								actions: [...config.actions],
							});
							return undefined;
						},
					],
				};

				core.mutate(fetchTask);
			} catch (err) {
				if (onReject) {
					onReject(err);
				}
			}
		},

		async: () => {
			return new Promise((resolve, reject) => {
				instance.exec(resolve, reject);
			});
		},
	};

	return instance;
}
