Pyodide Worker
===================
To get a more fluid rendering in the frontend, pyodide is moved to a webworker.
In this worker, all functions for simplipfy are called.

Workflow
-----------
The handling of pyodide is split into 3 parts:
- A webworker that handles the pyodide instance (pyodideWorker.js)
- A webworker API that is called from the frontend classed to access the pyodide instance (pyodideWorkerAPI.js)
- A specific group of functions inside an object that are grouped as one API, example

    - pyodideAPI.js
    - stepSolverAPI.js
    - state.apis.kirchhoffSolverjs

The splitting of the functions into different files is done to keep the code clean and organized.
The calls inside this files are exactly the same. Following is an example of how the API is used.

Usage
~~~~~~~

At some place the function exampleAPICall (a python function in the backend) should be called.
For this, a exampleAPI.js is created, looking something like this ::

    class ExampleAPI {

        constructor(worker) {
            this.worker = worker; // the worker instance
        }

        exampleAPICall(a, b) {
            return requestResponse(this.worker, {
                action: "exampleAPICall",
                data: { a: a, b: b },
            });
        }

The functions call ```requestResponse``` which is a function that handles the communication with the worker.
It returns a promise that resolves when the worker has finished the calculation and returns the result.
For this, the resolve return values have to be handled, this happens in ```getResolve``` in pyodideWorkerAPI.js::

    function getResolve(msg, resolve, event) {
        try {
            if (msg.action === "someAction") {
                resolve(event.data.status);
            } else if (msg.action === "exampleAPICall") {
                resolve([event.data.c, event.data.d]);
            } ...

And for ```event.data.c``` and ```event.data.d``` to be available, the pyodideWorker.js has to be adapted, e.g. like this::

    try {
        // Make sure pyodide and micropip is loaded before doing anything else
        self.pyodide = await self.pyodideReadyPromise;

        // ###################### Some API ######################
        if (event.data.action === "exampleAPICall") {
            await self.pyodide.someImportedModule.exampleAPICall(event.data.data.a, event.data.data.b);
            self.postMessage({id: _id});
        }
        ...


Important things to note
~~~~~~~~~~~~~~~~~~~~~~~~~

- The strings like "exampleAPICall" must match between the different files (improvable)
- Each function in the pyodideWorker.js must finish with a self.postMessage({id: _id}) to send the result back to the frontend.
- The calls of the worker are filtered by this id, so that the right result is sent back to the right request.