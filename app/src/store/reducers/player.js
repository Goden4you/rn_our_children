import {
  UPDATE_TRACK_ID,
  LOAD_AUDIO,
  TRACK_LOADING_ERROR,
  UPDATE_LOADED_SIZE,
  IS_TRACK_PLAYING,
  IS_MINIMAZED,
  UPDATE_TIME,
  HANDLE_PREV_NEXT,
  QUEUE_ENDED,
  UPDATE_PRESSED,
  MOVE_TO_NEXT_ALBUM,
} from '../types';

const initialState = {
  trackPlayerInit: false,
  isPlaying: false,
  trackId: null,
  minimazed: true,
  audioLoaded: false,
  formattedCurrentTime: '00:00',
  currentTime: 0,
  loadedSize: 0,
  pressed: false,
  queueEnded: false,
  moveToNextAlbum: false,
};

export const playerReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_AUDIO:
      return (state = {
        ...state,
        audioLoaded: action.audioLoaded,
        isPlaying: action.isPlaying,
        trackPlayerInit: action.trackPlayerInit,
      });
    case UPDATE_TRACK_ID:
      return (state = {...state, trackId: action.payload});
    case TRACK_LOADING_ERROR:
      return (state = {
        ...state,
        isPlaying: action.isPlaying,
        trackPlayerInit: action.trackPlayerInit,
      });
    case UPDATE_LOADED_SIZE:
      return (state = {...state, loadedSize: action.size});
    case IS_TRACK_PLAYING:
      return (state = {...state, isPlaying: action.isPlaying});
    case IS_MINIMAZED:
      return (state = {...state, minimazed: action.minimazed});
    case UPDATE_TIME:
      return (state = {...state, currentTime: action.currentTime});
    case HANDLE_PREV_NEXT:
      return (state = {
        ...state,
        currentTime: action.currentTime,
        formattedCurrentTime: action.formattedCurrentTime,
        trackId: action.trackId,
        pressed: action.pressed,
        audioLoaded: action.audioLoaded,
        isPlaying: action.isPlaying,
      });
    case QUEUE_ENDED:
      return (state = {...state, queueEnded: action.queueEnded});
    case UPDATE_PRESSED:
      return (state = {...state, pressed: action.pressed});
    case MOVE_TO_NEXT_ALBUM:
      return (state = {...state, moveToNextAlbum: action.payload});
    default:
      return state;
  }
};
