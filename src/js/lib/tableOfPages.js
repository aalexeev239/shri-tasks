/*!
 * Table Of Pages Plugin v0.0.1
 *
 * https://github.com/aalexeev239/tableOfPages
 *
 * Copyright (c) 2015 Andrey Alexeev
 * Released under the MIT license
 */

var tableOfPages = (function() {
  'use strict';

  var tableOfPages = {
    defaults: {
      "index": "Главная"
    },
    init: function(){
      var body = document.body,
          head = document.head,
          style = document.createElement('style'),
          popup = document.createElement('div'),
          close = document.createElement('span'),
          table = document.createElement('table'),
          pages = this.defaults;

      if (typeof arguments[0] === "object") pages = arguments[0];

      // close btn
      close.textContent = '\u00D7';
      close.addEventListener('click', function(ev) {
        ev.preventDefault();
        body.removeChild(popup);
      });


      // generate table
      for (var key in pages) {
        if (!pages.hasOwnProperty(key)) continue;
        table.appendChild(insertToTable(key, pages[key]));
      }

      // add styles
      style.type = 'text/css';
      style.appendChild(document.createTextNode(this.css));
      head.appendChild(style);

      // add popup
      popup.setAttribute('id', 'tableOfPages');
      popup.appendChild(close);
      popup.appendChild(table);
      body.appendChild(popup);
    },
    css: "#tableOfPages{position:fixed;bottom:20px;right:20px;z-index:9999;background:#fff;border:1px solid #878787;box-shadow:5px 5px 0 rgba(154,154,154,.3);padding:20px;width:420px;font-family:sans-serif;font-size:12px;line-height:1.2}#tableOfPages>span{position:absolute;top:0;right:8px;font-size:20px;cursor:pointer}#tableOfPages>table{width:100%;margin:0;}#tableOfPages>table td{vertical-align:top;border:none;border-bottom:1px dashed #eaeaea;padding:3px 10px 3px 0}"
  };

  function insertToTable(key, value) {
    var row = document.createElement('tr'),
        cell1 = document.createElement('td'),
        cell2 = document.createElement('td'),
        link = document.createElement('a');
    cell1.textContent = value;
    link.textContent = key + '.html';
    link.setAttribute('href', key + '.html');
    // link.setAttribute('target', '_blank');
    cell2.appendChild(link);

    row.appendChild(cell1);
    row.appendChild(cell2);

    return row;
  }

  return tableOfPages;
}());
