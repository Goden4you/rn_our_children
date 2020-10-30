import {call, put, select, takeEvery} from 'redux-saga/effects';
import Api from '../api';
import {albumsIds, allTracksData} from '../store/selectors';
import {allSongsData} from '../store/actions/albums';
import {takeAllSongsData, putAllSongsData} from '../utils/utils';
import {ALL_SONGS_DATA} from '../store/types';

function* fetchAllSongs() {
  try {
    console.log('fetchAllSongs called');
    const ids = yield select(albumsIds);

    let data = yield call(takeAllSongsData);
    let index = 0;

    if (!data) {
      data = [];
      for (let i = ids[0]; i <= ids[6]; i++) {
        const response = yield call(Api.getListOfAlbumsSongs, i);
        data[index] = response.data;
        index++;
      }

      yield call(putAllSongsData, data);
    } else {
      data = JSON.parse(data);
    }

    let needUpdate = yield select(allTracksData);
    needUpdate ? null : yield put(allSongsData(data));
  } catch (e) {
    console.log(e);
  }
}

export function* watchListScreen() {
  yield takeEvery(ALL_SONGS_DATA, fetchAllSongs);
}
