/*! jQuery.PresetPreloader - v0.1.3 -  3/30/2012
 * https://github.com/Takazudo/jQuery.PresetPreloader
 * Copyright (c) 2012 "Takazudo" Takeshi Takatsudo; Licensed MIT */

var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

(function($) {
  var Item_replacer, Item_srcs, PresetPreloader, Rollover, fetchImg, loader, _ref;
  loader = null;
  fetchImg = ((_ref = $.ImgLoaderNs) != null ? _ref.fetchImg : void 0) || function(src) {
    return (new Image).src = src;
  };
  Item_replacer = (function() {

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
      if (src) fetchImg(src);
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
        return fetchImg(src);
      });
      return this;
    };

    return Item_srcs;

  })();
  PresetPreloader = (function() {

    function PresetPreloader(config) {
      if (!(this instanceof arguments.callee)) return new PresetPreloader(config);
      this._config = {};
      if (config) this.define(config);
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
          console.log("PresetPreloadr: " + name + " was tried to load but not defined yet");
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

    function Rollover(el, useActive) {
      this.el = el;
      this.toHover = __bind(this.toHover, this);
      this.toNormal = __bind(this.toNormal, this);
      this.$watcher = $(this.el);
      if (this.$watcher.is('img,:image')) {
        this.$img = this.$watcher;
      } else {
        this.$img = this.$watcher.find('img,:image');
      }
      this._src_normal = this.$img.attr('src');
      this._src_hover = (loader.get('hoverimg')).applyReplace(this._src_normal);
      fetchImg(this._src_hover);
      this.$watcher.hover(this.toHover, this.toNormal);
    }

    Rollover.prototype.toNormal = function() {
      this.$img.attr('src', this._src_normal);
      return this;
    };

    Rollover.prototype.toHover = function() {
      this.$img.attr('src', this._src_hover);
      return this;
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
  $.fn.rollover = function() {
    return this.each(function() {
      return new Rollover(this);
    });
  };
  $.PresetPreloader = PresetPreloader;
  return $.presetPreloader = loader;
})(jQuery);
