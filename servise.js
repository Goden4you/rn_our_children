import TrackPlayer from 'react-native-track-player';

module.exports = async function () {
  TrackPlayer.addEventListener('remote-play', () => {
    console.log('remote-play');
    // TrackPlayer.play();
  });

  TrackPlayer.addEventListener('remote-pause', () => {
    console.log('remote-pause');
    // TrackPlayer.pause();
  });

  TrackPlayer.addEventListener('remote-next', () => {
    console.log('remote-next');
  });

  TrackPlayer.addEventListener('remote-previous', () => {
    console.log('remote-previous');
  });
};
