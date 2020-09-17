import {
  LOAD_PLAYER,
  UPDATE_TRACK_ID,
  LOAD_AUDIO,
  UPDATE_STORAGE,
} from '../types';

const initialState = {};

export const playerReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_PLAYER:
      return {...state, state: action.payload};
    case LOAD_AUDIO:
      return {...state, state: action.payload};
    case UPDATE_TRACK_ID:
      return {...state, state: action.payload};
    case UPDATE_STORAGE:
      return {...state, state: action.payload};
    default:
      return state;
  }
};
