import {useDispatch} from 'react-redux';

export const calcSongsDesc = (parsedData) => {
  let albumsDesc = [];
  for (let i = 0; i < 7; i++) {
    if (parsedData[i].songsCount % 10 === 2) {
      albumsDesc[i] = parsedData[i].songsCount + ' песни';
    } else if (parsedData[i].songsCount % 10 === 4) {
      albumsDesc[i] = parsedData[i].songsCount + ' песни';
    } else {
      albumsDesc[i] = parsedData[i].songsCount + ' песен';
    }
  }
  return;
};
