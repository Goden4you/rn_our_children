import {call, put} from 'redux-saga/effects';
import * as albumsActions from '../store/actions/albums';
import {calcSongsDesc} from '../utils/utils';
import Api from '../api';

export function* fetchAlbumsData() {
  try {
    const response1 = yield call(Api.getListOfAllAlbumsData);
    let titles = [];
    let ids = [];
    var j = 0;
    let photos = [];
    let photosIds = [];
    for (let i = 0; i < 7; i++) {
      titles[i] = response1.data[i].title;
    }
    for (let i = 0; i < 7; i++) {
      ids[i] = response1.data[i].id;
    }
    const desc = calcSongsDesc(response1);

    for (let i = 30184; i <= 30190; i++) {
      const response2 = yield call(Api.getListOfAlbumsSongs, i);

      photosIds[j] = response2.data[0].artworkFileId;
      let data;
      data = yield call(Api.getListOfAllAlbumsPhotos, photosIds[j]);
      photos[j] = data.request.responseURL;
      j++;
    }
    yield put(albumsActions.loadAlbums(photos, titles, desc, ids));
  } catch (e) {
    console.log(e);
  }
}
