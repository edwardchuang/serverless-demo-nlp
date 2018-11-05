/* 
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. 
*/
var timestamp = -1;

var translations = {
    'zh-TW': {
        'robosname': 'Serverless 君',
        'placeholder': '在這裡寫下你想說的話 ...',
        'submit': '送出',
        'greetings': '您好，我是 Serverless 君！歡迎你在這裡寫下你對 Serverless 的想法或是任何的話！',
        'txtPardon': '我不太清楚你說的是什麼意思耶？可以請你再說一次嗎？',
        'txtResult': '根據你的文字，我決定給你一個 ',
        'txt1Min': ' 小於一分鐘前',
        'txtMins': ' 分鐘前',
        'txtHours': ' 小時前',
        'txtDays': ' 天前'
    },
    'en': {
        'robosname': 'Serverless Guy',
        'placeholder': 'Write anything here ...',
        'submit': 'Submit',
        'greetings': 'Howdy! I am Serverless Guy, please input anything you want to say blow!',
        'txtPardon': 'Pardon me, say again please?',
        'txtResult': 'According to your words, there\'s a face: ',
        'txt1Min': ' Less than a minute',
        'txtMins': ' Minute(s) ago',
        'txtHours': ' Hour(s) ago',
        'txtDays': ' Day(s) ago'
    }
};

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
  sendMessage('/images/gcp_logo.png', trans.greetings, trans.robosname);
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
      $(v).html(prefix + trans.txt1Min);
    } else if (minutes < 60) {
      $(v).html(prefix + minutes + trans.txtMins);
    } else if (minutes < 1440) {
      $(v).html(prefix + Math.floor(minutes / 60) + trans.txtHours);
    } else {
      $(v).html(prefix + Math.floor(minutes / 1440) + trans.txtDays);
    }
  });
}

function submit() {
  var txt = $("#btn-input").val();
  receiveMessage(userAvatar, txt, nameAvatar);
  $("#btn-input").val('');
  $.ajax({
      url: '/processNLP',
      type: 'POST',
      data: {'content': txt, 'language': 'zh-Hant'},
      success: (response) => {
        var face = '';
        if (response.score <= -0.25) {
            face = '<i class="em-svg em-angry"></i>';
        } else if (response.score <= 0.25) {
            face = '<i class="em-svg em-thinking_face"></i>';
        } else {
            face = '<i class="em-svg em-smile"></i>';
        }
        sendMessage('/images/gcp_logo.png', `${trans.txtResult} ${face}`, trans.robosname);
      },
      error: (err) => {
        sendMessage('/images/gcp_logo.png', trans.txtPardon, trans.robosname);
      }
  })
}

var userAvatar = '';
var nameAvatar = '';
var trans = null;

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
  
  if (undefined === (trans = translations[navigator.language])) {
    trans = translations['en'];
  }

  $("#btn-chat").text(trans.submit);
  $("#btn-input").attr('placeholder', trans.placeholder);
  $("#chatWindowTitle").html(`Chat - ${trans.robosname}`);

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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawSentimentalWall(type) {
    var bgHeight = Math.floor($(window).height() * 0.8);
    var bgWidth = $(window).width();
    var X = getRandomInt(80, bgWidth-80); //Math.floor(Math.random() * bgWidth);
    var Y = getRandomInt(80, bgHeight-80); //Math.floor(Math.random() * bgHeight);

    var face = $(document.createElement('div'))
    face.addClass('em-svg').addClass(`${type}`);
    face.css({top: Y, left: X, position: 'absolute'})

    $("#background").append(face);
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        var db = firebase.firestore();
        db.settings({timestampsInSnapshots: true});
        db.collection("sentimentwall").onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((doc) => {
                if (doc.type == 'added') {
                    var face = '';
                    if (doc.doc.data().score <= -0.25) {
                        face = 'em-angry';
                    } else if (doc.doc.data().score <= 0.25) {
                        face = 'em-thinking_face';
                    } else {
                        face = 'em-smile';
                    }
                    drawSentimentalWall(face);
                }
            })
        }, function(error) {
        });
    } catch (e) {
        console.log(e);
    }
});
