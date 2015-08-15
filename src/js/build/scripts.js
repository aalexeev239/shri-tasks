var flightTable = (function() {
  'use strict';

  var table,
      head,
      fixedHead,
      rows = [],
      popup,
      popupCells = [],
      popupClose,
      externalLinks = [],
      startPos = 0;

  // #js-flight
  // #js-flight-head
  // #js-flight-fixed
  // .js-flight-row
  // #js-flight-popup
  // #js-flight-close
  var flightTable = {
    init: function(){
      var popupRows,
          len;

      table = document.getElementById('js-flight');
      head = document.getElementById('js-flight-head');
      fixedHead = document.getElementById('js-flight-fixed');
      startPos = table.getBoundingClientRect().top + document.body.scrollTop;
      rows = document.querySelectorAll('.js-flight-row');
      popup = document.getElementById('js-flight-popup');
      popupClose = document.getElementById('js-flight-close');
      externalLinks = document.querySelectorAll('.js-flight-external-link');

      // setup popup cells
      popupRows = popup.querySelectorAll('tr');
      len = popupRows.length;

      for (var i = 0; i < len; i++) {
        popupCells.push(popupRows[i].children[1]);
      };

      // setup scroll events
      this.setupScroll();

      // setup popup events
      this.setupPopup();
    },
    setupScroll: function() {
      window.addEventListener('resize', flightTable.recalcHead, false);
      window.addEventListener('scroll', flightTable.onWindowScroll, false);
      this.recalcHead();
    },
    recalcHead: function() {
      var hCells = head.children,
          fCells = fixedHead.children;

      for (var i = hCells.length - 1; i >= 0; i--) {
        fCells[i].style.width = hCells[i].offsetWidth + 'px';
      };
    },
    onWindowScroll: function(ev){
      var curS = window.pageYOffset;

      if ((curS >= startPos)) {
        fixedHead.classList.add('active');
      } else {
        fixedHead.classList.remove('active');
      }
    },
    fillPopup: function(row){
      if (!row) return false;

      var rowCells = row.children;

      for (var i = rowCells.length - 1; i >= 0; i--) {
        popupCells[i].innerHTML = rowCells[i].innerHTML;
      };

      this.showPopup();
    },
    setupPopup: function() {
      popupClose.addEventListener('click', function(ev) {
        flightTable.hidePopup();
      });

      // prevent hiding popup when clicked inside of it
      popup.addEventListener('click', function(ev) {
        ev.stopPropagation();
      });

      // hide otherwise
      document.addEventListener('click', function(ev) {
        flightTable.hidePopup();
      });

      // esc click
      document.addEventListener('keydown', function(ev) {
        var code = ev.keyCode ? ev.keyCode : ev.which;
        if (code == 27) flightTable.hidePopup();
      });

      // show popup on row click
      for (var i = rows.length - 1; i >= 0; i--) {
        rows[i].addEventListener('click', rowClick(rows[i]));
      };

      function rowClick(row) {
        return function(ev){
          ev.stopPropagation();
          flightTable.fillPopup(row);
        }
      }

      // dont show popup when external link clicked
      for (var i = externalLinks.length - 1; i >= 0; i--) {
        externalLinks[i].addEventListener('click', function(ev){
          ev.stopPropagation();
        });
      };
    },

    showPopup: function() {
      document.documentElement.classList.add('popup-shown');
    },
    hidePopup: function() {
      document.documentElement.classList.remove('popup-shown');
    }
  };

  return flightTable;
}());

// Андрей Алексеев [AA]
// alexeev.andrey.a@gmail.com
document.addEventListener("DOMContentLoaded", function(event) {

  document.querySelector('#js-flight') && flightTable.init();

});
