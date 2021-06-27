import { catchError } from "./helpers/tools";

describe("Tests checking [catchError]", () => {
	it("Returns true when NO ERROR was catched", async () => {
		const wasOk = await catchError(() => {
			const a = 0;
		});
		expect(wasOk).toBeTrue();
	});

	it("Returns false when an ERROR was CATCHED", async () => {
		const wasOk = await catchError(() => {
			throw new Error("dsds");
		});
		expect(wasOk).toBeFalse();
	});
});
