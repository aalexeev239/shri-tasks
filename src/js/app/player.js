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
