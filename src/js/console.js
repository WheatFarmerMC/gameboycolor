/*
 * Copyright (C) 2012-2016 InSeven Limited.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

KEYCODE_A = 65;
KEYCODE_S = 83;
KEYCODE_RETURN = 13;
KEYCODE_SHIFT_LEFT = 16;

(function($) {

  App.Console = function(device, gameBoy, events, store) {
    this.init(device, gameBoy, events, store);
  };
  
  App.Console.State = {
    VISIBLE: 0,
    HIDDEN:  1,
  };
  
  App.Console.SHAKE_THRESHOLD = 24;
  App.Console.SHAKE_TIMEOUT_MS = 800;

  jQuery.extend(
    App.Console.prototype, {
      
      init: function(device, gameBoy, events, store) {
        var self = this;
        
        self.logging = new App.Logging(window.config.logging_level, "console");
        self.device = device;
        self.core = gameBoy;
        self.events = events;
        self.store = store;
        self.state = App.Console.State.HIDDEN;
        self.element = $('#screen-console');
        self.screen = $('#LCD');
        self.color = "grape";
        self.scrollBlocker = function(event) {
          event.preventDefault();
        };

        self.element.get(0).addEventListener('touchmove', function(e) {
          e.preventDefault();
        }, false);

        // Controls.

        self.pad = new App.Controls.Pad({
          touchDownLeft  : function() { self.core.keyDown(Gameboy.Key.LEFT); },
          touchUpLeft    : function() { self.core.keyUp(Gameboy.Key.LEFT); },
          touchDownRight : function() { self.core.keyDown(Gameboy.Key.RIGHT); },
          touchUpRight   : function() { self.core.keyUp(Gameboy.Key.RIGHT); },
          touchDownUp    : function() { self.core.keyDown(Gameboy.Key.UP); },
          touchUpUp      : function() { self.core.keyUp(Gameboy.Key.UP); },
          touchDownDown  : function() { self.core.keyDown(Gameboy.Key.DOWN); },
          touchUpDown    : function() { self.core.keyUp(Gameboy.Key.DOWN); }
        });

        self.button_a = self.configureButton($('#control-a'), Gameboy.Key.A, KEYCODE_A);
        self.button_b = self.configureButton($('#control-b'), Gameboy.Key.B, KEYCODE_S);
        self.button_start = self.configureButton($('#control-start'), Gameboy.Key.START, KEYCODE_RETURN);
        self.button_select = self.configureButton($('#control-select'), Gameboy.Key.SELECT, KEYCODE_SHIFT_LEFT);

        // Navigation.

        self.navigationBarTimeout = undefined;
        self.navigation = $('#console-navigation-bar');
        self.screen = new App.Controls.Button($('#element-screen'), { touchUpInside: function() {
          if (self.navigationBarTimeout !== undefined) {
            clearTimeout(self.navigationBarTimeout);
            self.navigationBarTimeout = undefined;
            self.navigation.addClass('hidden');
          } else {
            self.navigation.removeClass('hidden');
            self.navigationBarTimeout = setTimeout(function() {
              self.navigation.addClass('hidden');
              self.navigationBarTimeout = undefined;
            }, 2000);
          }
        }});
        
        self.navigation_back = new App.Controls.Button($('#button-library'), { touchUpInside: function() {
          self.logging.info("Show library");
          window.tracker.track('games');
          self.hide();
        }});

        self.restoreColor().always(function(color) {
          $('#screen-splash').css("display", "none");
        });

        self.menu = new App.Menu(function() {
          self.core.pause();
        }, function() {
          self.core.run();
        });

        self.menu.onReset = function() {
          self.core.reset();
        };

        self.menu.onABStartSelect = function() {
          setTimeout(function() {
            self.core.keyDown(Gameboy.Key.A);
            self.core.keyDown(Gameboy.Key.B);
            self.core.keyDown(Gameboy.Key.START);
            self.core.keyDown(Gameboy.Key.SELECT);
            setTimeout(function() {
              self.core.keyUp(Gameboy.Key.A);
              self.core.keyUp(Gameboy.Key.B);
              self.core.keyUp(Gameboy.Key.START);
              self.core.keyUp(Gameboy.Key.SELECT);
            }, 40);
          }, 400);
        };

        self.game = new App.Controls.Button($('#button-game'), { touchUpInside: function() {
          self.logging.info("Show game menu");
          window.tracker.track('menu');
          self.menu.show();
        }});

      },

      /**
       * Create a new button.
       *
       * @param element DOM element.
       * @param keyEvent The key event to inject into the emulator core.
       * @param keyCode The browser key code to bind to.
       *
       * @return The newly created button. 
       */
      configureButton: function(element, keyEvent, keyCode) {
        var self = this;
        var button = new App.Controls.Button(element, { touchDown : function() {
          self.core.keyDown(keyEvent);
        }, touchUp: function() {
          self.core.keyUp(keyEvent);
        }}, keyCode);
        button.animate = false;
        return button;
      },

      restoreColor: function() {
        var self = this;
        var deferred = new jQuery.Deferred();
        self.logging.info("Attempting to restore the previous color");
        self.store.property(App.Controller.Domain.SETTINGS, App.Store.Property.COLOR, function(color) {
          if (color === undefined) {
            self.logging.warning("No previous color to load");
            deferred.reject();
            return;
          }
          self.logging.info("Loaded previous color '" + color + "'");
          self.setColor(color);
          deferred.resolve(color);
        });
        return deferred.promise();
      },

      setColor: function(color) {
        var self = this;
        self.logging.info("Set color: " + color);
        if (color == self.color) {
          self.logging.info("Ignoring set to current color: " + color);
          return;
        }
        self.element.addClass(color);
        self.element.removeClass(self.color);
        self.color = color;
      },

      pause: function() {
        var self = this;
        self.core.pause();
      },

      run: function() {
        var self = this;
        self.core.run();
      },

      clear: function() {
        var self = this;
        self.core.clear();
      },
      
      event: function(id) {
        var self = this;
        if (id in self.events) {
          self.events[id]();
        }
      },
      
      hide: function() {
        var self = this;
        if (self.state != App.Console.State.HIDDEN) {

          if (self.navigationBarTimeout !== undefined) {
            clearTimeout(self.navigationBarTimeout);
            self.navigationBarTimeout = undefined;
          }

          self.pause();
          self.state = App.Console.State.HIDDEN;
          setTimeout(function() {
            self.element.addClass("hidden");
            setTimeout(function() {
              document.getElementsByTagName('body')[0].style.overflow = ''; // Allow scrolling.
              self.event('didHide');
            }, 300);
          }, 10);

        }
      },
      
      show: function() {
        var self = this;
        if (self.state != App.Console.State.VISIBLE) {

          window.tracker.track('console');
          self.event('willShow');
          self.state = App.Console.State.VISIBLE;
          self.element.removeClass("hidden");
          setTimeout(function() {
            self.navigation.addClass('hidden');
            self.run();
          }, 400);
          window.addEventListener("scroll", this.scrollBlocker);

          document.getElementsByTagName('body')[0].style.overflow = 'hidden'; // Prevent scrolling.

        }
      },
      
  });

})(jQuery);
