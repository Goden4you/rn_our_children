import {call, put, select, takeEvery} from 'redux-saga/effects';
import Api from '../api';
import {albumsIds, allTracksData} from '../store/selectors';
import {allSongsData, isAlbumDataLoading} from '../store/actions/albums';
import {takeAllSongsData, putAllSongsData} from '../utils/utils';
import {FETCH_ALL_SONGS_DATA} from '../store/types';

function* fetchAllSongs() {
  try {
    yield put(isAlbumDataLoading(true));
    const ids = yield select(albumsIds);

    let data = yield call(takeAllSongsData);
    let index = 0;

    if (!data) {
      data = [];
      for (let i = ids[0]; i <= ids[7]; i++) {
        const response = yield call(Api.getListOfAlbumsSongs, i);
        data[index] = response.data;
        index++;
      }

      yield call(putAllSongsData, data);
    } else {
      data = JSON.parse(data);
    }

    let needUpdate = yield select(allTracksData);
    needUpdate.toString() !== '' ? null : yield put(allSongsData(data));
    yield put(isAlbumDataLoading(false));
  } catch (_) {}
}

export function* watchListScreen() {
  yield takeEvery(FETCH_ALL_SONGS_DATA, fetchAllSongs);
}
