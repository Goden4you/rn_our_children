import {
  LOAD_AUDIO,
  UPDATE_TRACK_ID,
  INIT_PLAYER,
  TRACK_LOADING_ERROR,
  UPDATE_LOADED_SIZE,
  IS_TRACK_PLAYING,
  UPDATE_TIME,
  HANDLE_PREV_NEXT,
  IS_MINIMAZED,
  QUEUE_ENDED,
  UPDATE_PRESSED,
  MOVE_TO_NEXT_ALBUM,
  UPDATE_ALBUM_ID_AND_DESC,
  HIDE_PLAYER,
  UPDATE_AUDIO_LOADED,
} from '../types';

export const loadTrack = (pressed, isPlaying) => {
  return {
    type: LOAD_AUDIO,
    audioLoaded: true,
    isPlaying: pressed ? true : isPlaying,
    trackPlayerInit: true,
  };
};

export const updateAlbumIdAndDesc = (albumId, albumDesc) => {
  return {
    type: UPDATE_ALBUM_ID_AND_DESC,
    albumId,
    albumDesc,
  };
};

export const updateTrackId = (id) => {
  return {
    type: UPDATE_TRACK_ID,
    payload: id,
  };
};

export const updateLoadedSize = (size, pressed) => {
  let deleteMusicPressed = false;
  if (pressed === true) {
    deleteMusicPressed = true;
  }
  return {
    type: UPDATE_LOADED_SIZE,
    size,
    deleteMusicPressed,
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
    type: IS_MINIMAZED,
    minimazed: bool,
  };
};

export const hidePlayer = (bool) => {
  return {
    type: HIDE_PLAYER,
    hidden: bool,
  };
};

export const trackLoadingError = () => {
  return {
    type: TRACK_LOADING_ERROR,
    isPlaying: false,
    trackPlayerInit: false,
  };
};

export const updatePressed = (bool) => {
  return {
    type: UPDATE_PRESSED,
    pressed: bool,
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
    audioLoaded: false,
    isPlaying: true,
  };
};

export const updateAudioLoaded = () => {
  return {
    type: UPDATE_AUDIO_LOADED,
    audioLoaded: true,
  };
};

export const isQueueEnded = (bool) => {
  return {
    type: QUEUE_ENDED,
    queueEnded: bool,
  };
};

export const needMoveToNextAlbum = (bool) => {
  return {
    type: MOVE_TO_NEXT_ALBUM,
    payload: bool,
  };
};
