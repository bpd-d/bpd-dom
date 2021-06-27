import DomTaskBufferCls from "../src/buffer";
import BpdDomCore from "../src/core";
import DomActionsExecutor from "../src/executor";
import FetchTaskBuilder from "../src/builders/fetch";

function SimpleFetch(value) {
	return () => {
		return value;
	};
}

function FetchFromInit() {
	return (ti: number, val: string) => {
		return val;
	};
}

function MutationAction<T>(ti: number, val?: T) {
	return val;
}

describe("Test checking [FetchTaskBuilder]", () => {
	let core = null;

	beforeAll(() => {
		core = new BpdDomCore(new DomTaskBufferCls(new DomActionsExecutor()));
	});

	it("Fails when fetch callback was not provided", async () => {
		let wasError = false;
		const builder = FetchTaskBuilder(core, undefined);
		try {
			await builder.async();
		} catch (e) {
			wasError = true;
		}

		expect(builder).toBeDefined();
		expect(wasError).toBeTrue();
	});

	it("Fails when mutation actions were not provided", async () => {
		let wasError = false;
		const builder = FetchTaskBuilder(core, {
			fetch: SimpleFetch("XXX"),
		});
		try {
			await builder.async();
		} catch (e) {
			wasError = true;
		}

		expect(builder).toBeDefined();
		expect(wasError).toBeTrue();
	});

	it("Pushes result from fetch to mutation", async () => {
		let wasError = false;
		let result = null;
		const builder = FetchTaskBuilder(core, {
			fetch: SimpleFetch("XXX"),
		}).thenMutate(MutationAction);
		try {
			result = await builder.async();
		} catch (e) {
			console.error("Fetch", e);
			wasError = true;
		}

		expect(builder).toBeDefined();
		expect(wasError).toBeFalse();
		expect(result).toEqual("XXX");
	});

	it("Pushes result from fetch to mutation using initial value", async () => {
		let wasError = false;
		let result = null;
		const builder = FetchTaskBuilder(core, {
			fetch: FetchFromInit(),
		})
			.initWith("YYY")
			.thenMutate(MutationAction);
		try {
			result = await builder.async();
		} catch (e) {
			wasError = true;
		}

		expect(builder).toBeDefined();
		expect(wasError).toBeFalse();
		expect(result).toEqual("YYY");
	});

	it("Handles errors inside of fetch task - does not execute mutation", async () => {
		let wasError = false;
		let wasMutated = false;
		const builder = FetchTaskBuilder<string>(core, {
			fetch: () => {
				throw new Error("sss");
			},
		});
		builder.thenMutate(() => {
			wasMutated = true;
			return "XX";
		});
		try {
			await builder.async();
		} catch (e) {
			wasError = true;
		}

		expect(builder).toBeDefined();
		expect(wasError).toBeTrue();
		expect(wasMutated).toBeFalse();
	});

	it("Handles errors inside of mutation task", async () => {
		let wasError = false;
		let wasMutated = false;
		const builder = FetchTaskBuilder<string>(core, {
			fetch: SimpleFetch("XXX"),
		});
		builder.thenMutate(() => {
			throw new Error("SS");
		});
		try {
			await builder.async();
		} catch (e) {
			wasError = true;
		}

		expect(builder).toBeDefined();
		expect(wasError).toBeTrue();
	});
});
