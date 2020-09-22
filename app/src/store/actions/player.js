import {
  LOAD_AUDIO,
  LOAD_PLAYER,
  UPDATE_TRACK_ID,
  INIT_PLAYER,
  TRACK_LOADING_ERROR,
  UPDATE_STORAGE,
} from '../types';

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

export const loadTrack = (pressed, isPlaying) => {
  const params = {
    audioLoaded: true,
    isPlaying: pressed ? true : isPlaying,
    trackPositionInterval: false,
    isQueueEnded: false,
    needUpdate2: true,
    trackPlayerInit: true,
    formattedCurrentTime: '00:00',
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

export const updateStorage = (params) => {
  return {
    type: UPDATE_STORAGE,
    payload: params,
  };
};

export const initPlayer = () => {
  const params = {
    trackPlayerInit: true,
  };
  return {
    type: INIT_PLAYER,
    payload: params,
  };
};

export const trackLoadingError = () => {
  const params = {
    isPlaying: false,
    trackPlayerInit: false,
  };
  return {
    type: TRACK_LOADING_ERROR,
    payload: params,
  };
};
