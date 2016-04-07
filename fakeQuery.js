
/**
 * fakeQuery. Like jQuery but fake.
 *
 * A naive/modern implementation of the jQuery methods necessary for our
 * DateRangePicker
 */

module.exports = (function (root) {

  'use strict';

  var _selectorMethod = [
    'matches',
    'webkitMatchesSelector',
    'mozMatchesSelector',
    'oMatchesSelector',
    'msMatchesSelector'
  ].find(function (method) {
    return document.documentElement[method];
  });

  function $(node) {
    if (!(this instanceof $)) {
      return new $(node);
    }

    var nodes;
    if (typeof node === 'string') {
      nodes = node.startsWith('<') && node.endsWith('>')
        ? this.parseHTML(node) // Handle HTML
        : document.querySelectorAll(node); // Handle CSS Selector
    } else { // Handle node, collection of nodes, or $ instance
      nodes = 'length' in node && node !== window ? node : [node]; // TODO: ugh
    }

    for (var i = 0; i < nodes.length; i++) { this[i] = nodes[i]; }
    this.length = nodes.length;
  }

  // extends Array
  $.fn = $.prototype = [];

  $.fn.parseHTML = function (html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return $(div.firstChild);
  };

  $.fn.find = function (selector) {
    return $(this.querySelectorAll(selector));
  };

  $.fn.hide = function () {
    return this.show(false);
  };

  $.fn.show = function (show) {
    typeof show === 'undefined' && (show = true);
    this.forEach(function (node) {
      node.style.display = show ? 'block' : 'none';
    });
    return this;
  };

  $.fn.addClass = function (classNames, add) {
    typeof add === 'undefined' && (add = true);
    this.forEach(function (node) {
      classNames.split(' ').forEach(function (name) {
        node.classList[add ? 'add' : 'remove'](name);
      });
    });
    return this;
  };

  $.fn.removeClass = function (className) {
    return this.addClass(className, false);
  };

  $.fn.is = function (selector) {
    return typeof selector === 'string'
      ? this[_selectorMethod](selector)
      : this[0] === selector[0];
  };

  $.fn.on = function (event, selector, handler) {
    var func = typeof selector === 'string'
      ? function (e) {
        var $el = $(e.target);
        ($el.is(selector) || $el.parents(selector).length) &&
          handler.apply(this, arguments);
      }
      : selector;

    var _handler = function (e) {
      func.call(this, e, e.detail);
    };

    this.forEach(function (node) {
      node.addEventListener(event, _handler, false);
      var _removeDatePickerHandler = node._removeDatePickerHandler;
      node._removeDatePickerHandler = function () {
        _removeDatePickerHandler && _removeDatePickerHandler.apply(node, arguments);
        node.removeEventListener(event, _handler, false)
      };
    });

    return this;
  };

  $.fn.off = function (event, handler) {
    this.forEach(function (node) {
      node._removeDatePickerHandler && node._removeDatePickerHandler();
    });

    return this;
  };

  $.fn.html = function (html) {
    return typeof html === 'undefined'
      ? this.innerHTML
      : this.innerHTML = html;
  };

  $.fn.val = function (val) {
    return typeof val === 'undefined'
      ? this.value
      : this.forEach(function (node) { node.value = val; });
  };

  $.fn.trigger = function (event, detail) {
    this.forEach(function (node) {
      node.dispatchEvent(new CustomEvent(event, { detail: detail }));
    });
    return this;
  };

  $.fn.parents = function (selector) {
    var elem = this[0];
    while (elem = elem.parentElement) {
      var $el = $(elem);
      if ($el.is(selector))
        return $el;
    }
    return $([]);
  };

  $.fn.closest = function (selector) {
    return this.parents(selector);
  };

  $.fn.hasClass = function (className) {
    return this.is('.' + className);
  };

  $.fn.append = function (node) {
    this.appendChild($(node)[0]);
    return this;
  };

  $.fn.prepend = function (node) {
    this.insertBefore($(node)[0], this.firstChild);
    return this;
  };

  $.fn.css = function (css) {
    for (var key in css) {
      this.forEach(function (node) {
        node.style[key] = isNaN(+css[key])
          ? css[key]
          : css[key] + 'px';
      });
    }
    return this;
  };

  $.fn.each = function (func) {
    this.forEach(function (el, i) { func(i, el); });
    return this;
  };

  $.fn.attr = function (key, val) {
    if (typeof val === 'undefined') {
      return this.getAttribute(key);
    }
    this.forEach(function (el) {
      el.setAttribute(key, val);
    });
    return this;
  };

  $.fn.removeAttr = function (key) {
    this.forEach(function (el) {
      el.removeAttribute(key);
    });
    return this;
  };

  // delegate all HTMLElement default prototype to the first element in our
  // collection
  for (var key in HTMLElement.prototype) {
    if (!(key in $.fn)) {
      (function (_key) {
        Object.defineProperty($.fn, _key, {
          get: function () {
            var original = this[0][_key];
            return typeof original === 'function'
              ? function () {
                return original.apply(this[0], arguments);
              }
              : original;
          },
          set: function (value) { return this[0][_key] = value; }
        });
      })(key);
    }
  }

  return $;

})(this);

