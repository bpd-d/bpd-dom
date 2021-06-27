import { sleep } from "bpd-toolkit/dist/esm/index";

export async function catchError(
	callback: () => void,
	timeout: number = 50
): Promise<boolean> {
	let result = true;
	try {
		callback();
	} catch (e) {
		console.error(e);
		result = false;
	}
	await sleep(timeout);
	return result;
}
