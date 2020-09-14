import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Text,
  Modal,
  Alert,
  AppState,
} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import SplashScreen from 'react-native-splash-screen';
import AsyncStorage from '@react-native-community/async-storage';
import RNFetchBlob from 'rn-fetch-blob';
import {MinimazedPlayer} from './minimazedPlayer/MinimazedPlayer';
import {FileInfo} from './musicInfo/FileInfo';
import {TrackSlider} from './slider/TrackSlider';
import {ControlsButtons} from './controlPanel/ControlsButtons';

const API_PATH = 'https://childrensproject.ocs.ru/api/';

export class Player extends React.Component {
  state = {
    currentIndex: 0,
    volume: 1.0,
    isBuffering: true,
    currentTime: 0,
    needUpdate: true,
    needUpdate3: true,
    audioLoaded: false,
    pressed: false,
    formattedCurrentTime: '00:00',
    interval: 0,
    canPlayerRender: true,
    formattedDurMillis: [],
    loadedMusicSize: 0,
    isQueueEnded: false,
    needUpdate2: true,
  };

  interval;
  intervalForPosition;

  async componentDidMount() {
    try {
      console.log('componentDidMount called...');
      TrackPlayer.setupPlayer().then(() => {
        console.log('Player created');
        TrackPlayer.updateOptions({
          capabilities: [
            TrackPlayer.CAPABILITY_PLAY,
            TrackPlayer.CAPABILITY_PAUSE,
            TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
            TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
          ],
          compactCapabilities: [
            TrackPlayer.CAPABILITY_PLAY,
            TrackPlayer.CAPABILITY_PAUSE,
          ],
        });
      });
      await AsyncStorage.setItem('move_to_next_album', JSON.stringify(false)); // dropping back moving to next album
      await AsyncStorage.getItem('album_image', (err, res) => {
        if (err) {
          console.log('Can`t get album image', err);
        }
        if (res !== null) {
          this.setState({
            albumImage: JSON.parse(res),
          });
          this.getStoreToState();
        }
      });

      AppState.addEventListener('change', async (res) => {
        console.log(res);
        if (AppState.currentState === 'active') {
          console.log('Screen now active');
          if (this.state.trackPlayerInit) {
            await TrackPlayer.getCurrentTrack().then((info) => {
              this.setState({
                trackId: info,
              });
            });
          }
        }
      });

      TrackPlayer.addEventListener('remote-pause', () => {
        this.handlePlayPause();
      });

      TrackPlayer.addEventListener('remote-play', () => {
        this.handlePlayPause();
      });

      TrackPlayer.addEventListener('remote-next', () => {
        this.handleNextTrack();
      });

      TrackPlayer.addEventListener('remote-previous', () => {
        this.handlePreviousTrack();
      });

      TrackPlayer.addEventListener('playback-queue-ended', async () => {
        if (this.state.isPlaying && this.state.needUpdate2) {
          this.setState({
            trackId: this.state.lastTrackId,
            isQueueEnded: true,
          });
          await TrackPlayer.reset();
          this.handleNextTrack();
          console.log('queue ended');
        }
      });

      TrackPlayer.addEventListener('playback-track-changed', async () => {
        if (
          this.state.isPlaying &&
          !this.state.isQueueEnded &&
          !this.state.pressed
        ) {
          await TrackPlayer.getCurrentTrack().then((res) => {
            this.setState({
              trackId: parseInt(res, 10),
            });
            let interval = setInterval(async () => {
              if ((await TrackPlayer.getState()) === TrackPlayer.STATE_READY) {
                console.log('ready to play');
                clearInterval(interval);
                setTimeout(async () => {
                  await TrackPlayer.play();
                }, 1000);
              }
            }, 250);
          });
        }
      });

      let fs = RNFetchBlob.fs;
      await fs
        .exists(fs.dirs.CacheDir + '/loaded_tracks/')
        .then(async (res) => {
          if (!res) {
            await fs.mkdir(fs.dirs.CacheDir + '/loaded_tracks/');
          }
          console.log('Is dir for loaded tracks exist? -', res);
        });
      await AsyncStorage.getItem('loaded_tracks_size').then((res) => {
        if (res) {
          this.setState({
            loadedMusicSize: JSON.parse(res),
          });
        }
      });
      this.interval = setInterval(() => this.setState({}), 1000); // auto updating player for catching new data
      SplashScreen.hide();
    } catch (e) {
      console.log('Error in mounting player component', e);
    }
  }

  // function to put data from async storage to player state
  async getStoreToState() {
    try {
      await AsyncStorage.getItem('tracks_titles', (err, res) => {
        if (err) {
          console.log(err);
        }
        this.setState({
          tracksTitles: JSON.parse(res),
        });
        console.log('Array of TRACKS TITLES now in state.');
      });

      await AsyncStorage.getItem('tracks_authors', (err, res) => {
        if (err) {
          console.log(err);
        }
        this.setState({
          tracksAuthors: JSON.parse(res),
        });
        console.log('Array of TRACKS AUTHORS now in state.');
      });

      await AsyncStorage.getItem('track_id', async (err, res) => {
        if (err) {
          console.log(err);
        }
        this.setState({
          trackId: JSON.parse(res),
        });
        console.log('Current TRACK ID now in state.');
      });

      await AsyncStorage.getItem('tracks_duration', (err, res) => {
        if (err) {
          console.log(err);
        }
        this.setState({
          tracksDuration: JSON.parse(res),
        });
        console.log('Array of TRACKS DURATIONS now in state.');
      });

      await AsyncStorage.getItem('tracks_duration_millis', (err, res) => {
        if (err) {
          console.log(err);
        }
        let dur = JSON.parse(res).map((value) => (value /= 1000));
        this.setState({
          tracksDurationMillis: JSON.parse(res),
          formattedDurMillis: dur,
        });
        console.log('Array of TRACKS DURATIONS in MILLIS now in state.');
      });

      await AsyncStorage.getItem('first_track_id', (err, res) => {
        if (err) {
          console.log(err);
        }
        this.setState({
          firstTrackId: JSON.parse(res),
        });
        console.log('FIRST TRACK ID now in state.');
      });

      await AsyncStorage.getItem('last_track_id', (err, res) => {
        if (err) {
          console.log(err);
        }
        this.setState({
          lastTrackId: JSON.parse(res),
        });
        console.log('LAST TRACK ID now in state.');
        console.log('STATE: audioLoaded - true');
        this.loadAudio(true);
      });
    } catch (e) {
      console.log('Error in function `getStoreToState()`', e);
    }
  }

  // called every second and checking if track in AlbumScreen was pressed
  async isPressed(error, result) {
    if (error) {
      console.log('Error from isPressed()', error);
    }
    if (result === JSON.stringify(true) && this.state.needUpdate) {
      // if track was pressed
      this.setState({
        needUpdate: false, // this is to prevent double call of this function
        pressed: true,
        canPlayerRender: true,
      });

      console.log('Track from album screen pressed.');

      await AsyncStorage.setItem('pressedd', JSON.stringify(false), () =>
        this.setState({needUpdate: true}),
      );

      // checking for loaded audio

      await AsyncStorage.getItem('track_id', async (err, value) => {
        if (err) {
          console.log(
            'Failed get track id from Async Storage in func isPressed()',
            err,
          );
        }
        this.setState({
          trackId: JSON.parse(value),
        });

        if (!this.state.trackPlayerInit) {
          // await TrackPlayer.pause();
          setTimeout(async () => {
            await TrackPlayer.skip(value.toString()).then(() => {
              let interval = setInterval(async () => {
                if (
                  (await TrackPlayer.getState()) === TrackPlayer.STATE_READY
                ) {
                  console.log('ready to play 1');
                  clearInterval(interval);
                  setTimeout(async () => {
                    await TrackPlayer.play().then(() =>
                      this.setState({
                        isPlaying: true,
                        // trackPositionInterval: true,
                      }),
                    );
                  }, 1000);
                }
              }, 250);
            });
          }, 1500);
        } else {
          await TrackPlayer.skip(value.toString()).then(() => {
            let interval = setInterval(async () => {
              if ((await TrackPlayer.getState()) === TrackPlayer.STATE_READY) {
                console.log('ready to play 2');
                clearInterval(interval);
                setTimeout(async () => {
                  await TrackPlayer.play().then(() =>
                    this.setState({
                      isPlaying: true,
                      // trackPositionInterval: true,
                    }),
                  );
                }, 1000);
              }
            }, 250);
          });
        }
        this.checkForLoad();
      });
    }
  }

  // cheking to put data of new album in store
  async isAlbumImageChanged(error, result) {
    if (error) {
      console.log('Error from isAlbumImageChanged()', error);
    }
    if (
      JSON.parse(result) !== this.state.albumImage &&
      this.state.canPlayerRender
    ) {
      console.log('album image', result);
      this.setState({
        audioLoaded: false,
        trackPlayerInit: false,
        albumImage: JSON.parse(result), // this is needed to prevent double call of this function
      });
      await TrackPlayer.reset();
      this.getStoreToState(); // put store in state
    }
  }

  // callback function to check can player render or not
  async canPlayerRender(err, res) {
    if (err) {
      console.log('Error from canPlayerRender()', err);
    }
    if (JSON.parse(res) !== this.state.canPlayerRender) {
      if (JSON.parse(res) === false) {
        if (this.state.audioLoaded) {
          await TrackPlayer.reset();
        }
        await AsyncStorage.setItem('can_player_render', JSON.stringify(true));
        this.setState({
          isPlaying: false,
          audioLoaded: false,
          albumImage: null,
          playbackInstance: null,
          trackPlayerInit: false,
          canPlayerRender: false,
          loadedMusicSize: 0,
        });
      }
    }
  }

  componentDidUpdate = async () => {
    try {
      await AsyncStorage.getItem('album_image', (err, res) => {
        this.isAlbumImageChanged(err, res);
      });
      await AsyncStorage.getItem('pressedd', (err, res) =>
        this.isPressed(err, res),
      );
      await AsyncStorage.getItem('can_player_render', (err, res) =>
        this.canPlayerRender(err, res),
      );
    } catch (e) {
      console.log(e);
    }
  };

  async componentWillUnmount() {
    try {
      console.log('componentWillUnmount called...');
      if (this.state.audioLoaded) {
        await TrackPlayer.reset().then(() => console.log('Player destroyed'));
      }
      this.setState({
        trackPlayerInit: false,
      });
      await AsyncStorage.setItem('pressedd', JSON.stringify(false));
      clearInterval(this.interval, console.log('interval cleared, app closed'));

      AppState.removeEventListener('change', () => {
        console.log('AppState event listener removed');
      });
    } catch (e) {
      console.log(e);
    }
  }

  async loadAudio(currentTrack) {
    const {
      isPlaying,
      trackId,
      pressed,
      trackPlayerInit,
      trackPositionInterval,
      firstTrackId,
      lastTrackId,
      tracksAuthors,
      tracksTitles,
    } = this.state;
    console.log('Track Id from player', trackId);

    try {
      let j = 0; // for array of objects
      var track = [];
      for (let i = firstTrackId; i <= lastTrackId; i++) {
        var path =
          RNFetchBlob.fs.dirs.CacheDir + '/loaded_tracks/' + i + '.mp3';

        await RNFetchBlob.fs.exists(path).then(async (res) => {
          if (res) {
            console.log('Read track from cache');
            // console.log('adsd', await RNFetchBlob.fs.(path));
            await RNFetchBlob.fs.readFile(path).then((uri) => {
              console.log(uri);
              track[j] = {
                id: i.toString(),
                url: uri,
                artist: tracksAuthors[i - firstTrackId].toString(),
                title: tracksTitles[i - firstTrackId].toString(),
              };
            });
          } else {
            console.log('Read track from network');
            track[j] = {
              id: i.toString(),
              url: 'https://childrensproject.ocs.ru/api/v1/files/' + i,
              artist: tracksAuthors[i - firstTrackId].toString(),
              title: tracksTitles[i - firstTrackId].toString(),
            };
          }
          j++;
        });
      }
      await TrackPlayer.add(track);

      this.setState({
        audioLoaded: true,
        isPlaying: pressed ? true : isPlaying,
        trackPositionInterval: false,
        isQueueEnded: false,
        needUpdate2: true,
      });

      if (currentTrack) {
        console.log(await TrackPlayer.getQueue());
        await TrackPlayer.skip(trackId.toString());
      }

      if (!trackPlayerInit) {
        this.setState({
          trackPlayerInit: true,
        });
      }

      this.checkForLoad();

      var intervalForPosition = setInterval(() => {
        if (trackPositionInterval) {
          clearInterval(intervalForPosition, console.log('Interval cleared2'));
        } else {
          this.trackPosition();
        }
      }, 1000);
    } catch (e) {
      console.log('failed to load audio', e);
      console.log('track id in faile', trackId);
      Alert.alert(
        'Ошибка',
        'Не удалось загрузить музыку, попробуйте позже',
        [
          {
            text: 'Ок',
            onPress: () => console.log('Ok button pressed'),
          },
        ],
        {cancelable: false},
      );
      this.setState({
        isPlaying: false,
        trackPlayerInit: false,
      });
    }
  }

  handlePlayPause = async () => {
    if (this.state.audioLoaded) {
      const {isPlaying} = this.state;

      isPlaying
        ? await TrackPlayer.pause().then(console.log('paused from handle'))
        : await TrackPlayer.play().then(console.log('playing from handle'));

      var intervalForPosition = setInterval(() => {
        if (!isPlaying) {
          clearInterval(
            intervalForPosition,
            console.log('Interval for position cleared'),
          );
        } else {
          this.trackPosition();
        }
      }, 1000);

      this.setState({
        isPlaying: !isPlaying,
        trackPositionInterval: true,
      });
      this.checkForLoad();
    }
  };

  handlePreviousTrack = async () => {
    if (this.state.audioLoaded) {
      let {trackId} = this.state;
      if (JSON.parse(trackId) - 1 >= this.state.firstTrackId) {
        trackId -= 1;
        this.setState({
          trackId,
          audioLoaded: true,
          currentTime: 0,
          formattedCurrentTime: '00:00',
          pressed: false,
          trackPositionInterval: true,
        });
        await TrackPlayer.skipToPrevious().then(() => {
          console.log('skipped to - ', trackId);
          let interval = setInterval(async () => {
            console.log(
              'state from handlePrev -',
              await TrackPlayer.getState(),
            );
            if (
              (await TrackPlayer.getState()) === TrackPlayer.STATE_READY ||
              TrackPlayer.STATE_PAUSED
            ) {
              console.log('ready to play');
              clearInterval(interval);
              setTimeout(async () => {
                await TrackPlayer.play().then(() => {
                  this.setState({
                    isPlaying: true,
                  });
                  this.trackPosition();
                });
              }, 1000);
            }
          }, 250);
        });
      } else {
        this.handleTrackPosition(0);
      }
      this.checkForLoad();
    }
  };

  handleNextTrack = async () => {
    if (this.state.audioLoaded) {
      let {trackId, lastTrackId} = this.state;

      if (trackId === 33954) {
        console.log('all tracks ended');
        await TrackPlayer.pause();
        return;
      }

      if (trackId !== 33799) {
        console.log('last track', lastTrackId);
        console.log('track id', trackId);
        if (trackId + 1 <= lastTrackId) {
          trackId += 1;
          this.setState({
            trackId,
            currentTime: 0,
            formattedCurrentTime: '00:00',
            pressed: false,
          });
          // await TrackPlayer.getTrack(trackId).then((res) => console.log('get track ', res))
          await TrackPlayer.skipToNext().then(() => {
            console.log('skipped to next - ', trackId);
            let interval = setInterval(async () => {
              console.log(
                'state from handleNext',
                await TrackPlayer.getState(),
              );
              if (
                (await TrackPlayer.getState()) === TrackPlayer.STATE_READY ||
                TrackPlayer.STATE_PAUSED
              ) {
                console.log('ready to play');
                clearInterval(interval);
                setTimeout(async () => {
                  await TrackPlayer.play().then(() => {
                    this.setState({
                      audioLoaded: true,
                      isPlaying: true,
                      trackPositionInterval: true,
                    });
                    this.trackPosition();
                  });
                }, 1000);
              }
            }, 250);
          });
        } else {
          await AsyncStorage.setItem(
            'move_to_next_album',
            JSON.stringify(true),
            () => console.log('move to next album prop true set'),
          );
          await AsyncStorage.setItem(
            'track_id',
            JSON.stringify(parseInt(trackId, 10) + 2),
          );

          this.setState({
            currentTime: 0,
            audioLoaded: false,
            formattedCurrentTime: '00:00',
            pressed: false,
            needUpdate2: false,
          });

          setTimeout(async () => {
            console.log('isAlbumImageChanged from handle');
            await AsyncStorage.setItem(
              'album_image',
              JSON.stringify(this.state.albumImage),
            );
          }, 3000);

          setTimeout(
            async () =>
              await AsyncStorage.setItem(
                'move_to_next_album',
                JSON.stringify(false),
              ),
            2000,
          );
        }
        this.checkForLoad();
        console.log('track id after update', this.state.trackId);
      }
    }
  };

  async trackPosition() {
    const {audioLoaded, currentTime} = this.state;

    if (audioLoaded) {
      let position = await TrackPlayer.getPosition();
      // millis in correct format for user
      var time;

      var seconds = currentTime;
      var minutes = Math.floor(seconds / 60);

      seconds = Math.floor(seconds % 60);
      seconds = seconds >= 10 ? seconds : '0' + seconds;

      currentTime === undefined
        ? (time = '00:00')
        : (time = '0' + minutes + ':' + seconds);
      this.setState({
        currentTime: position,
        formattedCurrentTime: time,
      });
    }
  }

  async checkForLoad() {
    try {
      let {trackId} = this.state;
      var path =
        RNFetchBlob.fs.dirs.CacheDir + '/loaded_tracks/' + trackId + '.mp3';
      await RNFetchBlob.fs.exists(path).then(async (exist) => {
        console.log('Track exists? -', exist);
        if (!exist) {
          await fetch(API_PATH + 'v1/files/' + trackId).then(async (data) => {
            console.log('file size - ', data.headers.get('Content-Length'));
            let fileSize = data.headers.get('Content-Length');
            let totalSize = parseInt(fileSize, 10) + this.state.loadedMusicSize;
            console.log('Total size - ', totalSize);
            await AsyncStorage.setItem(
              'loaded_tracks_size',
              JSON.stringify(totalSize),
            ).then(() => {
              this.setState({
                loadedMusicSize: totalSize,
              });
            });
          });
          await RNFetchBlob.fs.writeFile(
            path,
            API_PATH + 'v1/files/' + trackId,
          );
          console.log('New Track Now In Cache');
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  // called when user ended sliding track position
  handleTrackPosition = async (value) => {
    const {audioLoaded} = this.state;
    try {
      if (audioLoaded) {
        console.log(value);
        await TrackPlayer.seekTo(value).then(() => {
          this.setState({currentTime: value});
        });
      }
    } catch (e) {
      console.log('Error from handleTrackPosition()', e);
    }
  };

  // TODO Данные в минимизированный плеер, инфу о файле, слайдер пойдут через редакс
  render() {
    return (
      <View style={styles.container}>
        <MinimazedPlayer />
        <Modal
          animationType="slide"
          transparent={true}
          visible={!this.state.minimazed}
          gestureEnabled={true}
          gestureDirection="vertical">
          <View style={styles.container}>
            <TouchableOpacity
              style={{paddingBottom: 30}}
              onPress={() => this.setState({minimazed: true})}>
              <Image source={require('../../../images/icons/hide/hide.png')} />
            </TouchableOpacity>
            <Image
              style={styles.albumCover}
              source={
                this.state.trackPlayerInit
                  ? {
                      uri: this.state.albumImage,
                    }
                  : require('../../../images/splash_phone/drawable-mdpi/vector_smart_object.png')
              }
            />
            <TrackSlider />
            <FileInfo />
          </View>
          <ControlsButtons />
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageAndInfo: {
    flexDirection: 'row',
    width: 240,
    height: '100%',
    alignItems: 'center',
  },
  albumCover: {
    width: 350,
    height: 350,
  },
});
