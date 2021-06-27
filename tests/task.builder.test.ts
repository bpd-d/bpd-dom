import { sleep } from "bpd-toolkit/dist/esm";
import DomTaskBufferCls from "../src/buffer";
import TaskBuilder from "../src/builders/base";
import BpdDomCore from "../src/core";
import DomActionsExecutor from "../src/executor";

function InitialTask(value) {
	return {
		actions: [Task(value)],
	};
}
function Task(value) {
	return () => {
		return value;
	};
}

function TaskWithInit() {
	return (t, init) => {
		return init;
	};
}

function TaskWithActionInit() {
	return {
		actions: [TaskWithInit()],
	};
}

describe("Tests checking [TaskBuilder]", () => {
	let core = null;

	beforeAll(() => {
		core = new BpdDomCore(new DomTaskBufferCls(new DomActionsExecutor()));
	});

	it("Validates no failure on empty actions list", async () => {
		const builder = TaskBuilder(core, { actions: [] });
		const result = await builder.async();

		expect(builder).toBeDefined();
		expect(result).toBeUndefined();
	});

	it("Executes task properly", async () => {
		const builder = TaskBuilder(core, InitialTask("XXX"));
		const result = await builder.async();

		expect(result).toEqual("XXX");
	});

	it("Passes initial value to task", async () => {
		const builder = TaskBuilder(core, TaskWithActionInit());
		const result = await builder.initWith("YYY").async();

		expect(result).toEqual("YYY");
	});

	it("[push] adds callback to queue", async () => {
		const builder = TaskBuilder(core, InitialTask("ZZZ"));
		const result = await builder.push(TaskWithInit()).async();

		expect(result).toEqual("ZZZ");
	});

	it("Handles errors", async () => {
		let wasError = false;
		const builder = TaskBuilder(core, InitialTask("AAA"));
		try {
			const result = await builder
				.push(() => {
					throw new Error("Error");
				})
				.initWith("YYY")
				.async();
		} catch (e) {
			wasError = true;
		}

		expect(wasError).toEqual(true);
	});

	it("Method [exec] transfers data properly", async () => {
		let result = null;
		const builder = TaskBuilder(core, InitialTask("AAA"));
		builder.exec((res) => {
			result = res;
		});

		await sleep(50);
		expect(result).toEqual("AAA");
	});

	it("Method [exec] handles errors properly", async () => {
		let wasError = false;

		const builder = TaskBuilder(core, {
			actions: [
				() => {
					throw new Error("XXX");
				},
			],
		});
		builder.exec(
			(res) => {
				return;
			},
			(e) => {
				wasError = true;
			}
		);

		await sleep(50);
		expect(wasError).toEqual(true);
	});
});
