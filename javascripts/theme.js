/**
 * Pixel Cookers script for Redmine
 * author: Ludovic Meyer, Pixel Cookers - http://www.pixel-cookers.com
 * v2.1
 */
(function($, document, undefined) {
	$(document).ready(function() {
		var cfg = {
			"password.length": 7,
			"password.special": false,
			"stopwatch.enabled": true,
			"stopwatch.precision": 2
		};

		$('#main-menu li a').each(function(){
		    var title = $(this).html();
		    $(this).tooltip({
		        placement: 'right',
		        title: title
		    })
		});

		var sidebar_btn = $('<div id="sidebar_btn">&nbsp;</div>'),
			elem = $('#main:not(.nosidebar) #sidebar');

		sidebar_btn.on('click', toggle_sidebar);

		if (elem != undefined){
			elem.before(sidebar_btn);
			if ($.cookie('hide_sidebar') == 'yes'){
				$('#main').toggleClass('nosidebar');
			}
		}

		$('.controller-repositories .entry a[href$=".SyncTrash"], .controller-repositories .entry a[href$=".SyncID"], .controller-repositories .entry a[href$=".SyncIgnore"]').parent().parent().remove();

		injectViewportMetaTag();
		injectAppleTouchIcons();

		// Password generation in user creation
		var genContainer = $(document.createElement('p'));
		var genLabel = $(document.createElement('label'));
		var genBtn = $(document.createElement('button')).attr('type', 'button').attr('id', 'generate-password').attr('class', "btn greydient").text('Generate password');
		var useBtn = $(document.createElement('button')).attr('type', 'button').attr('id', 'use-password').attr('class', "btn greydient").text('Use password');
		var passFields = $('.controller-users.action-new #password_fields, .controller-users.action-create #password_fields, .controller-users.action-edit #password_fields');

		passFields.append(genContainer);
		genContainer.append(genLabel).append(genBtn).append(useBtn);
		useBtn.hide();


		genBtn.on('click', function(){
			var password = $.password(cfg['password.length'],cfg['password.special']);
			var info = passFields.find('.info');
			useBtn.fadeIn().attr('attr-value', password);
			info.html('Password generated : '+password);
			$('#user_password, #user_password_confirmation').val('');
			return false;
		});

		useBtn.on('click', function(){
			$('#user_password, #user_password_confirmation').val($(this).attr('attr-value'));
			$(this).fadeOut();
			return false;
		});

		if(cfg['stopwatch.enabled']) {
			var stopwatchContainer = $(document.createElement('div')).attr('class', 'stopwatch-container');
			var runBtn = $(document.createElement('button')).attr('type', 'button').attr('id', 'stopwatch-run').attr('class', 'btn greydient').attr('value', 'Play').html('Play');
			var stopwatch = $(document.createElement('span')).attr('id', 'stopwatch').attr('class', 'icon icon-time');
			$('#time_entry_hours').parent().append(stopwatchContainer);
			stopwatchContainer.append(stopwatch).append(runBtn);
			stopwatch.html('00:00:00');

			$('#stopwatch-run').on('click', function(){
				var num = checkDecimal($('#time_entry_hours').attr('value'))*3600000;
				stopwatch.stopwatch({startTime: num}).stopwatch('toggle');
				stopwatch.bind('tick.stopwatch', function(e, elapsed){
					var num = elapsed/3600000;
					$('#time_entry_hours').attr('value', num.toFixed(cfg['stopwatch.precision']));
				})

				if($(this).attr('value') == 'Play') {
					$(this).attr('value', 'Pause').html('Pause');
				} else {
					$(this).attr('value', 'Play').html('Play');
				}

				window.onbeforeunload = function (e) {
					var e = e || window.event;
					if (e) {
						e.returnValue = 'You are running a timer.';
					}
					return 'You are running a timer.';
				};

				return false;
			});

			$('#time_entry_hours').on('keyup', function(){
				stopwatch.html(makeTime(this.value));
			})

			if($.cookie("Timer auto ?") == 1) {
				$('#stopwatch-run').trigger('click');
			}

			$('.controller-issues.action-show #issue-form input[type="submit"], .controller-timelog .edit_time_entry input[type="submit"], .controller-timelog .new_time_entry input[type="submit"]').on('click', function(){
				window.onbeforeunload = function (e) {
					var e = e || window.event;
					if (e) {
						e.returnValue = null;
					}
					return null;
				};
			});
		}

		var loadTitle = $(document.createElement('h3')).html('Pixel Cookers Theme');
		var loadBtn = $(document.createElement('button')).attr('type', 'button').attr('id', 'load-options').attr('class', 'btn greydient').html('Load User Preferences');
		var loadResult = $(document.createElement('p')).attr('id', 'load-result');
		var mySidebar = $('.controller-my.action-account #sidebar');

		mySidebar.append(loadTitle).append(loadBtn).append(loadResult);
		if($.cookie("Timer auto ?")) {
			$('#load-options').html('Reload User Preferences');
			$('#load-result').html('User Preferences Loaded');
		}
		loadBtn.on('click', function(){
			loadUserOptions();
		});
	});

	function loadUserOptions() {
		var api_key = $('#api-access-key').html()
		if(api_key != null){
			$.ajax({
				url: '/users/current.json?key='+api_key
			}).done(function( json ) {
					$.each(json.user.custom_fields, function(i, item) {
						if(item.name == "Timer auto ?") {
							//console.log(item.name + item.value);
							$.cookie(item.name, item.value, {path: '/'});
						}
					});
					$('#load-options').html('Reload User Preferences');
					$('#load-result').html('User Preferences Loaded');
				}).fail(function(){
					$('#load-result').html('API request failed.');
				});
		} else {
			$('#load-result').html('No API key, please generate one. If you can\'t, please ask your administrator.')
		}
	}

	function toggle_sidebar(){
		$('#main').toggleClass('nosidebar');
		if($('#main').hasClass('nosidebar')){
			$.cookie('hide_sidebar', 'yes', {path: '/'});
		}else{
			$.cookie('hide_sidebar', 'no', {path: '/'});
		}
	}

	function injectViewportMetaTag(){
		var meta = $(document.createElement('meta'));
		meta.attr('name', 'viewport');
		meta.attr('content', 'width=device-width, initial-scale=1');
		$('head').append(meta);
	}

	var scripts = document.getElementsByTagName("script"),
		src = scripts[scripts.length-1].src;
	src = src.split('/');
	src = src[src.length-3];

	function injectAppleTouchIcons(){
		var link = $(document.createElement('link'));
		link.attr('rel', 'apple-touch-icon');
		link.attr('href', '/themes/'+src+'/images/touch/apple-touch-icon.png');
		$('head').append(link);

		link = $(document.createElement('link'));
		link.attr('rel', 'apple-touch-icon');
		link.attr('href', '/themes/'+src+'/images/touch/apple-touch-icon-72x72-precomposed.png');
		link.attr('sizes', '72x72');
		$('head').append(link);

		link = $(document.createElement('link'));
		link.attr('rel', 'apple-touch-icon');
		link.attr('href', '/themes/'+src+'/images/touch/apple-touch-icon-114x114-precomposed.png');
		link.attr('sizes', '114x114');
		$('head').append(link);
	}

	function leftPad(number, targetLength) {
		var output = number + '';
		while (output.length < targetLength) {
			output = '0' + output;
		}
		return output;
	}

	function checkDecimal(str) {
		if (!str) return 0;
		var ok = "";
		for (var i = 0; i < str.length; i++) {
			var ch = str.substring(i, i+1);
			if ((ch < "0" || "9" < ch) && ch != '.') {
				alert("Only numeric input is allowed!\n\n"
					+ parseFloat(ok) + " will be used because '"
					+ str + "' is invalid.\nYou may correct "
					+ "this entry and try again.");
				return parseFloat(ok);
			}
			else ok += ch;
		}
		return parseFloat(str);
	}

	function makeTime(value) {
		var num = (checkDecimal(value)); // validates input
		if (num) {
			var hour = parseInt(num);
			num -= parseInt(num);
			num=num.toFixed(13)
			num *= 60;

			var min = parseInt(num);
			num -= parseInt(num);
			num=num.toFixed(13)
			num *= 60;
			var sec = parseInt(num);
			return leftPad(hour, 2) + ':' + leftPad(min, 2) + ':' + leftPad(sec, 2);
		} else {
			return '00:00:00';
		}
	}

})(jQuery, document);

/*!
 * jQuery Cookie Plugin v1.3
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
(function ($, document, undefined) {

	var pluses = /\+/g;

	function raw(s) {
		return s;
	}

	function decoded(s) {
		return decodeURIComponent(s.replace(pluses, ' '));
	}

	var config = $.cookie = function (key, value, options) {

		// write
		if (value !== undefined) {
			options = $.extend({}, config.defaults, options);

			if (value === null) {
				options.expires = -1;
			}

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}

			value = config.json ? JSON.stringify(value) : String(value);

			return (document.cookie = [
				encodeURIComponent(key), '=', config.raw ? value : encodeURIComponent(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// read
		var decode = config.raw ? raw : decoded;
		var cookies = document.cookie.split('; ');
		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			if (decode(parts.shift()) === key) {
				var cookie = decode(parts.join('='));
				return config.json ? JSON.parse(cookie) : cookie;
			}
		}

		return null;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) !== null) {
			$.cookie(key, null, options);
			return true;
		}
		return false;
	};

})(jQuery, document);


/*
 * Password generator
 * http://www.designchemical.com/blog/index.php/jquery/random-password-generator-using-jquery/
 */
$.extend({
	password: function (length, special) {
		var iteration = 0;
		var password = "";
		var randomNumber;
		if(special == undefined){
			var special = false;
		}
		while(iteration < length){
			randomNumber = (Math.floor((Math.random() * 100)) % 94) + 33;
			if(!special){
				if ((randomNumber >=33) && (randomNumber <=47)) { continue; }
				if ((randomNumber >=58) && (randomNumber <=64)) { continue; }
				if ((randomNumber >=91) && (randomNumber <=96)) { continue; }
				if ((randomNumber >=123) && (randomNumber <=126)) { continue; }
			}
			iteration++;
			password += String.fromCharCode(randomNumber);
		}
		return password;
	}
});

/*
 * jQuery stopwatch
 * https://github.com/robcowie/jquery-stopwatch/blob/master/jquery.stopwatch.js
 */
(function( $ ){

	function incrementer(ct, increment) {
		return function() { ct+=increment; return ct; };
	}

	function pad2(number) {
		return (number < 10 ? '0' : '') + number;
	}

	function defaultFormatMilliseconds(millis) {
		var x, seconds, minutes, hours;
		x = millis / 1000;
		seconds = Math.floor(x % 60);
		x /= 60;
		minutes = Math.floor(x % 60);
		x /= 60;
		hours = Math.floor(x % 24);
		// x /= 24;
		// days = Math.floor(x);
		return [pad2(hours), pad2(minutes), pad2(seconds)].join(':');
	}

	//NOTE: This is a the 'lazy func def' pattern described at http://michaux.ca/articles/lazy-function-definition-pattern
	function formatMilliseconds(millis, data) {
		// Use jintervals if available, else default formatter
		var formatter;
		if (typeof jintervals == 'function') {
			formatter = function(millis, data){return jintervals(millis/1000, data.format);};
		} else {
			formatter = defaultFormatMilliseconds;
		}
		formatMilliseconds = function(millis, data) {
			return formatter(millis, data);
		};
		return formatMilliseconds(millis, data);
	}

	var methods = {

		init: function(options) {
			var defaults = {
				updateInterval: 1000,
				startTime: 0,
				format: '{HH}:{MM}:{SS}',
				formatter: formatMilliseconds
			};

			// if (options) { $.extend(settings, options); }

			return this.each(function() {
				var $this = $(this),
					data = $this.data('stopwatch');

				// If the plugin hasn't been initialized yet
				if (!data) {
					// Setup the stopwatch data
					var settings = $.extend({}, defaults, options);
					data = settings;
					data.active = false;
					data.target = $this;
					data.elapsed = settings.startTime;
					// create counter
					data.incrementer = incrementer(data.startTime, data.updateInterval);
					data.tick_function = function() {
						var millis = data.incrementer();
						data.elapsed = millis;
						data.target.trigger('tick.stopwatch', [millis]);
						data.target.stopwatch('render');
					};
					$this.data('stopwatch', data);
				}

			});
		},

		start: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('stopwatch');
				// Mark as active
				data.active = true;
				data.timerID = setInterval(data.tick_function, data.updateInterval);
				$this.data('stopwatch', data);
			});
		},

		stop: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('stopwatch');
				clearInterval(data.timerID);
				data.active = false;
				$this.data('stopwatch', data);
			});
		},

		destroy: function() {
			return this.each(function(){
				var $this = $(this),
					data = $this.data('stopwatch');
				$this.stopwatch('stop').unbind('.stopwatch').removeData('stopwatch');
			});
		},

		render: function() {
			var $this = $(this),
				data = $this.data('stopwatch');
			$this.html(data.formatter(data.elapsed, data));
		},

		getTime: function() {
			var $this = $(this),
				data = $this.data('stopwatch');
			return data.elapsed;
		},

		toggle: function() {
			return this.each(function() {
				var $this = $(this);
				var data = $this.data('stopwatch');
				if (data.active) {
					$this.stopwatch('stop');
				} else {
					$this.stopwatch('start');
				}
			});
		},

		reset: function() {
			return this.each(function() {
				var $this = $(this);
				data = $this.data('stopwatch');
				data.incrementer = incrementer(data.startTime, data.updateInterval);
				data.elapsed = data.startTime;
				$this.data('stopwatch', data);
			});
		}
	};


	// Define the function
	$.fn.stopwatch = function( method ) {
		if (methods[method]) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.stopwatch' );
		}
	};

})( jQuery );

/* ===========================================================
 * bootstrap-tooltip.js v2.3.2
 * http://twitter.github.com/bootstrap/javascript.html#tooltips
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ===========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* TOOLTIP PUBLIC CLASS DEFINITION
  * =============================== */

  var Tooltip = function (element, options) {
    this.init('tooltip', element, options)
  }

  Tooltip.prototype = {

    constructor: Tooltip

  , init: function (type, element, options) {
      var eventIn
        , eventOut
        , triggers
        , trigger
        , i

      this.type = type
      this.$element = $(element)
      this.options = this.getOptions(options)
      this.enabled = true

      triggers = this.options.trigger.split(' ')

      for (i = triggers.length; i--;) {
        trigger = triggers[i]
        if (trigger == 'click') {
          this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
        } else if (trigger != 'manual') {
          eventIn = trigger == 'hover' ? 'mouseenter' : 'focus'
          eventOut = trigger == 'hover' ? 'mouseleave' : 'blur'
          this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
          this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
        }
      }

      this.options.selector ?
        (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
        this.fixTitle()
    }

  , getOptions: function (options) {
      options = $.extend({}, $.fn[this.type].defaults, this.$element.data(), options)

      if (options.delay && typeof options.delay == 'number') {
        options.delay = {
          show: options.delay
        , hide: options.delay
        }
      }

      return options
    }

  , enter: function (e) {
      var defaults = $.fn[this.type].defaults
        , options = {}
        , self

      this._options && $.each(this._options, function (key, value) {
        if (defaults[key] != value) options[key] = value
      }, this)

      self = $(e.currentTarget)[this.type](options).data(this.type)

      if (!self.options.delay || !self.options.delay.show) return self.show()

      clearTimeout(this.timeout)
      self.hoverState = 'in'
      this.timeout = setTimeout(function() {
        if (self.hoverState == 'in') self.show()
      }, self.options.delay.show)
    }

  , leave: function (e) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type)

      if (this.timeout) clearTimeout(this.timeout)
      if (!self.options.delay || !self.options.delay.hide) return self.hide()

      self.hoverState = 'out'
      this.timeout = setTimeout(function() {
        if (self.hoverState == 'out') self.hide()
      }, self.options.delay.hide)
    }

  , show: function () {
      var $tip
        , pos
        , actualWidth
        , actualHeight
        , placement
        , tp
        , e = $.Event('show')

      if (this.hasContent() && this.enabled) {
        this.$element.trigger(e)
        if (e.isDefaultPrevented()) return
        $tip = this.tip()
        this.setContent()

        if (this.options.animation) {
          $tip.addClass('fade')
        }

        placement = typeof this.options.placement == 'function' ?
          this.options.placement.call(this, $tip[0], this.$element[0]) :
          this.options.placement

        $tip
          .detach()
          .css({ top: 0, left: 0, display: 'block' })

        this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

        pos = this.getPosition()

        actualWidth = $tip[0].offsetWidth
        actualHeight = $tip[0].offsetHeight

        switch (placement) {
          case 'bottom':
            tp = {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2}
            break
          case 'top':
            tp = {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2}
            break
          case 'left':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth}
            break
          case 'right':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width}
            break
        }

        this.applyPlacement(tp, placement)
        this.$element.trigger('shown')
      }
    }

  , applyPlacement: function(offset, placement){
      var $tip = this.tip()
        , width = $tip[0].offsetWidth
        , height = $tip[0].offsetHeight
        , actualWidth
        , actualHeight
        , delta
        , replace

      $tip
        .offset(offset)
        .addClass(placement)
        .addClass('in')

      actualWidth = $tip[0].offsetWidth
      actualHeight = $tip[0].offsetHeight

      if (placement == 'top' && actualHeight != height) {
        offset.top = offset.top + height - actualHeight
        replace = true
      }

      if (placement == 'bottom' || placement == 'top') {
        delta = 0

        if (offset.left < 0){
          delta = offset.left * -2
          offset.left = 0
          $tip.offset(offset)
          actualWidth = $tip[0].offsetWidth
          actualHeight = $tip[0].offsetHeight
        }

        this.replaceArrow(delta - width + actualWidth, actualWidth, 'left')
      } else {
        this.replaceArrow(actualHeight - height, actualHeight, 'top')
      }

      if (replace) $tip.offset(offset)
    }

  , replaceArrow: function(delta, dimension, position){
      this
        .arrow()
        .css(position, delta ? (50 * (1 - delta / dimension) + "%") : '')
    }

  , setContent: function () {
      var $tip = this.tip()
        , title = this.getTitle()

      $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
      $tip.removeClass('fade in top bottom left right')
    }

  , hide: function () {
      var that = this
        , $tip = this.tip()
        , e = $.Event('hide')

      this.$element.trigger(e)
      if (e.isDefaultPrevented()) return

      $tip.removeClass('in')

      function removeWithAnimation() {
        var timeout = setTimeout(function () {
          $tip.off($.support.transition.end).detach()
        }, 500)

        $tip.one($.support.transition.end, function () {
          clearTimeout(timeout)
          $tip.detach()
        })
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        removeWithAnimation() :
        $tip.detach()

      this.$element.trigger('hidden')

      return this
    }

  , fixTitle: function () {
      var $e = this.$element
      if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
        $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
      }
    }

  , hasContent: function () {
      return this.getTitle()
    }

  , getPosition: function () {
      var el = this.$element[0]
      return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
        width: el.offsetWidth
      , height: el.offsetHeight
      }, this.$element.offset())
    }

  , getTitle: function () {
      var title
        , $e = this.$element
        , o = this.options

      title = $e.attr('data-original-title')
        || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

      return title
    }

  , tip: function () {
      return this.$tip = this.$tip || $(this.options.template)
    }

  , arrow: function(){
      return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow")
    }

  , validate: function () {
      if (!this.$element[0].parentNode) {
        this.hide()
        this.$element = null
        this.options = null
      }
    }

  , enable: function () {
      this.enabled = true
    }

  , disable: function () {
      this.enabled = false
    }

  , toggleEnabled: function () {
      this.enabled = !this.enabled
    }

  , toggle: function (e) {
      var self = e ? $(e.currentTarget)[this.type](this._options).data(this.type) : this
      self.tip().hasClass('in') ? self.hide() : self.show()
    }

  , destroy: function () {
      this.hide().$element.off('.' + this.type).removeData(this.type)
    }

  }


 /* TOOLTIP PLUGIN DEFINITION
  * ========================= */

  var old = $.fn.tooltip

  $.fn.tooltip = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('tooltip')
        , options = typeof option == 'object' && option
      if (!data) $this.data('tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tooltip.Constructor = Tooltip

  $.fn.tooltip.defaults = {
    animation: true
  , placement: 'top'
  , selector: false
  , template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
  , trigger: 'hover focus'
  , title: ''
  , delay: 0
  , html: false
  , container: false
  }


 /* TOOLTIP NO CONFLICT
  * =================== */

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(window.jQuery);
