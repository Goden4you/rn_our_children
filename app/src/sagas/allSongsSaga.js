import {call, put, select, takeEvery} from 'redux-saga/effects';
import Api from '../api';
import {allSongsCount, albumsIds} from '../store/selectors';
import {takeAllSongsData, putAllSongsData} from '../utils/utils';

function* fetchAllSongs(albumId) {
  try {
    const songsCount = yield select(allSongsCount);
    const ids = yield select(albumsIds);

    let data = yield call(takeAllSongsData);

    if (!data) {
      data = [];
      for (let i = ids[0]; i < ids[6]; i++) {
        const response = yield call(Api.getListOfAlbumsSongs, albumId);
        data += response.data;
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
    for (let i = 0; i < songsCount; i++) {
      tracksTitles[i] = data[i].title;
    }

    for (let i = 0; i < songsCount; i++) {
      tracksAuthors[i] = data[i].author;
    }

    for (let i = 0; i < songsCount; i++) {
      tracksDuration[i] = data[i].duration;
    }

    for (let i = 0; i < songsCount; i++) {
      tracksIds[i] = data[i].songFileId;
    }

    for (let i = 0; i < songsCount; i++) {
      tracksDurationMillis[i] = data[i].durationInMilliseconds;
    }
  } catch (e) {
    console.log(e);
  }
}
