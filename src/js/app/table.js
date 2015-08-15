var table = (function() {
  'use strict';

  var $table,
      $head,
      $fixedHead,
      startPos = 0;

  // #js-table
  // #js-table-head
  var table = {
    init: function(){
      $table = $('#js-table');
      $head = $('#js-table-head');
      $fixedHead = $('#js-table-fixed');
      startPos = $table.offset().top;

      $(window).on('resize', table.recalcHead)
      this.recalcHead();

      $(window).on('scroll', table.onWindowScroll)
    },
    recalcHead: function(){
      $head.children().each(function(index, el) {
        $fixedHead.children().eq(index).css('width', $(el).outerWidth())
      });
    },
    onWindowScroll: function(ev){
      var curS = $(window).scrollTop();
      if ((curS >= startPos)) {
        $fixedHead.addClass('active')
      } else if ($fixedHead.hasClass('active')) {
        $fixedHead.removeClass('active')
      }
    }
  };

  return table;
}());
