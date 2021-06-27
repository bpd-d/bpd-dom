function createElement(ti, tag) {
	const element = document.createElement(tag);
	document.body.appendChild(element);
	return element;
}

function addContent(content) {
	return (ti, element) => {
		element.textContent = content;
		return element;
	};
}

function fetchElement(ti, init) {
	return document.getElementById(init);
}

function untilCheck(edge) {
	return (ti, val) => {
		return val >= edge;
	};
}

function translateX(handle) {
	return (ti, val) => {
		handle.style.transform = `translateX(${val}px)`;
		return val + 1;
	};
}

async function runSimpleMutation(dom) {
	const result = await dom
		.mutate(createElement, addContent("Simple mutation"))
		.initWith("div")
		.async();
	console.log("Simple mutation result", result);
}

async function runSimpleFetch(dom) {
	const result = await dom
		.fetch(fetchElement)
		.thenMutate(addContent("Simple fetch and mutate"))
		.initWith("fetch")
		.async();
	console.log("Simple fetch result", result);
}

async function runLoopExample(dom) {
	const result = await dom
		.loop(translateX(document.getElementById("loop")))
		.until(untilCheck(500))
		.initWith(0)
		.async();
	console.log("Loop result", result);
}

window.addEventListener("DOMContentLoaded", async () => {
	//console.log(bpdDom.dom.default);
	const dom = bpdDom.dom.default;

	await runSimpleMutation(dom);
	await runSimpleFetch(dom);
	await runLoopExample(dom);
});
