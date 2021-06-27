import dom from "../index";

function getValue(value) {
	return () => {
		return value;
	};
}

describe("Tests checking [BpdDom] instance", () => {
	it("It is initialized", () => {
		expect(dom).toBeDefined();
	});

	it("Method [create] creates a cloned copy", () => {
		const copy = dom.create();
		expect(copy).toBeDefined();
		expect(copy === dom).toEqual(false);
	});

	it("Method [mutate] creates a task builder that mutates dom", async () => {
		const result = await dom.mutate(getValue("XXX")).async();

		expect(result).toEqual("XXX");
	});

	it("Method [fetch] creates a task builder that mutates dom", async () => {
		const result = await dom
			.fetch(getValue("XXX"))
			.thenMutate((t, v) => {
				v += "X";
				return v;
			})
			.async();

		expect(result).toEqual("XXXX");
	});
});
