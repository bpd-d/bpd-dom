import { sleep } from "bpd-toolkit/dist/esm";
import DomActionsExecutor from "../src/executor";

describe("Tests validating [DomActionsExecutor]", () => {
	it("Initializes properly", () => {
		const executor = new DomActionsExecutor();
		expect(executor).toBeDefined();
	});

	it("Executes properly when no actions are provided", async () => {
		const executor = new DomActionsExecutor();
		let wasOk = true;
		executor.execute(
			{
				actions: [],
				onError: () => {
					wasOk = false;
				},
				init: null,
			},
			() => {}
		);
		await sleep(50);
		expect(executor).toBeDefined();
		expect(wasOk).toBeTrue();
	});

	it("Executes properly when no actions are provided - undefined", async () => {
		const executor = new DomActionsExecutor();
		let wasOk = true;
		executor.execute(
			{
				actions: undefined,
				onError: (e) => {
					wasOk = false;
				},
				init: undefined,
			},
			() => {}
		);
		await sleep(50);

		expect(executor).toBeDefined();
		expect(wasOk).toBeTrue();
	});

	it("Executes actions", async () => {
		const executor = new DomActionsExecutor();
		let result = null;
		const action = () => {
			result = "XXX";
		};
		let wasOk = true;
		executor.execute(
			{
				actions: [action],
				onError: (e) => {
					wasOk = false;
				},
				init: null,
			},
			() => {}
		);

		await sleep(50);
		expect(executor).toBeDefined();
		expect(wasOk).toBeTrue();
		expect(result).toEqual("XXX");
	});

	it("Passes init value to action", async () => {
		const executor = new DomActionsExecutor();
		let result = null;
		const action = (ti, init) => {
			result = init;
			return null;
		};

		executor.execute<string>(
			{
				actions: [action],
				init: "XXX",
			},
			() => {}
		);
		await sleep(50);

		expect(executor).toBeDefined();
		expect(result).toEqual("XXX");
	});

	it("Passes init value to action", async () => {
		const executor = new DomActionsExecutor();
		let result = null;
		const action = (ti, init) => {
			result = init;
			return null;
		};
		executor.execute<string>({ actions: [action], init: "XXX" }, () => {});
		await sleep(50);

		expect(executor).toBeDefined();
		expect(result).toEqual("XXX");
	});

	it("Handles onResolve", async () => {
		const executor = new DomActionsExecutor();
		let result = null;
		let resolved = null;
		const action = (ti, init) => {
			result = init;
			return "OK";
		};
		executor.execute<string>(
			{
				actions: [action],
				init: "XXX",
				onResolve: (t) => {
					resolved = t;
				},
			},
			() => {}
		);
		await sleep(50);

		expect(executor).toBeDefined();
		expect(result).toEqual("XXX");
		expect(resolved).toEqual("OK");
	});
});
