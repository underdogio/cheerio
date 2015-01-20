/**
 * Module dependencies
 */

var select = require('CSSselect'),
    parse = require('./parse'),
    render = require('dom-serializer'),
    _ = require('lodash');

/**
 * $.load(str)
 */

exports.load = function(content, options) {
  var Cheerio = require('./cheerio');

  options = _.defaults(options || {}, Cheerio.prototype.options);

  var root = parse(content, options);

  var initialize = function(selector, context, r, opts) {
    if (!(this instanceof initialize)) {
      return new initialize(selector, context, r, opts);
    }
    opts = _.defaults(opts || {}, options);
    return Cheerio.call(this, selector, context, r || root, opts);
  };

  // Ensure that selections created by the "loaded" `initialize` function are
  // true Cheerio instances.
  initialize.prototype = Object.create(Cheerio.prototype);
  initialize.prototype.constructor = initialize;

  // Mimic jQuery's prototype alias for plugin authors.
  initialize.fn = initialize.prototype;

  // Keep a reference to the top-level scope so we can chain methods that implicitly
  // resolve selectors; e.g. $("<span>").(".bar"), which otherwise loses ._root
  initialize.prototype._originalRoot = root;

  // Add in the static methods
  _.merge(initialize, exports);

  // Add in the root
  initialize._root = root;
  // store options
  initialize._options = options;

  return initialize;
};

/**
 * $.html([selector | dom])
 */

exports.html = function(dom, options) {
  var Cheerio = require('./cheerio');

  // be flexible about parameters, sometimes we call html(),
  // with options as only parameter
  // check dom argument for dom element specific properties
  // assume there is no 'length' or 'type' properties in the options object
  if (Object.prototype.toString.call(dom) === '[object Object]' && !options && !('length' in dom) && !('type' in dom))
  {
    options = dom;
    dom = undefined;
  }

  // sometimes $.html() used without preloading html
  // so fallback non existing options to the default ones
  options = _.defaults(options || {}, this._options, Cheerio.prototype.options);

  if (dom) {
    dom = (typeof dom === 'string') ? select(dom, this._root, options) : dom;
    return render(dom, options);
  } else if (this._root && this._root.children) {
    return render(this._root.children, options);
  } else {
    return '';
  }
};

/**
 * $.xml([selector | dom])
 */

exports.xml = function(dom) {
  if (dom) {
    dom = (typeof dom === 'string') ? select(dom, this._root, this.options) : dom;
    return render(dom, { xmlMode: true });
  } else if (this._root && this._root.children) {
    return render(this._root.children, { xmlMode: true });
  } else {
    return '';
  }
};

/**
 * $.text(dom)
 */

exports.text = function(elems) {
  if (!elems) return '';

  var ret = '',
      len = elems.length,
      elem;

  for (var i = 0; i < len; i ++) {
    elem = elems[i];
    if (elem.type === 'text') ret += elem.data;
    else if (elem.children && elem.type !== 'comment') {
      ret += exports.text(elem.children);
    }
  }

  return ret;
};

/**
 * $.parseHTML(data [, context ] [, keepScripts ])
 * Parses a string into an array of DOM nodes. The `context` argument has no
 * meaning for Cheerio, but it is maintained for API compatibility with jQuery.
 */
exports.parseHTML = function(data, context, keepScripts) {
  var parsed;

  if (!data || typeof data !== 'string') {
    return null;
  }

  if (typeof context === 'boolean') {
    keepScripts = context;
  }

  parsed = this.load(data);
  if (!keepScripts) {
    parsed('script').remove();
  }

  return parsed.root()[0].children;
};

/**
 * $.root()
 */
exports.root = function() {
  return this(this._root);
};

/**
 * $.contains()
 */
exports.contains = function(container, contained) {

  // According to the jQuery API, an element does not "contain" itself
  if (contained === container) {
    return false;
  }

  // Step up the descendants, stopping when the root element is reached
  // (signaled by `.parent` returning a reference to the same object)
  while (contained && contained !== contained.parent) {
    contained = contained.parent;
    if (contained === container) {
      return true;
    }
  }

  return false;
};

/**
 * $.param()
 */
// https://github.com/jquery/jquery/blob/2.1.3/src/serialize.js#L9-L76
var r20 = /%20/g,
  rbracket = /\[\]$/;
function buildParams(prefix, obj, traditional, add) {
  var name;

  if (Array.isArray(obj)) {
    // Serialize array item.
    _.each(obj, function(v, i) {
      if (traditional || rbracket.test(prefix)) {
        // Treat each array item as a scalar.
        add(prefix, v);
      } else {
        // Item is non-scalar (array or object), encode its numeric index.
        buildParams(prefix + '[' + ( typeof v === 'object' ? i : '' ) + ']', v, traditional, add );
      }
    });
  } else if (!traditional && typeof obj === 'object') {
    // Serialize object item.
    for (name in obj) {
      buildParams(prefix + '[' + name + ']', obj[name], traditional, add);
    }
  } else {
    // Serialize scalar item.
    add(prefix, obj);
  }
}

// Serialize an array of form elements or a set of
// key/values into a query string
exports.param = function(a, traditional) {
  var prefix,
      s = [],
      add = function( key, value ) {
        // If value is a function, invoke it and return its value
        value = typeof value === 'function' ? value() : (value == null ? '' : value);
        s[s.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
      };

  // Set traditional to true for jQuery <= 1.3.2 behavior.
  if (traditional === undefined) {
    // https://github.com/jquery/jquery/blob/2.1.3/src/ajax.js#L301
    // traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
    traditional = false;
  }

  // If an array was passed in, assume that it is an array of form elements.
  // TODO: What is that jquery property?
  if (Array.isArray(a) || (a.jquery && typeof a !== 'object')) {
    // Serialize the form elements
    _.each(a, function(elem) {
      var Cheerio = elem.constructor;
      var $elem = Cheerio(elem);
      add($elem.attr('name'), $elem.attr('value'));
    });
  } else {
    // If traditional, encode the "old" way (the way 1.3.2 or older
    // did it), otherwise encode params recursively.
    for (prefix in a) {
      buildParams(prefix, a[prefix], traditional, add);
    }
  }

  // Return the resulting serialization
  return s.join('&').replace(r20, '+');
};
