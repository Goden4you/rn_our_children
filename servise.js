import TrackPlayer from 'react-native-track-player';
import {
  handleNextTrack,
  handlePreviousTrack,
} from './app/src/components/controlPanel/ControlsButtons';

module.exports = async function () {
  TrackPlayer.addEventListener('remote-play', () => {
    console.log('remote-play');
    TrackPlayer.play();
  });
  TrackPlayer.addEventListener('remote-pause', () => {
    console.log('remote-pause');
    TrackPlayer.pause();
  });
  TrackPlayer.addEventListener('remote-previous', () => {
    console.log('remote-previos');
    handlePreviousTrack();
  });
  TrackPlayer.addEventListener('remote-next', () => {
    console.log('remote-next');
    handleNextTrack();
  });
};
