import {fromJS} from 'immutable';
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
} from '../types';

const initialState = fromJS({
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
});

export const playerReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_AUDIO:
      return state
        .set('audioLoaded', action.audioLoaded)
        .set('isPlaying', action.isPlaying)
        .set('trackPlayerInit', action.trackPlayerInit);
    case UPDATE_TRACK_ID:
      return state.set('trackId', action.payload);
    case TRACK_LOADING_ERROR:
      return state
        .set('isPlaying', action.isPlaying)
        .set('trackPlayerInit', action.trackPlayerInit);
    case UPDATE_LOADED_SIZE:
      return state.set('loadedSize', action.size);
    case IS_TRACK_PLAYING:
      return state.set('isPlaying', action.isPlaying);
    case IS_MINIMAZED:
      return state.set('minimazed', action.minimazed);
    case UPDATE_TIME:
      return state.set('currentTime', action.currentTime);
    case HANDLE_PREV_NEXT:
      return state
        .set('currentTime', action.currentTime)
        .set('formattedCurrentTime', action.formattedCurrentTime)
        .set('trackId', action.trackId)
        .set('pressed', action.pressed)
        .set('audioLoaded', action.audioLoaded)
        .set('isPlaying', action.isPlaying);
    case QUEUE_ENDED:
      return state.set('queueEnded', action.queueEnded);
    case UPDATE_PRESSED:
      return state.set('pressed', action.pressed);
    default:
      return state;
  }
};
