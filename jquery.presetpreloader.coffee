(($) -> # encapsulate plugin start

  loader = null # shared in this plugin

  # ============================================================
  # utility
  
  # preload img only once
  
  preload = (->
    cache = {}
    (src) ->
      if cache[src] then return
      cache[src] = true
      (new Image).src = src
  )()


  # ============================================================
  # preloader item class
  # each wraps one preload config item

  class Item_replacer
    ###
      replInfo should be an object like
      {
        expr: /^(.+_)normal(\.[^.]+)$/,
        result:'$1hover$2'
      }
    ###
    constructor: (@replInfo) ->
    applyReplace: (baseSrc) ->
      if not @replInfo.expr.test baseSrc
        return null
      baseSrc.replace @replInfo.expr, @replInfo.result
    load: (baseSrc) ->
      src = @applyReplace baseSrc
      if src then preload src
      @

  class Item_srcs
    # srcs is just an array of srcs
    constructor: (@srcs) ->
    load: ->
      $.each @srcs, (i, src) -> preload src
      @


  # ============================================================
  # PresetPreloader
  # is the main class which manages config items
  
  class PresetPreloader

    constructor: ->
      # handle instance creation wo new
      if not (@ instanceof arguments.callee)
        return new PresetPreloader config

      @_config = {}

    define: (config) ->
      $.each config, (key, val) =>
        switch ($.type val)
          when 'array'
            # if array, it's just an srcs
            @_config[key] = new Item_srcs val
          when 'object'
            # if object, it's expr patterns
            @_config[key] = new Item_replacer val
      @

    get: (name) ->
      item = @_config[name]
      if not item
        console?.log "PresetPreloader: #{name} was not defined yet"
        return false
      item

    load: (name, src) ->
      item = @get name
      if not item
        console?.log "PresetPreloadr: #{name} was tried to load but it was not defined yet"
        return false
      item.load src
      @


  # instancify loader
  
  loader = new PresetPreloader


  # ============================================================
  # Rollover

  class Rollover
    
    ###
      options should be an object like
      {
        hoverPresetKey: 'hoverimg'
        activePresetKey: 'activeimg'
        useActive: false
      }
    ###
    constructor: (@el, @options) ->

      @_setupEls()
      @_src_normal = @$img.attr 'src'

      # prepare hover img
      replacer = loader.get @options.hoverPresetKey
      @_src_hover = replacer.applyReplace @_src_normal
      preload @_src_hover

      # eventify
      @$watcher.hover @toHover, @toNormal
      @$watcher.focus @toHover
      @$watcher.blur @toNormal

      # setup :active behavior
      if @options.useActive then @_setupActiveBehavior()

    _setupEls: ->
      @$watcher = $(@el)
      if @$watcher.is 'img,:image'
        @$img = @$watcher
      else
        @$img = @$watcher.find 'img,:image'

    _setupActiveBehavior: ->
      # prepare active img
      replacer = loader.get @options.activePresetKey
      @_src_active = replacer.applyReplace @_src_normal
      preload @_src_active

      # eventify
      @$watcher.mousedown @toActive
      @$watcher.mouseup @toNormal

      @

    _imgTo: (stats) ->
      src = null
      switch stats
        when 'normal' then src = @_src_normal
        when 'hover' then src = @_src_hover
        when 'active' then src = @_src_active
      @$img.attr 'src', src
      @
      
    toNormal: => @_imgTo 'normal'
    toHover: => @_imgTo 'hover'
    toActive: => @_imgTo 'active'


  # ============================================================
  # jQuery bridges

  $.fn.presetPreload = ->
    @each ->
      $el = $(@)
      key = $el.data 'preloadKey'
      src = $el.attr 'src'
      loader.load key, src

  $.fn.rollover = (options) ->
    options = $.extend
      hoverPresetKey: 'hoverimg'
      activePresetKey: 'activeimg'
      useActive: false
    , options
    @each ->
      new Rollover @, options
  

  # ============================================================

  # globalify
  $.PresetPreloader = PresetPreloader
  $.presetPreloader = loader


) jQuery # encapsulate plugin end

