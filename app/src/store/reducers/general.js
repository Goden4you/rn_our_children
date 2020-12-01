import {CHANGE_ORIENTATION} from '../types';

const initialState = {
  orientation: 'PORTRAIT',
};

export const generalReducers = (state = initialState, action) => {
  switch (action.type) {
    case CHANGE_ORIENTATION:
      return (state = {...state, orientation: action.orientation});
    default:
      return state;
  }
};
