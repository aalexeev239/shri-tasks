var player = (function() {

  var context, buffer, source, destination;


  var player = {
    init: function(){
      try {
        context = new window.AudioContext();
      }
      catch(e) {
        console.log('Opps.. Your browser do not support audio API');
        return;
      }
      // функция для подгрузки файла в буфер

      var playBtn = document.getElementById('js-player-play');
      var stopBtn = document.getElementById('js-player-stop');

      playBtn.addEventListener('click', function(ev) {
        ev.preventDefault();
        player.loadSoundFile('files/example.mp3', player.play);
      });

      stopBtn.addEventListener('click', function(ev) {
        ev.preventDefault();
        console.log('click');
        player.stop();
      });
    },
    loadSoundFile: function(url, fn){
      // делаем XMLHttpRequest (AJAX) на сервер
      var xhr = new XMLHttpRequest();

      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer'; // важно
      xhr.onload = function(e) {
        // декодируем бинарный ответ
        context.decodeAudioData(this.response,
        function(decodedArrayBuffer) {
          // получаем декодированный буфер
          buffer = decodedArrayBuffer;
          console.log('111');
          console.log(fn);
          fn();
        },
        function(e) {
          console.log('Error decoding file', e);
        });
      };
      xhr.send();
    },
    play: function() {
      console.log('open');
      // создаем источник
      if (source) {
        source.stop(0);
        return;
      }
      source = context.createBufferSource();

      // подключаем буфер к источнику
      source.buffer = buffer;

      // дефолтный получатель звука
      destination = context.destination;
      // подключаем источник к получателю
      source.connect(destination);
      // воспроизводим
      source.start(0);
    },
    stop: function() {
      if (source) source.stop(0);
    }
  };

  return player;
}());
