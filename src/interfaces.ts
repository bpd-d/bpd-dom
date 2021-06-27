export interface DomAction<T> {
	(timestamp: number, arg?: T): T | undefined;
}

export interface DomErrorCallback {
	(e: Error | string): void;
}

export interface DomResolveCallback<T> {
	(t?: T): void;
}

export interface DomTask<T> {
	actions: DomAction<T>[];
	init?: T;
	onError?: DomErrorCallback;
	onResolve?: DomResolveCallback<T>;
}

export interface IDomCore {
	mutate<T>(task: DomTask<T>): void;
}

export interface ITaskBuffer {
	push<T>(task: DomTask<T>): void;
}

export interface TaskBufferOptions {
	onBeforePush?: <T>(task: DomTask<T>) => void;
	onBeforeFlush?: (buffer: ITaskBuffer) => void;
	onLock?: () => void;
	onUnlock?: () => void;
}

export interface ITaskExecutor {
	execute<T>(task: DomTask<T>, whenDone: () => void): void;
}

export interface ITaskBuilderBase<T> {
	/**
	 * Executes task by pushing it to buffer
	 * @param onResolve - {optional} - callback invoked when actions are done
	 * @param onReject - {optional } - callback invoked when error occurs
	 */
	exec(
		onResolve?: DomResolveCallback<T | undefined>,
		onReject?: DomErrorCallback
	): void;
	/**
	 * Promisified version of exec
	 * @returns Promised that is resolved when actions are done
	 */
	async(): Promise<T | undefined>;
}
