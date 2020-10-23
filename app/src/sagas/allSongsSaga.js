import {call, put, select, takeEvery} from 'redux-saga/effects';
import Api from '../api';
import {albumsIds, allTracksIds} from '../store/selectors';
import {allSongsData} from '../store/actions/albums';
import {takeAllSongsData, putAllSongsData} from '../utils/utils';
import {ALL_SONGS_DATA} from '../store/types';

function* fetchAllSongs() {
  try {
    console.log('fetchAllSongs called');
    const ids = yield select(albumsIds);

    let data = yield call(takeAllSongsData);
    let index = 0;
    const albumsCount = 7;

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

    let tracksTitles = [];
    let tracksAuthors = [];
    let tracksDuration = [];
    let tracksIds = [];
    let tracksDurationMillis = [];

    let j = 0;
    for (let i = 0; i < albumsCount; i++) {
      data[i].forEach((trackData) => {
        tracksTitles[j] = trackData.title;
        tracksAuthors[j] = trackData.author;
        tracksDuration[j] = trackData.duration;
        tracksIds[j] = trackData.songFileId;
        tracksDurationMillis[j] = trackData.durationInMilliseconds;
        j++;
      });
    }
    let needUpdate = yield select(allTracksIds);
    needUpdate
      ? null
      : yield put(
          allSongsData(
            tracksTitles,
            tracksAuthors,
            tracksIds,
            tracksDuration,
            tracksDurationMillis,
          ),
        );
  } catch (e) {
    console.log(e);
  }
}

export function* watchListScreen() {
  yield takeEvery(ALL_SONGS_DATA, fetchAllSongs);
}
