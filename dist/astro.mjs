// src/integrations/astro/index.js
import { fileURLToPath } from "node:url";

// src/overlay/brand.js
var ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20" height="20" aria-hidden="true" focusable="false" class="stadiaref-brand__icon"><defs><clipPath id="stadiaref-icon-clip"><circle cx="256" cy="256" r="256"/></clipPath></defs><g clip-path="url(#stadiaref-icon-clip)"><circle class="stadiaref-brand__disc" cx="256" cy="256" r="256"/><path fill="#fff" d="M328.35,158.25c0,39.96-32.39,72.35-72.35,72.35s-72.35-32.39-72.35-72.35,32.39-72.35,72.35-72.35,72.35,32.39,72.35,72.35M141.19,624.36h0v520.12c0,69.87,30.78,120.8,92.17,128.41v63.09h44.33v-63.09c61.39-7.61,92.17-58.54,92.17-128.41V480.38c0-50.17-16.33-91-46.67-112,14-17.5,29.17-31.49,29.17-57.78,0-17.25-4.37-38.67-26.63-58.37,28.72-21.35,47.41-55.43,47.41-93.97,0-64.7-52.45-117.15-117.15-117.15s-117.15,52.45-117.15,117.15,52.45,117.15,117.15,117.15c8.86,0,17.46-1.07,25.75-2.93,12.7,9.57,20.26,21.05,21.32,31.55,2.55,25.37-19.72,42.73-59.21,83.02-59.5,61.84-77,81.67-87.5,109.67-11.67,28-15.17,65.33-15.17,112v15.65h0Z M185.52,1105.92h0v-513.54c0-77,23.33-102.67,88.67-171.51,4.67-5.83,10.5-11.67,17.5-18.67,25.67,15.17,33.83,50.17,33.83,110.84v598.76c0,81.67-14,117.84-70,117.84s-70-36.17-70-117.84v-5.88h0Z"/></g></svg>';

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
function loaderCode(options, root, before) {
  var setup = setupPath(options && options.setup, root);
  var lines = ["import stadiaref from 'stadiaref';"];
  if (setup)
    lines.push("import setup from " + JSON.stringify(setup) + ";");
  lines.push("(async function () {");
  lines.push("  if (!stadiaref) return;");
  if (before)
    lines.push("  " + before);
  if (setup)
    lines.push("  if (typeof setup === 'function') await setup(stadiaref);");
  lines.push("  stadiaref.init(" + JSON.stringify(initOptions(options)) + ");");
  lines.push("})();");
  return lines.join("\n") + "\n";
}

// src/integrations/astro/index.js
var ICON = ICON_SVG.replace(' width="20" height="20"', "").replace(' class="stadiaref-brand__icon"', "").replace('class="stadiaref-brand__disc"', 'fill="#F97316"');
function stadiaref(options) {
  var opts = options || {};
  return {
    name: "stadiaref",
    hooks: {
      "astro:config:setup": function(params) {
        if (params.command !== "dev")
          return;
        params.addDevToolbarApp({
          id: "stadiaref",
          name: "StadiaRef",
          icon: ICON,
          entrypoint: fileURLToPath(new URL("./astro-app.mjs", import.meta.url))
        });
        params.updateConfig({ vite: { optimizeDeps: OPTIMIZE_DEPS } });
        var root = fileURLToPath(params.config.root);
        var before = "var host = stadiaref[Symbol.for('stadiaref.hostMode')]; if (host) host('astro');";
        params.injectScript("page", loaderCode(opts, root, before));
      }
    }
  };
}
export {
  stadiaref as default
};
