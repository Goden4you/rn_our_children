import {CHANGE_ORIENTATION} from '../types';

export const orientationChanged = (orientation) => {
  return {
    type: CHANGE_ORIENTATION,
    orientation,
  };
};
