import {
  LOAD_AUDIO,
  LOAD_PLAYER,
  UPDATE_TRACK_ID,
  INIT_PLAYER,
  TRACK_LOADING_ERROR,
  UPDATE_LOADED_SIZE,
  UPDATE_POSITION_INTERVAL,
  IS_TRACK_PLAYING,
  UPDATE_TIME,
  HANDLE_PREV_NEXT,
} from '../types';

export const loadPlayer = () => {
  return {
    type: LOAD_PLAYER,
    trackPlayerInit: false,
    isPlaying: false,
    trackId: 0,
    minimazed: true,
  };
};

export const loadTrack = (pressed, isPlaying) => {
  return {
    type: LOAD_AUDIO,
    audioLoaded: true,
    isPlaying: pressed ? true : isPlaying,
    trackPositionInterval: false,
    trackPlayerInit: true,
    formattedCurrentTime: '00:00',
  };
};

export const updateTrackId = (id) => {
  return {
    type: UPDATE_TRACK_ID,
    payload: id,
  };
};

export const updateLoadedSize = (size) => {
  return {
    type: UPDATE_LOADED_SIZE,
    payload: size,
  };
};

export const isTrackPlaying = (bool) => {
  return {
    type: IS_TRACK_PLAYING,
    isPlaying: bool,
  };
};

export const isPlayerInit = (params) => {
  return {
    type: INIT_PLAYER,
    payload: params,
  };
};

export const isMinimazed = (bool) => {
  return {
    type: INIT_PLAYER,
    minimazed: bool,
  };
};

export const trackLoadingError = () => {
  return {
    type: TRACK_LOADING_ERROR,
    isPlaying: false,
    trackPlayerInit: false,
  };
};

// TODO не факт что нужно
export const updatePositionInterval = (params) => {
  return {
    type: UPDATE_POSITION_INTERVAL,
    payload: params,
  };
};

export const updateTime = (current) => {
  return {
    type: UPDATE_TIME,
    currentTime: current,
  };
};

export const handlePrevNext = (trackId) => {
  return {
    type: HANDLE_PREV_NEXT,
    currentTime: 0,
    formattedCurrentTime: '00:00',
    trackId,
    pressed: false,
    audioLoaded: true,
    trackPositionInterval: true,
    isPlaying: true,
  };
};
