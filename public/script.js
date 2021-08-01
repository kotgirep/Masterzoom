const videoGrid = document.getElementById('vgrid');
const socket = io('/');
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443',
});
let vstream;
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    vstream = stream;
    videoStream(myVideo, stream);
    myPeer.on('callip', (callip) => {
      callip.answer(stream);
      const video = document.createElement('video');
      callip.on('stream', (userVideoStream) => {
        videoStream(video, userVideoStream);
      });
    });

    socket.on('user-connected', (userid) => {
      connectToNewUser(userid, stream);
    });
    // input value
    let txtip = $('input');
    // when press enter send message
    $('html').keydown(function (e) {
      if (e.which == 13 && txtip.val().length !== 0) {
        socket.emit('message', txtip.val());
        txtip.val('');
      }
    });
    socket.on('createMessage', (message) => {
      $('ul').append(`<li class="message"><b>user</b><br/>${message}</li>`);
      scrollBottom();
    });
  });

socket.on('user-disconnected', (userid) => {
  if (peers[userid]) peers[userid].close();
});

myPeer.on('open', (id) => {
  //as we are joining room using emit method
  socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userid, stream) {
  const callip = myPeer.callip(userid, stream);
  const video = document.createElement('video');
  callip.on('stream', (userVideoStream) => {
    videoStream(video, userVideoStream);
  });
  callip.on('close', () => {
    video.remove();
  });

  peers[userid] = callip;
}

function videoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}

const scrollBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop('scrollHeight'));
};

const muteUnmute = () => {
  const enabled = vstream.getAudioTracks()[0].enabled;
  if (enabled) {
    vstream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    vstream.getAudioTracks()[0].enabled = true;
  }
};

const playStop = () => {
  console.log('object');
  let enabled = vstream.getVideoTracks()[0].enabled;
  if (enabled) {
    vstream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    vstream.getVideoTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector('.main__mute_button').innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector('.main__mute_button').innerHTML = html;
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector('.main__video_button').innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector('.main__video_button').innerHTML = html;
};
