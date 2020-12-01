import {call, put, select, takeEvery} from 'redux-saga/effects';
import * as albumsActions from '../store/actions/albums';
import {updateAlbumIdAndDesc} from '../store/actions/player';
import {
  albumSongsCount,
  openedAlbumId,
  isAlbumChanged,
  isCalledFromPlayer,
} from '../store/selectors';
import Api from '../api';
import {ALBUM_CHANGED, OPEN_ALBUM_SCREEN} from '../store/types';
import {putCurAlbumData, takeCurAlbumData} from '../utils/utils';

function* fetchCurrentAlbumSaga(currentAlbum) {
  try {
    const needNewLoading = yield select(isCalledFromPlayer);
    if (!needNewLoading) {
      const albumChanged = yield select(isAlbumChanged);
      if (!currentAlbum) {
        yield put(albumsActions.isAlbumDataLoading(true));
      }
      console.log('fetch cur album called');

      const songsCount = yield select(albumSongsCount);
      const albumId = yield select(openedAlbumId);

      let data = yield call(takeCurAlbumData, albumId);

      if (!data) {
        const response = yield call(Api.getListOfAlbumsSongs, albumId);
        data = response.data;
        yield call(putCurAlbumData, [data, albumId]);
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
        tracksAuthors[i] = data[i].author;
        tracksDuration[i] = data[i].duration;
        tracksIds[i] = data[i].songFileId;
        tracksDurationMillis[i] = data[i].durationInMilliseconds;
      }
      let firstTrackId = data[0].songFileId;
      let lastTrackId = data[songsCount - 1].songFileId;

      if (!currentAlbum) {
        yield put(
          albumsActions.openAlbum(
            tracksTitles,
            tracksAuthors,
            tracksDuration,
            tracksIds,
            tracksDurationMillis,
            firstTrackId,
            lastTrackId,
          ),
        );
      }
      if (currentAlbum && albumChanged) {
        yield put(
          albumsActions.toggleAlbum(
            tracksTitles,
            tracksAuthors,
            tracksDuration,
            tracksIds,
            tracksDurationMillis,
            firstTrackId,
            lastTrackId,
          ),
        );
        yield put(updateAlbumIdAndDesc(albumId, songsCount));
      }
      yield put(albumsActions.isAlbumDataLoading(false));
    }
  } catch (e) {
    console.log(e);
  }
}

export function* watchCurrentAlbum() {
  yield takeEvery(ALBUM_CHANGED, fetchCurrentAlbumSaga, true);
}

export function* watchOpenedAlbum() {
  yield takeEvery(OPEN_ALBUM_SCREEN, fetchCurrentAlbumSaga, false);
}
