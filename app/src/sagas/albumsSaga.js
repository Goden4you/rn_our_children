import {call, put, select} from 'redux-saga/effects';
import * as albumsActions from '../store/actions/albums';
import {
  calcSongsDesc,
  putAlbumsData,
  putAlbumsPhotos,
  takeAlbumsData,
  takeAlbumsPhotos,
} from '../utils/utils';
import Api from '../api';
import {albumsIds, albumSongsCount} from '../store/selectors';

export async function* fetchAlbumsData() {
  try {
    let titles = [];
    let ids = [];
    let photos = [];
    let photosIds = [];
    let data = takeAlbumsData();

    if (data === []) {
      const response1 = yield call(Api.getListOfAllAlbumsData);
      data = response1.data;
      putAlbumsData(data);
    }
    for (let i = 0; i < 7; i++) {
      titles[i] = data[i].title;
      ids[i] = data[i].id;
    }
    const desc = calcSongsDesc(data);

    photos = takeAlbumsPhotos();

    if (photos === []) {
      var j = 0;
      for (let i = ids[0]; i <= ids[6]; i++) {
        const response2 = yield call(Api.getListOfAlbumsSongs, i);

        photosIds[j] = response2.data[0].artworkFileId;
        let photoData = yield call(Api.getListOfAllAlbumsPhotos, photosIds[j]);
        photos[j] = photoData.request.responseURL;
        j++;
      }
      putAlbumsPhotos(photos);
    }

    yield put(albumsActions.loadAlbums(photos, titles, desc, ids));

    fetchFirstLastTrack();
  } catch (e) {
    console.log(e);
  }
}

function* fetchFirstLastTrack() {
  const ids = yield select(albumsIds);
  const songsCount = yield select(albumSongsCount);

  const response1 = yield call(Api.getListOfAlbumsSongs, ids[0]);
  const firstTrack = response1.data[0].songFileId;

  const response2 = yield call(Api.getListOfAlbumsSongs, ids[6]);
  const lastTrack = response2.data[songsCount - 1].songFileId;

  yield put(albumsActions.firstLastTrackId(firstTrack, lastTrack));
  console.log('first last track put');
}
