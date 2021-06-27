export default class CuiDomError extends Error {
	constructor(message: string, name?: string) {
		super(message);
		this.name = name ?? "CuiDomError";
	}
}

export class CuiDomFetchTaskError extends CuiDomError {
	constructor(messge: string) {
		super(messge, "CuiDomFetchTaskError");
	}
}

export class CuiDomBufferError extends CuiDomError {
	constructor(messge: string) {
		super(messge, "CuiDomBufferError");
	}
}

export class CuiDomLoopTaskError extends CuiDomError {
	constructor(messge: string) {
		super(messge, "CuiDomLoopTaskError");
	}
}