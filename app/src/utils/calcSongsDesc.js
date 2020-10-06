export const calcSongsDesc = (response) => {
  let albumsDesc = [];
  for (let i = 0; i < 7; i++) {
    if (response.data[i].songsCount % 10 === 2) {
      albumsDesc[i] = response.data[i].songsCount + ' песни';
    } else if (response.data[i].songsCount % 10 === 4) {
      albumsDesc[i] = response.data[i].songsCount + ' песни';
    } else {
      albumsDesc[i] = response.data[i].songsCount + ' песен';
    }
  }
  return albumsDesc;
};
