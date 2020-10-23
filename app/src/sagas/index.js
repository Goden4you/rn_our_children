import {all, fork} from 'redux-saga/effects';
import {fetchAlbumsData} from './albumsSaga';
import {watchListScreen} from './allSongsSaga';
import {watchCurrentAlbum, watchOpenedAlbum} from './currentAlbumSaga';

const rootSagas = function* root() {
  yield all([
    fork(fetchAlbumsData),
    fork(watchCurrentAlbum),
    fork(watchOpenedAlbum),
    fork(watchListScreen),
  ]);
};

export default rootSagas;
