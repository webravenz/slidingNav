
(function($){
  
    
  $.fn.slidingNav = function(settings){
    
    return this.each(function() {
      var $elem = $(this),
          _settings = $.extend({}, $.fn.slidingNav.defaultSettings, settings || {}),
          plugin = new SlidingNav(_settings, $elem);
          
      $elem.data('_slidingNav', plugin);
    });
    
  }
  
  $.fn.slidingNav.defaultSettings = {
    linkLeft: null,
    linkRight: null,
    linkTop: null,
    linkBottom: null,
    transitionDuration: 1,
    transitionType: 'ease',
    keyboardNav: true,
    showMap: true
  };
  
  function SlidingNav(settings, $elem)
  {
    this.settings = settings;
    this.$el = $elem;
    
    this.init();
    
    return this;
  }
  
  SlidingNav.prototype = 
  {
    init: function()
    {
      var t = this;
      t.$el.addClass('sn_wrapper');
      
      t.currentPage = null;
      
      t.getPrefixedValues();
      
      // sort pages by id and pos
      t.pagesById = {};
      t.pagesByPos = [];
      
      $.each(t.$el.find(' > div'), function(colNum, colDiv) {
        colDiv = $(colDiv);
        t.pagesByPos[colNum] = [];
        $.each(colDiv.find(' > div'), function(lineNum, lineDiv) {
          lineDiv = $(lineDiv);
          var page = {
            div: lineDiv,
            col: colNum,
            line: lineNum,
            id: lineDiv.attr('id')
          };
          lineDiv.css('display', 'none');
          t.pagesById[page.id] = page;
          t.pagesByPos[colNum][lineNum] = page;
        });
      });
      
      // init nav events
      if(t.settings.linkLeft != null) {
        t.settings.linkLeft.click(function() {
          t.goLeft();
          return false;
        });
      }
      if(t.settings.linkRight != null) {
        t.settings.linkRight.click(function() {
          t.goRight();
          return false;
        });
      }
      if(t.settings.linkTop != null) {
        t.settings.linkTop.click(function() {
          t.goTop();
          return false;
        });
      }
      if(t.settings.linkBottom != null) {
        t.settings.linkBottom.click(function() {
          t.goBottom();
          return false;
        });
      }
      
      $(window).on('hashchange', function() {
        t.onUrlChange();
      });
      
      // init keyboard events
      if(t.settings.keyboardNav) {
        t.initKeyboardNav();
      }
      
      // show map
      if(t.settings.showMap) {
        t.initMap();
      }
      
      // show first page
      t.onUrlChange();
    },
    
    initKeyboardNav: function() {
      var t = this;
      $(window).on('keydown', function(e) {
        switch(e.keyCode) {
          case 37 :
            t.goLeft();
            break;
          case 39 :
            t.goRight();
            break;
          case 38 :
            t.goTop();
            break;
          case 40 :
            t.goBottom();
            break;
        }
      });
    },
    
    initMap: function() {
      this.map = $('<ul class="sn_map"></ul>');
      for(var i = 0; i < this.pagesByPos.length; i++) {
        var line = $('<li></li>');
        for(var j = 0; j < this.pagesByPos[i].length; j++) {
          line.append('<a href="#'+this.pagesByPos[i][j].id+'"></a>')
        }
        this.map.append(line);
      }
      this.$el.append(this.map);
    },
    
    showPage: function(page) {
      var t = this;
      
      
      if(t.currentPage != null) {
        
        var side = '';

        if(t.currentPage.col == page.col) {
          if(t.currentPage.line > page.line) side = 'left';
          else                               side = 'right';
        } else {
          if(t.currentPage.col > page.col) side = 'top';
          else                             side = 'bottom';
        }
          
        t.animePage(page, side+'-appear');
        t.animePage(t.currentPage, side+'-disappear');
      } else {
        page.div.css(t.transformProp, 'translate3d(0,0,0)').css('display', 'block');
      }
      
      // maj map
      if(this.map != null) {
        this.map.find('a').removeClass('active');
        this.map.find('li:eq('+page.col+') > a:eq('+page.line+')').addClass('active');
      }
      
      // maj arrows
      if(this.settings.linkBottom != null) {
        this.settings.linkBottom.removeClass('sn_hide');
        if(page.col >= this.pagesByPos.length - 1) this.settings.linkBottom.addClass('sn_hide');
      }
      if(this.settings.linkTop != null) {
        this.settings.linkTop.removeClass('sn_hide');
        if(page.col == 0) this.settings.linkTop.addClass('sn_hide');
      }
      if(this.settings.linkLeft != null) {
        this.settings.linkLeft.removeClass('sn_hide');
        if(page.line == 0) this.settings.linkLeft.addClass('sn_hide');
      }
      if(this.settings.linkRight != null) {
        this.settings.linkRight.removeClass('sn_hide');
        if(page.line >= this.pagesByPos[page.col].length - 1) this.settings.linkRight.addClass('sn_hide');
      }
      
      t.currentPage = page;
    },
    
    animePage: function(page, side) {
      var t = this,
          startTransform,
          endTransform,
          hide;
          
      switch(side) {
        case 'left-appear' :
          startTransform = 'translate3d(-100%,0,0)';
          endTransform = 'translate3d(0,0,0)';
          hide = false;
          break;
        case 'left-disappear' :
          startTransform = 'translate3d(0,0,0)';
          endTransform = 'translate3d(100%,0,0)';
          hide = true;
          break;
        case 'right-appear' :
          startTransform = 'translate3d(100%,0,0)';
          endTransform = 'translate3d(0,0,0)';
          hide = false;
          break;
        case 'right-disappear' :
          startTransform = 'translate3d(0,0,0)';
          endTransform = 'translate3d(-100%,0,0)';
          hide = true;
          break;
        case 'top-appear' :
          startTransform = 'translate3d(0,-100%,0)';
          endTransform = 'translate3d(0,0,0)';
          hide = false;
          break;
        case 'top-disappear' :
          startTransform = 'translate3d(0,0,0)';
          endTransform = 'translate3d(0,100%,0)';
          hide = true;
          break;
        case 'bottom-appear' :
          startTransform = 'translate3d(0,100%,0)';
          endTransform = 'translate3d(0,0,0)';
          hide = false;
          break;
        case 'bottom-disappear' :
          startTransform = 'translate3d(0,0,0)';
          endTransform = 'translate3d(0,-100%,0)';
          hide = true;
          break;
      }
          
      page.div.css(t.transformProp, startTransform)
              .css('display', 'block');
      
      setTimeout(function() {
        page.div.css(t.transitionProp, 'all '+t.settings.transitionDuration+'s '+t.settings.transitionType)
                .css(t.transformProp, endTransform)
                .one(t.tEndEvent, function() {
                  page.div.css(t.transitionProp, 'none');
                  if(hide) page.div.css('display', 'none');
                });
      }, 25);
    },
    
    onUrlChange: function() {
      var id = window.location.hash.slice(1);
      var page = this.pagesById[id];
      if(page != undefined) {
        this.showPage(page);
      } else {
        this.showPage(this.pagesByPos[0][0]);
      }
    },
    
    setUrl: function(page) {
      window.location.hash = page.div.attr('id');
    },
    
    goLeft: function() {
      if(this.currentPage.line > 0) {
        this.setUrl(this.pagesByPos[this.currentPage.col][this.currentPage.line - 1]);
      }
    },
    
    goRight: function() {
      var page = this.pagesByPos[this.currentPage.col][this.currentPage.line + 1];
      if(page != undefined) {
        this.setUrl(page);
      }
    },
    
    goTop: function() {
      if(this.currentPage.col > 0) {
        this.setUrl(this.pagesByPos[this.currentPage.col - 1][0]);
      }
    },
    
    goBottom: function() {
      var page = this.pagesByPos[this.currentPage.col + 1] ? this.pagesByPos[this.currentPage.col + 1][0] : null;
      if(page != undefined) {
        this.setUrl(page);
      }
    },
    
    getPrefixedValues: function() {
      var tEvents = {
        'WebkitTransition' : 'webkitTransitionEnd',
        'MozTransition'    : 'transitionend',
        'OTransition'      : 'oTransitionEnd otransitionend',
        'msTransition'     : 'MSTransitionEnd',
        'transition'       : 'transitionend'
      };
      
      this.tEndEvent = tEvents[Modernizr.prefixed('transition')];
      this.transitionProp = Modernizr.prefixed('transition');
      this.transformProp = Modernizr.prefixed('transform');
    }
  }
 
})(jQuery);

