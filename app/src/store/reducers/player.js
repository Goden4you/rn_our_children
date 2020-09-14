import {LOAD_PLAYER} from '../types';

const initialState = {
  trackPlayerInit: false,
  albumImage: null,
  isPlaying: false,
  trackPlayerInit: false,
  trackId: 0,
  minimazed: true,
};

export const playerReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_PLAYER:
      return {...state};
    default:
      return state;
  }
};
