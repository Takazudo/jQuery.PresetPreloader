(($) -> # encapsulate plugin start

  loader = null

  # if with jQuery.ImgLoader, fetchImg send request only once per src
  # https://github.com/Takazudo/jQuery.ImgLoader
  fetchImg = $.ImgLoaderNs?.fetchImg or (src) ->
    (new Image).src = src


  # wraps one config item

  class Item_replacer
    constructor: (@replInfo) ->
    applyReplace: (baseSrc) ->
      if not @replInfo.expr.test baseSrc
        return null
      baseSrc.replace @replInfo.expr, @replInfo.result
    load: (baseSrc) ->
      src = @applyReplace baseSrc
      if src then fetchImg src
      @

  class Item_srcs
    constructor: (@srcs) ->
    load: ->
      $.each @srcs, (i, src) -> fetchImg src
      @


  # config manager
  
  class PresetPreloader

    constructor: (config) ->

      # handle instance creation wo new
      if not (@ instanceof arguments.callee)
        return new PresetPreloader config

      @_config = {}
      if config then @define config

    define: (config) ->
      $.each config, (key, val) =>
        switch ($.type val)
          when 'array'
            @_config[key] = new Item_srcs val
          when 'object'
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
        console?.log "PresetPreloadr: #{name} was tried to load but not defined yet"
        return false
      item.load src
      @


  # instancify loader
  
  loader = new PresetPreloader


  # rollover item

  class Rollover
    
    constructor: (@el, useActive) ->

      @$watcher = $(@el)
      if @$watcher.is 'img,:image'
        @$img = @$watcher
      else
        @$img = @$watcher.find 'img,:image'

      @_src_normal = @$img.attr 'src'
      @_src_hover = (loader.get 'hoverimg').applyReplace @_src_normal
      fetchImg @_src_hover

      @$watcher.hover @toHover, @toNormal
      
    toNormal: =>
      @$img.attr 'src', @_src_normal
      @
    toHover: =>
      @$img.attr 'src', @_src_hover
      @


  # jQuery bridge

  $.fn.presetPreload = ->
    @each ->
      $el = $(@)
      key = $el.data 'preloadKey'
      src = $el.attr 'src'
      loader.load key, src

  $.fn.rollover = ->
    @each -> new Rollover @
  

  
  # globalify
  $.PresetPreloader = PresetPreloader
  $.presetPreloader = loader


  #loader.define
  #  'foo': [ 'imgs/1.jpg', 'imgs/2.jpg', 'imgs/3.jpg' ]
  #  'bar': [ 'imgs/4.jpg', 'imgs/5.jpg', 'imgs/6.jpg' ]
  #  'hoverimg':
  #    expr: /^(.+_)normal(\.[^.]+)$/
  #    result:'$1hover$2'

  #loader.load 'foo'
  #loader.load 'bar'
  #loader.load 'hoverimg', 'imgs/bothinsamedir/1_normal.jpg'
  #loader.load 'hoverimg', 'imgs/bothinsamedir/2_normal.jpg'
  #loader.load 'hoverimg', 'imgs/bothinsamedir/3_normal.jpg'


) jQuery # encapsulate plugin end

