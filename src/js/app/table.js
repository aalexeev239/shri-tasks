var flightTable = (function() {
  'use strict';

  var table,
      head,
      fixedHead,
      startPos = 0;

  // #js-flight
  // #js-flight-head
  // #js-flight-fixed
  var flightTable = {
    init: function(){
      table = document.getElementById('js-flight');
      head = document.getElementById('js-flight-head');
      fixedHead = document.getElementById('js-flight-fixed');
      startPos = table.getBoundingClientRect().top + document.body.scrollTop;

      window.addEventListener('resize', flightTable.recalcHead, false);
      window.addEventListener('scroll', flightTable.onWindowScroll, false);

      this.recalcHead();
    },
    recalcHead: function(){
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
    }
  };

  return flightTable;
}());
