import { sleep } from "bpd-toolkit/dist/esm";
import DomTaskBuffer from "../src/buffer";
import DomActionsExecutor from "../src/executor";
import { DomTask } from "../src/interfaces";
import { catchError } from "./helpers/tools";

describe("Tests validating [DomTaskBuffer]", () => {
	it("Initializes properly", () => {
		const buffer = new DomTaskBuffer(new DomActionsExecutor());

		expect(buffer).toBeDefined();
	});

	it("Throws an error when executor was not passed", async () => {
		const result = await catchError(() => {
			const buffer = new DomTaskBuffer(undefined);
		}, 10);

		expect(result).toBeFalse();
	});

	it("Executes a task", async () => {
		const buffer = new DomTaskBuffer(new DomActionsExecutor());
		let executionResult = null;
		const task: DomTask<string> = {
			actions: [
				(ti: number, init: string) => {
					executionResult = init;
					return executionResult;
				},
			],
			init: "XXX",
		};
		buffer.push(task);
		await sleep(50);
		expect(buffer).toBeDefined();
		expect(executionResult).toEqual("XXX");
	});

	it("Catches an error in onError", async () => {
		const buffer = new DomTaskBuffer(new DomActionsExecutor());
		let wasError = false;
		const task: DomTask<string> = {
			actions: [
				(ti: number, init: string) => {
					throw new Error("XX");
				},
			],
			init: "XXX",
			onError: (e) => {
				wasError = true;
			},
		};
		buffer.push(task);
		await sleep(50);
		expect(buffer).toBeDefined();
		expect(wasError).toBeTrue();
	});

	it("Accepts empty task without error", async () => {
		const buffer = new DomTaskBuffer(new DomActionsExecutor());
		const result = await catchError(() => {
			buffer.push(null);
		});

		expect(buffer).toBeDefined();
		expect(result).toBeTrue();
	});

	it("Calls method [onBeforePush] when provided", async () => {
		let wasPush = false;
		let wasExecuted = false;
		const buffer = new DomTaskBuffer(new DomActionsExecutor(), {
			onBeforePush: (task) => {
				wasPush = true;
				return task;
			},
		});

		const task = {
			actions: [
				() => {
					wasExecuted = true;
					return "XXX";
				},
			],
		};

		buffer.push(task);
		await sleep(50);

		expect(wasPush).toBe(true);
		expect(wasExecuted).toBe(true);
	});

	it("Calls method [onBeforeFlush] when provided", async () => {
		let wasFlush = false;
		let wasExecuted = false;
		const buffer = new DomTaskBuffer(new DomActionsExecutor(), {
			onBeforeFlush: () => {
				wasFlush = true;
			},
		});

		const task = {
			actions: [
				() => {
					wasExecuted = true;
					return "XXX";
				},
			],
		};

		buffer.push(task);
		await sleep(50);

		expect(wasFlush).toBe(true);
		expect(wasExecuted).toBe(true);
	});

	it("Calls method [onLock, onUnlock] when provided", async () => {
		let wasLocked = false;
		let wasUnloacked = false;
		let wasExecuted = false;
		const buffer = new DomTaskBuffer(new DomActionsExecutor(), {
			onLock: () => {
				wasLocked = true;
			},
			onUnlock: () => {
				wasUnloacked = true;
			},
		});

		const task = {
			actions: [
				() => {
					wasExecuted = true;
					return "XXX";
				},
			],
		};

		buffer.push(task);
		await sleep(50);

		expect(wasLocked).toBe(true);
		expect(wasUnloacked).toBe(true);
		expect(wasExecuted).toBe(true);
	});

	it("All callbacks are executed in proper order", async () => {
		const executionQueue = [];
		const buffer = new DomTaskBuffer(new DomActionsExecutor(), {
			onLock: () => {
				executionQueue.push("lock");
			},
			onBeforePush: (taks) => {
				executionQueue.push("push");
				return taks;
			},
			onBeforeFlush: () => {
				executionQueue.push("flush");
			},
			onUnlock: () => {
				executionQueue.push("unlock");
			},
		});

		const task = {
			actions: [
				() => {
					executionQueue.push("execute");
					return "XXX";
				},
			],
		};

		buffer.push(task);
		await sleep(50);

		expect(executionQueue.length).toEqual(5);
		expect(executionQueue[0]).toEqual("push");
		expect(executionQueue[1]).toEqual("flush");
		expect(executionQueue[2]).toEqual("lock");
		expect(executionQueue[3]).toEqual("execute");
		expect(executionQueue[4]).toEqual("unlock");
	});
});
