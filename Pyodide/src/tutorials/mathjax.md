# Notes for Mathjax usage

- Since MathJax.typeset() is asynchronous and use in various files, a better solution is to use 
  `await MathJax.typesetPromise()` which returns a promise that resolves when the typesetting is complete.
  With this it should not be possible to have two MathJax renders at the same time which could result in errors.