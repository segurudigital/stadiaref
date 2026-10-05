// src/integrations/loader.js
import path from "node:path";
var OPTIMIZE_DEPS = { exclude: ["stadiaref", "stadiaref/core"] };
function initOptions(options) {
  var out = {};
  for (var key in options || {}) {
    if (key !== "setup" && Object.prototype.hasOwnProperty.call(options, key))
      out[key] = options[key];
  }
  return out;
}
function setupPath(setup, root) {
  if (typeof setup !== "string" || !setup)
    return null;
  return path.resolve(root, setup).split(path.sep).join("/");
}
function loaderCode(options, root) {
  var setup = setupPath(options && options.setup, root);
  var lines = ["import stadiaref from 'stadiaref';"];
  if (setup)
    lines.push("import setup from " + JSON.stringify(setup) + ";");
  lines.push("(async function () {");
  lines.push("  if (!stadiaref) return;");
  if (setup)
    lines.push("  if (typeof setup === 'function') await setup(stadiaref);");
  lines.push("  stadiaref.init(" + JSON.stringify(initOptions(options)) + ");");
  lines.push("})();");
  return lines.join("\n") + "\n";
}

// src/integrations/vite/index.js
var VIRTUAL = "virtual:stadiaref";
var RESOLVED = "\0" + VIRTUAL;
function stadiaref(options) {
  var opts = options || {};
  var root = process.cwd();
  var base = "/";
  return {
    name: "stadiaref",
    apply: "serve",
    config: function() {
      return { optimizeDeps: OPTIMIZE_DEPS };
    },
    configResolved: function(config) {
      root = config.root;
      base = config.base || "/";
    },
    resolveId: function(id) {
      if (id === VIRTUAL)
        return RESOLVED;
      return null;
    },
    load: function(id) {
      if (id === RESOLVED)
        return loaderCode(opts, root);
      return null;
    },
    transformIndexHtml: function() {
      return [{
        tag: "script",
        attrs: { type: "module", src: (base.charAt(base.length - 1) === "/" ? base : base + "/") + "@id/" + VIRTUAL },
        injectTo: "head"
      }];
    }
  };
}
export {
  stadiaref as default
};
