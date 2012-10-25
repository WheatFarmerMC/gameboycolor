
(function($) {

  App = {};
  App.Controller = {};

  App.Log = function(message) {
    $("#debug").html(message)
  };

  App.Controller = function () {
      this.init();
  };

  jQuery.extend(App.Controller.prototype, {

    init: function () {
      var self = this;
/*       $("#screen-console").show(); */

      self.games = new App.Games();
      self.console = new App.Console({
        'willHide': function() {
          console.log('willHide');
          // self.games.update();
        },
        'didHide': function() {
          console.log('didHide');
        },
        'willShow': function() {
          console.log('willShow');
        },
        'didShow': function() {
          console.log('didShow');
        },
      });

/*
      self.games = new App.Controls.Button('#control-games', { 'touchUpInside': function() {
        $('#screen-console').animate({
          top: '-520'
        }, 300, function() {
        });
        
        // Populate the file list.
        // TODO We should probably do some sort of 'sync' thing using local storage.
        retrieveAllFiles(function(result) {
          var list = $('#list-games')
          
          var count = 0;
          var row = 0;
          var column = 0;
          
          var ROWS = 3;
          var WIDTH  = 120;
          var HEIGHT = 120;
          var MARGIN = 30;
          
          for (var i=0; i<result.length; i++) {

            row = count % ROWS;
            col = Math.floor(count / ROWS);
            
            var game = $('<div class="game">');
            game.html(result[i].title)
            game.css('top', (HEIGHT + MARGIN) * row);
            game.css('left', (WIDTH + MARGIN) * col);
            
            // Ugly way around capturing the callback parameter.
            // This might be more elegantly served if we had a javascript
            // element backing each list element.
            (function() {
              var m = result[i];
              game.click(function() {
                downloadFile(m, function(data) {
                  gb_Insert_Cartridge_Data(data, true);
                  gb_Run();
                  $('#screen-console').animate({
                    top: '0'
                  }, 300, function() {
                  });
                });
              });
            })();
            list.append(game);

            count += 1;
          }
        });
        
      }});
*/

/*       gb_Insert_Cartridge("kirby.gb", true); */

    }

  });

  // Create the application.
  $(document).ready(function() {
    window.app = new App.Controller();
  });

})(jQuery);
