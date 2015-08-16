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
      scrollBarW = 0,
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
      scrollBarW = getScrollBarWidth();


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
        };
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
      if (document.body.scrollHeight > document.body.clientHeight) {
        document.body.style.paddingRight = scrollBarW+'px';
      }
    },
    hidePopup: function() {
      document.documentElement.classList.remove('popup-shown');
      document.body.style.paddingRight = 0;
    }
  };

  function getScrollBarWidth() {
    var inner = document.createElement('p');
    inner.style.width = "100%";
    inner.style.height = "200px";

    var outer = document.createElement('div');
    outer.style.position = "absolute";
    outer.style.top = "0px";
    outer.style.left = "0px";
    outer.style.visibility = "hidden";
    outer.style.width = "200px";
    outer.style.height = "150px";
    outer.style.overflow = "hidden";
    outer.appendChild (inner);

    document.body.appendChild (outer);
    var w1 = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    var w2 = inner.offsetWidth;
    if (w1 == w2) w2 = outer.clientWidth;

    document.body.removeChild (outer);

    return (w1 - w2);
  };

  return flightTable;
}());

var player = (function() {

  var
    wrap,
    context,
    buffer,
    source,
    destination,
    analyser,
    canvas,
    canvasWidth,
    canvasHeight,
    canvasCtx,
    drawVisual,
    bufferLength,
    dataArray,
    trackList,
    playBtn,
    stopBtn,
    fileDropzone,
    fileUpload;



  var player = {
    init: function(){
      if (!this.setup()) return;
    },
    setup: function() {
      try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
      }
      catch(e) {
        console.log('Opps.. Your browser do not support audio API');
        return false;
      }

      wrap = document.getElementById('js-player');
      trackList = document.getElementById('js-player-list');
      playBtn = document.getElementById('js-player-play');
      stopBtn = document.getElementById('js-player-stop');
      fileUpload = document.getElementById('js-player-upload');
      fileDropzone = document.getElementById('js-player-dropzone');
      canvas = document.getElementById("js-player-canvas");
      canvasCtx = canvas.getContext('2d');
      canvasWidth = canvas.width;
      canvasHeight = canvas.height;

      wrap.classList.add('disabled');

      fileUpload.addEventListener('change', function(ev) {
        player.handleFiles(ev.target.files);
      }, false);

      fileDropzone.addEventListener('dragover', function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        ev.dataTransfer.dropEffect = 'copy';
      }, false);

      fileDropzone.addEventListener('drop', function(ev){
        ev.stopPropagation();
        ev.preventDefault();
        player.handleFiles(ev.dataTransfer.files);
      }, false);


      playBtn.addEventListener('click', function(ev) {
        ev.preventDefault();
        var cur = trackList.querySelector('.active');

        if (cur) {
          player.playSound(player.tracks[Array.prototype.indexOf.call(trackList.children, cur)])
        } else {
          if (player.tracks.length) player.playSound(player.tracks[0]);
        }
         return false;

      }, false);

      stopBtn.addEventListener('click', function(ev) {
        ev.preventDefault();
        player.stop();
      }, false);

      return true;
    },
    handleFiles: function(files) {
      for (var i = 0, f; f=files[i]; i++) {
        if (!(new Audio().canPlayType(f.type))) {
          console.log('Error: wrong file format');
          continue;
        }

        var reader = new FileReader();

        reader.onload = (function(theFile) {
          return function(e){
            player.addTrack(e,theFile.name, theFile.size)
          }
        })(f);

        reader.readAsArrayBuffer(f);
      };
    },
    addTrack: function(e, name, size) {
      var track = {},
          result  = e.target.result,
          li = document.createElement('li'),
          meta = player.getMetadata(result),
          content = '',
          index;

      // setup track
      track.name = name;
      track.metadata = meta;
      track.elem = li;
      track.size = size;

      context.decodeAudioData(result,function(decodedData){
        track.buffer = decodedData;
      });



      if (meta) {
        content = meta.title;
        if (meta.artist) content += ' - ' + meta.artist + ' ('+ name +')';
      } else {
        content = name;
      }

      // check if track was uploaded earlier
      for (var i = player.tracks.length - 1; i >= 0; i--) {
        if (name !== player.tracks[i].name) continue;
        if (size === player.tracks[i].size) return;
      };

      // adding to tracklist
      li.textContent = content;
      trackList.appendChild(li);

      index = player.tracks.push(track) - 1;

      li.addEventListener('click', function(e) {
        player.playSound(player.tracks[index]);
      });

      wrap.classList.remove('disabled');
    },
    getMetadata: function(obj) {
      var res = { title: '', artist: ''},
          formats = ['id3v2','id3v1', 'ogg'];
      if (!AudioMetadata) return false;

      for (var i = formats.length - 1; i >= 0; i--) {
        var format = AudioMetadata[formats[i]](obj);

        if (format && format.hasOwnProperty('title') && format['title'].length) {
          res.title = format['title'];

          if (format.hasOwnProperty('artist') && format['artist'].length) {
            res.artist = format['artist'];
          }

          return res;
        }
      };
      return false;
    },
    tracks: [],
    playSound: function(track) {
      if (source) source.stop(0);

      var active = trackList.querySelector('.active');
      active && active.classList.remove('active');

      track.elem.classList.add('active');

      source = context.createBufferSource();

      source.buffer = track.buffer;

      destination = context.destination;

      analyser = context.createAnalyser();
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      analyser.smoothingTimeConstant = 0.85;
      analyser.fftSize = 2048;


      bufferLength = analyser.fftSize;
      dataArray = new Uint8Array(bufferLength);

      canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

      this.canvasDraw();

      source.connect(analyser);
      analyser.connect(destination);
      source.start(0);
    },
    stop: function() {
      if (source) source.stop(0);
    },
    canvasDraw: function() {
      drawVisual = requestAnimationFrame(player.canvasDraw);

      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = 'rgb(250, 250, 250)';
      canvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

      canvasCtx.beginPath();

      var sliceWidth = canvasWidth * 1.0 / bufferLength;
      var x = 0;

      for(var i = 0; i < bufferLength; i++) {

        var v = dataArray[i] / 128.0;
        var y = v * canvasHeight/2;

        if(i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height/2);
      canvasCtx.stroke();
    }
  };

  return player;
}());

// Андрей Алексеев [AA]
// alexeev.andrey.a@gmail.com
document.addEventListener("DOMContentLoaded", function(event) {

  document.getElementById('js-flight') && flightTable.init();

  document.getElementById('js-player') && player.init();

});
