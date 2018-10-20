function scrollDown() {
  $('#msg_aera').animate({scrollTop: $('#msg_aera').prop("scrollHeight")}, 500);
}

function sendMessage(avatar, msg, who) {
  var timestamp = new Date().toISOString();
  var templateReceiver = ` \
  <div class="row msg_container base_receive"> \
    <div class="col-md-2 col-xs-2 avatar"> \
        <a href="https://www.freepik.com/free-vector/variety-of-animal-avatars_766787.htm" alt="_blank"> \
          <img title="Designed by Freepik" src="${avatar}" class=" img-responsive "> \
        </a> \
    </div> \
    <div class="col-md-10 col-xs-10"> \
        <div class="messages msg_receive"> \
            <p>${msg}</p> \
            <time datetime="${timestamp}">${who} • now</time> \
        </div> \
    </div> \
  </div>`;
  $("#msg_area").append(templateReceiver).animate({scrollTop: $("#msg_area")[0].scrollHeight}, 100);
}

function receiveMessage(avatar, msg, who) {
  var timestamp = new Date().toISOString();
  var templateSender = `\
  <div class="row msg_container base_sent"> \
    <div class="col-xs-10 col-md-10"> \
        <div class="messages msg_sent"> \
            <p>${msg}</p> \
            <time datetime="${timestamp}">${who} • now</time> \
        </div> \
    </div> \
    <div class="col-md-2 col-xs-2 avatar"> \
        <a href="https://www.freepik.com/free-vector/variety-of-animal-avatars_766787.htm" alt="_blank"> \
          <img title="Designed by Freepik" src="${avatar}" class=" img-responsive "> \
        </a> \
    </div> \
  </div>`;
  $("#msg_area").append(templateSender).animate({scrollTop: $("#msg_area")[0].scrollHeight}, 100);
}

function initMessage() {
  sendMessage('/images/gcp_logo.png', '您好，我是 Serverless 君！歡迎你在這裡寫下你對 Serverless 的想法或是任何的話！', 'Serverless 君');
}

function updateTime() {
  $("time").each((k, v) => {
    var date1 = new Date($(v).attr('datetime'));
    var delta = Math.abs(new Date() - date1);
    var minutes = Math.floor((delta/1000)/60);
    var separate = '•';
    var prefix = $(v).html().substring(0, $(v).html().indexOf(separate)+2);
    //console.log(date1, delta, minutes);
    if (minutes < 1) {
      $(v).html(prefix + ' 小於一分鐘前');
    } else if (minutes < 60) {
      $(v).html(prefix + minutes + ' 分鐘前');
    } else if (minutes < 1440) {
      $(v).html(prefix + Math.floor(minutes / 60) + ' 小時前');
    } else {
      $(v).html(prefix + Math.floor(minutes / 1440) + ' 天前');
    }
  });
}

function submit() {
  receiveMessage(userAvatar, $("#btn-input").val(), nameAvatar);
  $("#btn-input").val('');
}

var userAvatar = '';
var nameAvatar = '';

$(() => {
  var names = [
    'Bart',
    'Daria',
    'Ren & Stimpy',
    'Yogi Bear',
    'Pepe Le Pew',
    'Bobby Hill',
    'Spider-Man',
    'Stan Smith',
    'Abe Simpson',
    'Underdog',
    'Eric Cartman',
    'Marvin Martian',
    'Donald Duck',
    'Speed Racer',
    'Elmer Fudd'];

  var rnd = (new Date().getMilliseconds() % 15) + 1;
  userAvatar = `/images/avatar-${rnd}.png`;
  nameAvatar = names[rnd-1];

  initMessage();
  setInterval(() => { updateTime() }, 10000);
})

$(document).on('click', '.panel-heading span.icon_minim', function (e) {
    var $this = $(this);
    if (!$this.hasClass('panel-collapsed')) {
        $this.parents('.panel').find('.panel-body').slideUp();
        $this.addClass('panel-collapsed');
        $this.removeClass('glyphicon-minus').addClass('glyphicon-plus');
    } else {
        $this.parents('.panel').find('.panel-body').slideDown();
        $this.removeClass('panel-collapsed');
        $this.removeClass('glyphicon-plus').addClass('glyphicon-minus');
    }
});
$(document).on('focus', '.panel-footer input.chat_input', function (e) {
    var $this = $(this);
    if ($('#minim_chat_window').hasClass('panel-collapsed')) {
        $this.parents('.panel').find('.panel-body').slideDown();
        $('#minim_chat_window').removeClass('panel-collapsed');
        $('#minim_chat_window').removeClass('glyphicon-plus').addClass('glyphicon-minus');
    }
});

$(document).on('click', '.icon_close', function (e) {
    $( "#chat_window_1" ).remove();
});

$(document).on('click', '#btn-chat', function (e) {
  submit();
});

$(document).on('keypress', '#btn-input', function (e) {
  if (event.keyCode == 13) {
    event.preventDefault();
    if (0 != $("#btn-input").val().length) {
      submit();
    }
  }
});