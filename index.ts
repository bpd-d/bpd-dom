import BpdDomCoreClass from "./src/core";
import DomTaskBufferCls from "./src/buffer";
import DomActionsExecutor from "./src/executor";
import BpdDom from "./src/dom";

const dom = new BpdDom(
	new BpdDomCoreClass(new DomTaskBufferCls(new DomActionsExecutor()))
);

export default dom;
