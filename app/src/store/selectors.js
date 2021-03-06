export const albumSongsCount = (state) => state.albums.songsCount;

export const openedAlbumId = (state) => state.albums.albumId;

export const currentAlbum = (state) => state.albums.currentAlbum;

export const isAlbumChanged = (state) => state.albums.isAlbumChanged;

export const allSongsDesc = (state) => state.albums.allAlbums.albumsDesc;

export const albumsIds = (state) => state.albums.allAlbums.albumsIds;

export const allTracksData = (state) => state.albums.allData;

export const isCalledFromPlayer = (state) => state.albums.calledFromPlayer;
