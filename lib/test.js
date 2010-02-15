// Simplified from test/runner.js of Narwhal.

var assert = require("assert");
var sys = require("sys");

exports.run = function(objectOrModule) {
  var result = _run(objectOrModule);
  return result;
}

var _run = function(objectOrModule, context) {
  if (typeof objectOrModule === "string")
    objectOrModule = require(objectOrModule);
  if (!objectOrModule)
    throw "Nothing to run";

  var localContext = context || {passed: 0, failed: 0, error: 0, depth: 0};
  localContext.depth++;

  for (var spaces=""; spaces.length < localContext.depth * 2; spaces += "  ");
  for (var property in objectOrModule) {
    if (property.match(/^test/)) {
      sys.puts(spaces + "+ Running " + property);
      if (typeof objectOrModule[property] == "function") {
        if (typeof objectOrModule.setup === "function")
          objectOrModule.setup();

        try {
          objectOrModule[property]();
          localContext.passed++;
        } catch (e) {
          if (e.name === "AssertionError") {
            sys.puts(spaces + "  " + e);
            localContext.failed++;
          } else {    
            sys.puts(spaces + "  " + e);
            localContext.error++;
          }
        } finally {
          if (typeof objectOrModule.teardown === "function")
            objectOrModule.teardown();
        }
      } else {
        _run(objectOrModule[property], localContext);
      }
    }
  }

  localContext.depth--;

  if (context === undefined) {
    sys.puts("Passed " + localContext.passed + "; Failed " + 
      localContext.failed + "; Error " + localContext.error + ";");
  }

  return localContext.failed + localContext.error;
};

