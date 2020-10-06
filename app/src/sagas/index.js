import {all, fork} from 'redux-saga/effects';
import {fetchAlbumsData} from './albumsSaga';
import {watchCurrentAlbum, watchOpenedAlbum} from './currentAlbumSaga';

const rootSagas = function* root() {
  yield all([
    fork(fetchAlbumsData),
    fork(watchCurrentAlbum),
    fork(watchOpenedAlbum),
  ]);
};

export default rootSagas;
