/*! jQuery.PresetPreloader - v0.1.3 -  3/30/2012
 * https://github.com/Takazudo/jQuery.PresetPreloader
 * Copyright (c) 2012 "Takazudo" Takeshi Takatsudo; Licensed MIT */

var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

(function($) {
  var Item_replacer, Item_srcs, PresetPreloader, Rollover, loader, preload;
  loader = null;
  preload = (function() {
    var cache;
    cache = {};
    return function(src) {
      if (cache[src]) return;
      cache[src] = true;
      return (new Image).src = src;
    };
  })();
  Item_replacer = (function() {
    /*
          replInfo should be an object like
          {
            expr: /^(.+_)normal(\.[^.]+)$/,
            result:'$1hover$2'
          }
    */
    function Item_replacer(replInfo) {
      this.replInfo = replInfo;
    }

    Item_replacer.prototype.applyReplace = function(baseSrc) {
      if (!this.replInfo.expr.test(baseSrc)) return null;
      return baseSrc.replace(this.replInfo.expr, this.replInfo.result);
    };

    Item_replacer.prototype.load = function(baseSrc) {
      var src;
      src = this.applyReplace(baseSrc);
      if (src) preload(src);
      return this;
    };

    return Item_replacer;

  })();
  Item_srcs = (function() {

    function Item_srcs(srcs) {
      this.srcs = srcs;
    }

    Item_srcs.prototype.load = function() {
      $.each(this.srcs, function(i, src) {
        return preload(src);
      });
      return this;
    };

    return Item_srcs;

  })();
  PresetPreloader = (function() {

    function PresetPreloader() {
      if (!(this instanceof arguments.callee)) return new PresetPreloader(config);
      this._config = {};
    }

    PresetPreloader.prototype.define = function(config) {
      var _this = this;
      $.each(config, function(key, val) {
        switch ($.type(val)) {
          case 'array':
            return _this._config[key] = new Item_srcs(val);
          case 'object':
            return _this._config[key] = new Item_replacer(val);
        }
      });
      return this;
    };

    PresetPreloader.prototype.get = function(name) {
      var item;
      item = this._config[name];
      if (!item) {
        if (typeof console !== "undefined" && console !== null) {
          console.log("PresetPreloader: " + name + " was not defined yet");
        }
        return false;
      }
      return item;
    };

    PresetPreloader.prototype.load = function(name, src) {
      var item;
      item = this.get(name);
      if (!item) {
        if (typeof console !== "undefined" && console !== null) {
          console.log("PresetPreloadr: " + name + " was tried to load but it was not defined yet");
        }
        return false;
      }
      item.load(src);
      return this;
    };

    return PresetPreloader;

  })();
  loader = new PresetPreloader;
  Rollover = (function() {
    /*
          options should be an object like
          {
            hoverPresetKey: 'hoverimg'
            activePresetKey: 'activeimg'
            useActive: false
          }
    */
    function Rollover(el, options) {
      var replacer;
      this.el = el;
      this.options = options;
      this.toActive = __bind(this.toActive, this);
      this.toHover = __bind(this.toHover, this);
      this.toNormal = __bind(this.toNormal, this);
      this._setupEls();
      this._src_normal = this.$img.attr('src');
      replacer = loader.get(this.options.hoverPresetKey);
      this._src_hover = replacer.applyReplace(this._src_normal);
      preload(this._src_hover);
      this.$watcher.hover(this.toHover, this.toNormal);
      this.$watcher.focus(this.toHover);
      this.$watcher.blur(this.toNormal);
      if (this.options.useActive) this._setupActiveBehavior();
    }

    Rollover.prototype._setupEls = function() {
      this.$watcher = $(this.el);
      if (this.$watcher.is('img,:image')) {
        return this.$img = this.$watcher;
      } else {
        return this.$img = this.$watcher.find('img,:image');
      }
    };

    Rollover.prototype._setupActiveBehavior = function() {
      var replacer;
      replacer = loader.get(this.options.activePresetKey);
      this._src_active = replacer.applyReplace(this._src_normal);
      preload(this._src_active);
      this.$watcher.mousedown(this.toActive);
      this.$watcher.mouseup(this.toNormal);
      return this;
    };

    Rollover.prototype._imgTo = function(stats) {
      var src;
      src = null;
      switch (stats) {
        case 'normal':
          src = this._src_normal;
          break;
        case 'hover':
          src = this._src_hover;
          break;
        case 'active':
          src = this._src_active;
      }
      this.$img.attr('src', src);
      return this;
    };

    Rollover.prototype.toNormal = function() {
      return this._imgTo('normal');
    };

    Rollover.prototype.toHover = function() {
      return this._imgTo('hover');
    };

    Rollover.prototype.toActive = function() {
      return this._imgTo('active');
    };

    return Rollover;

  })();
  $.fn.presetPreload = function() {
    return this.each(function() {
      var $el, key, src;
      $el = $(this);
      key = $el.data('preloadKey');
      src = $el.attr('src');
      return loader.load(key, src);
    });
  };
  $.fn.rollover = function(options) {
    options = $.extend({
      hoverPresetKey: 'hoverimg',
      activePresetKey: 'activeimg',
      useActive: false
    }, options);
    return this.each(function() {
      return new Rollover(this, options);
    });
  };
  $.PresetPreloader = PresetPreloader;
  return $.presetPreloader = loader;
})(jQuery);
