# bpd-dom

Simple library, fast dom inspired, handling HTML DOM mutations

# When to use

Key feature of library is to make HTML DOM mutations easier.
Each time you change anything in HTML element via javascript (styles, content, classes, attributes, etc) browser needs to re-render document or at least part of it. Multiple changes (or done in loop) may cause page and it's animations to stutter if `requestAnimationFrame` is not used.

`bpd-dom` bring handy set of features that allow you to perform multiple DOM mutations in a single frame. It provides queueing mechanism which makes your requests executed in a correct order. Moreover you can use `Promises` to await for mutation result or just wait until mutation is done.

# Initialization

Library comes with a `dom` instance already initalized. To access use import:

```
import dom from 'bpd-dom';
```

If you import an UMD module use:

```
const dom = bpdDom.dom.default;
```

# Usage

For each available option you can choose to call an `async` which will return a Promise that will resolve when all action are performed. The other option is method `exec` that also performs action without returning any value. It allows, however, to pass onResolve and onError callbacks.

## Mutation

To get a mutation task call `dom.mutate(...actions)`, pass list of action to be executed.
Dom instance will create new task builder which exposes following methods:

| Method   | Arguments             | Return     | Description                                              |
| -------- | --------------------- | ---------- | -------------------------------------------------------- |
| push     | ...DomActions<T>      | this       | Adds more actions to list                                |
| initWith | T                     | this       | sets initial value - it will be passed to first mutation |
| exec     | onResolve<T>, onError | void       | executes task by pushing it to buffer                    |
| async    | -                     | Promise<T> | Promisified `exec`                                       |

## Fetch

To get a fetch task call `dom.fetch(fetchActions)`, pass a fetch callback that results with input for mutation actions.
Dom instance will create new task builder which exposes following methods:

-   `thenMutate` - (...actions) - add actions to mutation actions list
-   `initWith` - (initialValue) - set initial value - it will be passed to fetch callback
-   `exec` - (onResolve, onReject) - executes task by pushing it to buffer
-   `async` - Promisified exec

| Method     | Arguments             | Return     | Description                                              |
| ---------- | --------------------- | ---------- | -------------------------------------------------------- |
| thenMutate | ...DomActions<T>      | this       | add actions to mutation actions list                     |
| initWith   | T                     | this       | sets initial value - it will be passed to fetch callback |
| exec       | onResolve<T>, onError | void       | executes task by pushing it to buffer                    |
| async      | -                     | Promise<T> | Promisified `exec`                                       |

## Loop

To execute callback in a loop (animation like) call `dom.loop(mutationAction)`, pass a mutation callback. On each iteration builder first mutates action then checks condition (passed via method `until`), if it passes - it breaks an execution.

> NOTE
>
> Take into account the fact that check function is executed for the first time right before starting a loop.
> If it passed than loop doesn't even start - execution is resolved with initial value

Dom instance will create new task builder which exposes following methods:

| Method   | Arguments                           | Return     | Description                                                                                                                 |
| -------- | ----------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| until    | (timestamp: number, t: T) => boolen | this       | sets callback that verifies whether loop shall continue                                                                     |
| initWith | T                                   | this       | set initial value - it will be passed first to check condition (the one executed on start), then to first mutation callback |
| exec     | onResolve<T>, onError               | void       | executes task by pushing it to buffer                                                                                       |
| async    | -                                   | Promise<T> | Promisified `exec`                                                                                                          |

# Example

## Mutation

```javascript
const task = dom.mutate<T>((ti: number, value: T) => {
    // Do mutation
    return value
}).initWith(value: T)

const result = await task.async();

// Alternatively

task.exec((t: T) => {
    // Handle result
}, (e) => {
    // Handle error
})

```

## Fetch

```javascript
const task = dom.fetch<T>((ti: number, value: T) => {
    // Do fetch...
    return // value to be passed to first mutation action
})
.initWith(value: T)
.thenMutate((ti: number, value: T) => {
    // Do mutation
    return
})
const result = await task.async();

// Alternatively

task.exec((t: T) => {
    // Handle result
}, (e) => {
    // Handle error
})

```

## Loop

```javascript
const task = dom.loop<T>((ti: number, value: T) => {
    // Do fetch...
    return // value to be passed to first mutation action
})
.initWith(value: T)
.until((ti: number, value: T) => {
    if(value) {
        // Stop
        return true;
    }

    // Continue
    return false;
})
const result = await task.async();

// Alternatively

task.exec((t: T) => {
    // Handle result
}, (e) => {
    // Handle error
})

```
