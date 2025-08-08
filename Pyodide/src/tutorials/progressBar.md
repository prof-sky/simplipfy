# Progress Bar

This tutorial will show you how to use the custom progress bar that show the 
progress for **pyodide loading** and will be **enabled when pyodide loading is finished**.

See allStyles.css for the style with `.progress-stripes` and `@keyframes moveStripes`

## How to use

To make a button a progress bar, you have to add the class `circuitStartBtn` to the
class list. You also need to add a few layers inside the button. An example of a button, 
that will be a progress bar and is enabled when loading is done is:

```js
<button id="someId" class="circuitStartBtn btn btn-warning text-dark px-5">
        <div class="fill-layer"></div>
        <div class="progress-stripes"></div>
        <span class="button-text">start/or your text</span>
</button>
```
As mentioned before, this does not have to be a button, it can also be a div, circuitStartBtn is a custom class
that will add the necessary styles to the element if the additional layers are inside.

If you want to create a button that contains the progress bar, you have to use the `<button>` tag like in the example above
to be able to disable the button at the beginning, you can not use a div with the bootstrap btn class. After all you want the button to be enabled only when pyodide is loaded.
Disable the button after creating it:
```js
let btn = document.getElementById("someId");
btn.disabled = true;
```
If you only want a progress bar that is not a button but just shows the pyodide waiting progress,
you can make it a `<div>` with the class `circuitStartBtn` and the additional layers inside and don't have to disable it.

When loading is done, the function
```js
selectorBuilder.enableStartBtns()
```
is called to set `disabled` to false and enables all the circuit start buttons

and 
```js
finishStartBtns()
```

is called to do some final touches on all progress bars and circuit start buttons.
You don't have to adjust the functions if you use a progress bar like the example above.





