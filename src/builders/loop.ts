import { CuiDomLoopTaskError } from "../errors";
import {
	DomAction,
	DomErrorCallback,
	DomResolveCallback,
	IDomCore,
	ITaskBuilderBase,
} from "../interfaces";

export interface LoopTaskCondition<T> {
	(timestamp: number, t?: T): boolean;
}

export interface LoopTaskBuilderConfig<T> {
	mutationAction?: DomAction<T>;
	condition?: LoopTaskCondition<T>;
	init?: T;
}

export interface ILoopTaskBuilder<T> extends ITaskBuilderBase<T> {
	until(condition?: LoopTaskCondition<T>): ILoopTaskBuilder<T>;
	initWith(init: T): ILoopTaskBuilder<T>;
}

function validateConfig<T>(config: LoopTaskBuilderConfig<T>) {
	if (!config) {
		throw new CuiDomLoopTaskError("Task is not configured");
	}

	if (!config.mutationAction) {
		throw new CuiDomLoopTaskError("Task must have a mutation callback");
	}

	if (!config.condition) {
		throw new CuiDomLoopTaskError("Task must have a condition callback");
	}
}

export default function LoopTaskBuilder<T>(
	core: IDomCore,
	config: LoopTaskBuilderConfig<T>
): ILoopTaskBuilder<T> {
	const instance: ILoopTaskBuilder<T> = {
		until: (condition?: LoopTaskCondition<T>) => {
			return LoopTaskBuilder(core, {
				...config,
				condition,
			});
		},
		initWith: (init: T) => {
			return LoopTaskBuilder(core, {
				...config,
				init,
			});
		},
		exec: (
			onResolve?: DomResolveCallback<T>,
			onReject?: DomErrorCallback
		) => {
			try {
				validateConfig(config);
				//@ts-ignore config is checked
				if (config.condition(Date.now(), config.init)) {
					if (onResolve) onResolve(config.init);
					return;
				}

				execLoop(
					core,
					onResolve,
					onReject,
					//@ts-ignore config is checked
					config.mutationAction,
					config.condition,
					config.init
				);
			} catch (err) {
				if (onReject) onReject(err);
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

/**
 * Executes task loop
 * @param core - dom core
 * @param onResolve
 * @param onError
 * @param mutateAction
 * @param stopCallback
 * @param init
 */
function execLoop<T>(
	core: IDomCore,
	onResolve: DomResolveCallback<T> | undefined,
	onError: DomErrorCallback | undefined,
	mutateAction: DomAction<T>,
	stopCallback: LoopTaskCondition<T>,
	init?: T
) {
	core.mutate({
		onError,
		init,
		actions: [
			mutateAction,
			getValidateAction(
				core,
				onResolve,
				onError,
				mutateAction,
				stopCallback
			),
		],
	});
}

/**
 * Creates an DomAction that check stop condition and acts appropriately to result
 * @param core - dom core instance
 * @param onResolve - resolve callback
 * @param onError - error callback
 * @param mutateAction - mutation action
 * @param stopCallback - stop condition callback
 * @returns a DomAction
 */
function getValidateAction<T>(
	core: IDomCore,
	onResolve: DomResolveCallback<T> | undefined,
	onError: DomErrorCallback | undefined,
	mutateAction: DomAction<T>,
	stopCallback: LoopTaskCondition<T>
) {
	return (ti: number, val?: T): T | undefined => {
		if (!stopCallback(ti, val)) {
			execLoop(core, onResolve, onError, mutateAction, stopCallback, val);
			return val;
		}

		if (onResolve) onResolve(val);
		return undefined;
	};
}
