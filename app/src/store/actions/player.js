import {LOAD_AUDIO, LOAD_PLAYER, UPDATE_TRACK_ID} from '../types';

export const loadPlayer = () => {
  const params = {
    trackPlayerInit: false,
    albumImage: null,
    isPlaying: false,
    trackId: 0,
    minimazed: true,
  };
  return {
    type: LOAD_PLAYER,
    payload: params,
  };
};

export const loadAudio = (pressed) => {
  const params = {
    audioLoaded: true,
    isPlaying: pressed ? true : isPlaying,
    trackPositionInterval: false,
    isQueueEnded: false,
    needUpdate2: true,
    trackPlayerInit: true,
  };
  return {
    type: LOAD_AUDIO,
    payload: params,
  };
};

export const updateTrackId = (id) => {
  return {
    type: UPDATE_TRACK_ID,
    payload: id,
  };
};
