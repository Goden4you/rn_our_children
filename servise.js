import TrackPlayer from 'react-native-track-player';
import {
  handleNextTrack,
  handlePlayPause,
  handlePreviousTrack,
  handleTrackPosition,
} from './app/src/components/controlPanel/ControlsButtons';

module.exports = async function () {
  TrackPlayer.addEventListener('remote-play', () => {
    console.log('remote-play');
    handlePlayPause();
  });
  TrackPlayer.addEventListener('remote-pause', () => {
    console.log('remote-pause');
    handlePlayPause();
  });
  TrackPlayer.addEventListener('remote-previous', () => {
    console.log('remote-previos');
    handlePreviousTrack();
  });
  TrackPlayer.addEventListener('remote-next', () => {
    console.log('remote-next');
    handleNextTrack();
  });
  TrackPlayer.addEventListener('remote-seek', () => {
    console.log('remote-next');
    handleTrackPosition();
  });
};
