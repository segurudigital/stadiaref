// src/core/rules.js
var MAX_LENGTH = 160;
function coreProblems(address) {
  if (typeof address !== "string")
    return ["not a string"];
  if (address === "")
    return ["empty"];
  var problems = [];
  if (/[A-Z]/.test(address))
    problems.push("uppercase letters");
  if (/_/.test(address))
    problems.push("underscore");
  if (/\s/.test(address))
    problems.push("spaces");
  if (/[^A-Za-z0-9_\s-]/.test(address))
    problems.push("characters other than a-z, 0-9 and hyphens");
  if (address.charAt(0) === "-")
    problems.push("starts with a hyphen");
  if (address.length > 1 && address.charAt(address.length - 1) === "-")
    problems.push("ends with a hyphen");
  if (address.indexOf("--") !== -1)
    problems.push("two hyphens in a row");
  if (address.length > MAX_LENGTH)
    problems.push("longer than " + MAX_LENGTH + " characters");
  return problems;
}

// src/core/profiles/nesting.js
function tierFromNesting(context) {
  if (!context || typeof context.depth !== "number")
    return null;
  if (context.depth === 0)
    return "section";
  return context.hasAddressedChildren ? "block" : "element";
}

// src/core/profiles/generic.js
var generic = {
  name: "generic",
  classify: function(address, context) {
    return tierFromNesting(context);
  },
  validate: function() {
    return [];
  },
  parse: function(address) {
    return { segments: address.split("-") };
  }
};

// src/core/profiles/app.js
var SURFACES = ["app", "pwa", "mobile", "wp-admin", "wp-frontend", "shopify-admin", "shopify-storefront"];
function split(address) {
  var segs = address.split("-");
  if (segs.length < 2 || !segs[0])
    return null;
  var two = segs.length >= 3 ? segs[1] + "-" + segs[2] : null;
  if (two && SURFACES.indexOf(two) !== -1) {
    return { product: segs[0], surface: two, path: segs.slice(3).join("-") };
  }
  if (SURFACES.indexOf(segs[1]) !== -1) {
    return { product: segs[0], surface: segs[1], path: segs.slice(2).join("-") };
  }
  return null;
}
var app = {
  name: "app",
  classify: function(address, context) {
    return split(address) ? tierFromNesting(context) : null;
  },
  validate: function(address) {
    return split(address) ? [] : ["no product and known surface at the start (" + SURFACES.join(", ") + ")"];
  },
  parse: function(address) {
    return split(address);
  }
};

// src/core/profiles/titan.js
var BLOCK_TYPES = {
  card: 1,
  row: 1,
  item: 1,
  tab: 1,
  slide: 1,
  step: 1,
  cell: 1,
  column: 1,
  panel: 1,
  quote: 1,
  entry: 1
};
var ELEMENT_NOUNS = {
  heading: 1,
  text: 1,
  image: 1,
  cta: 1,
  media: 1,
  link: 1,
  wrapper: 1
};
function classifyTitan(ref) {
  if (!ref || typeof ref !== "string")
    return "unclassified";
  var segs = ref.split("-");
  var len = segs.length;
  if (len < 2)
    return "unclassified";
  var twoDigit = /^\d{2}$/;
  var numeric = /^\d+$/;
  if (len >= 6) {
    var s1 = segs[len - 1];
    var s2 = segs[len - 2];
    var s3 = segs[len - 3];
    var s4 = segs[len - 4];
    if (!numeric.test(s1) && twoDigit.test(s2) && twoDigit.test(s3) && ELEMENT_NOUNS[s4]) {
      return "element";
    }
  }
  if (len >= 4) {
    var bNN = segs[len - 1];
    var bType = segs[len - 2];
    if (twoDigit.test(bNN) && BLOCK_TYPES[bType]) {
      return "block";
    }
  }
  if (!numeric.test(segs[len - 1])) {
    return "section";
  }
  return "unclassified";
}
var titan = {
  name: "titan",
  classify: function(address) {
    var tier = classifyTitan(address);
    return tier === "unclassified" ? null : tier;
  },
  validate: function(address) {
    return classifyTitan(address) === "unclassified" ? ["doesn't match the Titan grammar"] : [];
  },
  parse: function(address) {
    var segs = address.split("-");
    var len = segs.length;
    var tier = classifyTitan(address);
    if (tier === "element") {
      return { tier, prefix: segs.slice(0, len - 4).join("-"), element: segs[len - 4], number: segs[len - 3], instance: segs[len - 2], role: segs[len - 1] };
    }
    if (tier === "block") {
      return { tier, prefix: segs.slice(0, len - 2).join("-"), blockType: segs[len - 2], number: segs[len - 1] };
    }
    if (tier === "section")
      return { tier, segments: segs };
    return null;
  }
};

// src/core/index.js
var DEFAULT_PROFILE = "generic";
var TIERS = ["section", "block", "element"];
var registry = {};
var profiles = [];
function add(profile) {
  registry[profile.name] = profile;
  profiles.push(profile.name);
}
add(generic);
add(app);
add(titan);
function hasProfile(name) {
  return Object.prototype.hasOwnProperty.call(registry, name);
}
function profileFor(options) {
  var name = options && options.profile !== void 0 ? options.profile : DEFAULT_PROFILE;
  if (!hasProfile(name))
    throw new Error('[stadiaref] unknown profile "' + name + '". Registered: ' + profiles.join(", "));
  return registry[name];
}
function registerProfile(profile) {
  if (!profile || typeof profile !== "object")
    throw new TypeError("[stadiaref] registerProfile expects an object");
  if (typeof profile.name !== "string" || !profile.name)
    throw new TypeError("[stadiaref] a profile needs a name");
  if (typeof profile.classify !== "function")
    throw new TypeError('[stadiaref] profile "' + profile.name + '" needs a classify(address, context) function');
  if (profile.validate !== void 0 && typeof profile.validate !== "function")
    throw new TypeError('[stadiaref] profile "' + profile.name + '": validate must be a function');
  if (profile.parse !== void 0 && typeof profile.parse !== "function")
    throw new TypeError('[stadiaref] profile "' + profile.name + '": parse must be a function');
  if (hasProfile(profile.name))
    throw new Error('[stadiaref] a profile named "' + profile.name + '" is already registered');
  add({ name: profile.name, classify: profile.classify, validate: profile.validate, parse: profile.parse });
  return profile.name;
}
function validate(address, options) {
  var p = profileFor(options);
  var problems = coreProblems(address);
  if (!problems.length && p.validate) {
    var own = p.validate(address);
    if (own && own.length)
      problems = problems.concat(own);
  }
  return { valid: problems.length === 0, problems };
}
function classify(address, options) {
  var p = profileFor(options);
  if (!validate(address, options).valid)
    return "unclassified";
  var tier = p.classify(address, options && options.context);
  return TIERS.indexOf(tier) !== -1 ? tier : "unclassified";
}
function parse(address, options) {
  var p = profileFor(options);
  var parts = null;
  if (validate(address, options).valid) {
    parts = p.parse ? p.parse(address) : { segments: address.split("-") };
  }
  return { address, profile: p.name, parts: parts || null };
}
export {
  DEFAULT_PROFILE,
  MAX_LENGTH,
  SURFACES,
  TIERS,
  classify,
  hasProfile,
  parse,
  profiles,
  registerProfile,
  validate
};
