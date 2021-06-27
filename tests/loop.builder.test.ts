import DomTaskBufferCls from "../src/buffer";
import BpdDomCore from "../src/core";
import DomActionsExecutor from "../src/executor";
import LoopTaskBuilder from "../src/builders/loop";

function SimpleCheck(maxCount: number) {
	let _count = 0;
	return (ti, value) => {
		_count++;
		return _count >= maxCount;
	};
}

describe("Tests verify class [LoopTaskBuilder]", () => {
	let core = null;

	beforeAll(() => {
		core = new BpdDomCore(new DomTaskBufferCls(new DomActionsExecutor()));
	});

	it("Fails when check callback is not set", async () => {
		let wasError = false;
		const builder = LoopTaskBuilder(core, {
			mutationAction: () => {
				return true;
			},
		});
		try {
			await builder.async();
		} catch (e) {
			wasError = true;
		}
		expect(builder).toBeDefined();
		expect(wasError).toBeTrue();
	});

	it("Fails when mutation callback is not set", async () => {
		let wasError = false;
		const builder = LoopTaskBuilder(core, undefined);
		try {
			await builder.async();
		} catch (e) {
			wasError = true;
		}
		expect(builder).toBeDefined();
		expect(wasError).toBeTrue();
	});

	it("Uses initial value in mutation callback", async () => {
		let wasError = false;
		let result = null;
		const builder = LoopTaskBuilder(core, {
			mutationAction: (ti, val) => {
				return val;
			},
		})
			.until(SimpleCheck(1))
			.initWith("YYY");

		try {
			result = await builder.async();
		} catch (e) {
			wasError = true;
		}
		expect(builder).toBeDefined();
		expect(wasError).toBeFalse();
		expect(result).toEqual("YYY");
	});

	it("Executes mutation callback in Loop", async () => {
		let wasError = false;
		let result = null;
		const builder = LoopTaskBuilder<number>(core, {
			mutationAction: (ti, val) => {
				return val + 1;
			},
		})
			.until(SimpleCheck(4))
			.initWith(1);

		try {
			result = await builder.async();
		} catch (e) {
			wasError = true;
		}
		expect(builder).toBeDefined();
		expect(wasError).toBeFalse();
		expect(result).toEqual(4);
	});

	it("Handles errors in mutation", async () => {
		let wasError = false;
		let result = null;
		const builder = LoopTaskBuilder<number>(core, {
			mutationAction: (ti, val) => {
				if (val == 3) {
					throw new Error("Error");
				}
				return val + 1;
			},
		})
			.until(SimpleCheck(4))
			.initWith(1);

		try {
			result = await builder.async();
		} catch (e) {
			wasError = true;
		}

		expect(builder).toBeDefined();
		expect(wasError).toBeTrue();
		expect(result).toBeNull();
	});

	it("Handles errors in stop condition", async () => {
		let wasError = false;
		let result = null;
		const builder = LoopTaskBuilder<number>(core, {
			mutationAction: (ti, val) => {
				return val + 1;
			},
		})
			.until(() => {
				throw new Error("SSSS");
			})
			.initWith(1);

		try {
			result = await builder.async();
		} catch (e) {
			wasError = true;
		}

		expect(builder).toBeDefined();
		expect(wasError).toBeTrue();
		expect(result).toBeNull();
	});
});
