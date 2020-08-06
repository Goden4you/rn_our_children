import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Text,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import {Slider} from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import RNFetchBlob from 'rn-fetch-blob';
// import * as FileSystem from 'expo-file-system';

export class Player extends React.Component {
  state = {
    albumImage: null,
    isPlaying: false,
    trackPlayerInit: false,
    trackId: 0,
    currentIndex: 0,
    volume: 1.0,
    isBuffering: true,
    currentTime: 0,
    minimazed: true,
    needUpdate: true,
    needUpdate2: true,
    audioLoaded: false,
    pressed: false,
    formattedCurrentTime: '00:00',
    interval: 0,
    updated: false,
    canPlayerRender: true,
  };

  interval;
  intervalForPosition;

  async componentDidMount() {
    try {
      console.log('componentDidMount called...');
      TrackPlayer.setupPlayer().then(() => {
        console.log('Player created');
      });
      await AsyncStorage.setItem('move_to_next_album', JSON.stringify(false)); // dropping back moving to next album
      await AsyncStorage.getItem('album_image', (err, res) => {
        if (err) {
          console.error('Can`t get album image', err);
        }
        if (res !== null) {
          this.getStoreToState();
          setTimeout(() => {
            this.loadAudio();
          }, 1000);
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
      this.interval = setInterval(() => this.setState({}), 1000); // auto updating player for catching new data
    } catch (e) {
      console.log('Error in mounting player component', e);
    }
  }

  // function to put data from async storage to player state
  async getStoreToState() {
    try {
      await AsyncStorage.getItem('album_image', (err, res) => {
        if (err) {
          console.error(err);
        }
        this.setState({
          albumImage: JSON.parse(res),
        });
        console.log('ALBUM IMAGE now in state.');
      });

      await AsyncStorage.getItem('tracks_titles', (err, res) => {
        if (err) {
          console.error(err);
        }
        this.setState({
          tracksTitles: JSON.parse(res),
        });
        console.log('Array of TRACKS TITLES now in state.');
      });

      await AsyncStorage.getItem('tracks_authors', (err, res) => {
        if (err) {
          console.error(err);
        }
        this.setState({
          tracksAuthors: JSON.parse(res),
        });
        console.log('Array of TRACKS AUTHORS now in state.');
      });

      await AsyncStorage.getItem('track_id', (err, res) => {
        if (err) {
          console.error(err);
        }
        this.setState({
          trackId: JSON.parse(res),
        });
        console.log('Current TRACK ID now in state.');
      });

      await AsyncStorage.getItem('tracks_duration', (err, res) => {
        if (err) {
          console.error(err);
        }
        this.setState({
          tracksDuration: JSON.parse(res),
        });
        console.log('Array of TRACKS DURATIONS now in state.');
      });

      await AsyncStorage.getItem('tracks_duration_millis', (err, res) => {
        if (err) {
          console.error(err);
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
          console.error(err);
        }
        this.setState({
          firstTrackId: JSON.parse(res),
        });
        console.log('FIRST TRACK ID now in state.');
      });

      await AsyncStorage.getItem('last_track_id', (err, res) => {
        if (err) {
          console.error(err);
        }
        this.setState({
          lastTrackId: JSON.parse(res),
          audioLoaded: true,
          needUpdate2: true,
          updated: true,
        });
        console.log('LAST TRACK ID now in state.');
        console.log(
          'STATE: audioLoaded - true, needUpdate2 - true, updated - true.',
        );
      });
    } catch (e) {
      console.log('Error in function `getStoreToState()`', e);
    }
  }

  // called every second and checking if track in AlbumScreen was pressed
  async isPressed(error, result) {
    if (error) {
      console.error('Error from isPressed()', error);
    }
    if (result === JSON.stringify(true) && this.state.needUpdate) {
      // if track was pressed
      this.setState({
        needUpdate: false, // this is to prevent double call of this function
        pressed: true,
      });

      console.log('Track from album screen pressed.');

      await AsyncStorage.setItem('pressedd', JSON.stringify(false), () =>
        this.setState({needUpdate: true}),
      );

      // checking for loaded audio
      if (this.state.audioLoaded) {
        await TrackPlayer.reset();
      }

      await AsyncStorage.getItem('track_id', (err, value) => {
        if (err) {
          console.error(
            'Failed get track id from Async Storage in func isPressed()',
            err,
          );
        }
        this.setState({
          trackId: JSON.parse(value),
        });
        this.loadAudio(); // loading audio
      });
    }
  }

  // cheking to put data of new album in store
  isAlbumImageChanged(error, result) {
    if (error) {
      console.error('Error from isAlbumImageChanged()', error);
    }
    if (
      JSON.parse(result) !== this.state.albumImage &&
      this.state.needUpdate2
    ) {
      this.setState({
        needUpdate2: false, // this is needed to prevent double call of this function
      });
      this.getStoreToState(); // put store in state
    }
  }

  // callback function to check can player render or not
  async canPlayerRender(err, res) {
    if (err) {
      console.error('Error from canPlayerRender()', err);
    }
    if (JSON.parse(res) !== this.state.canPlayerRender) {
      if (JSON.parse(res) === false) {
        if (this.state.audioLoaded) {
          await TrackPlayer.reset();
        }
        this.setState({
          isPlaying: false,
          audioLoaded: false,
          albumImage: null,
          playbackInstance: null,
        });
      }
    }
  }

  componentDidUpdate = async () => {
    try {
      await AsyncStorage.getItem('pressedd', (err, res) =>
        this.isPressed(err, res),
      );
      await AsyncStorage.getItem('album_image', (err, res) =>
        this.isAlbumImageChanged(err, res),
      );
      //   await AsyncStorage.getItem('can_player_render', (err, res) =>
      //     this.canPlayerRender(err, res),
      //   );
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
    } catch (e) {
      console.log(e);
    }
  }

  async loadAudio() {
    const {
      isPlaying,
      trackId,
      pressed,
      trackPositionInterval,
      trackPlayerInit,
    } = this.state;
    console.log('Track Id from player', trackId);

    try {
      if (!trackPlayerInit) {
        this.setState({
          trackPlayerInit: true,
        });
      }
      const path =
        RNFetchBlob.fs.dirs.CacheDir + '/loaded_tracks/' + trackId + '.mp3';
      var track;
      await RNFetchBlob.fs.exists(path).then(async (res) => {
        if (res) {
          console.log('Read track from cache');
          await RNFetchBlob.fs.readFile(path).then((url) => {
            track = {
              id: trackId.toString(),
              url: url,
            };
          });
        } else {
          console.log('Read track from network');
          track = {
            id: trackId.toString(),
            url: 'https://childrensproject.ocs.ru/api/v1/files/' + trackId,
          };

          await RNFetchBlob.fs
            .writeFile(
              path,
              'https://childrensproject.ocs.ru/api/v1/files/' + trackId,
            )
            .then(() => console.log('New track now in cache'));
        }

        await TrackPlayer.add(track).then(async () => {
          pressed || isPlaying ? await TrackPlayer.play() : null;
          this.setState({
            audioLoaded: true,
            isPlaying: pressed ? true : isPlaying,
            trackPositionInterval: false,
          });
        });
      });

      var intervalForPosition = setInterval(() => {
        if (trackPositionInterval) {
          clearInterval(intervalForPosition, console.log('Interval cleared2'));
        } else {
          this.trackPosition();
        }
      }, 1000);

      // playbackInstance.setOnPlaybackStatusUpdate(this.onPlaybackStatusUpdate);
      // await playbackInstance.loadAsync(source, status, false);
      //   });
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
    }
  }

  handlePlayPause = async () => {
    if (this.state.audioLoaded) {
      const {isPlaying} = this.state;

      isPlaying ? await TrackPlayer.pause() : await TrackPlayer.play();

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
    }
  };

  handlePreviousTrack = async () => {
    if (this.state.audioLoaded) {
      let {trackId} = this.state;
      await TrackPlayer.reset();
      JSON.parse(trackId) - 1 >= this.state.firstTrackId
        ? (trackId -= 1)
        : trackId;
      this.setState({
        trackId,
        currentTime: 0,
        audioLoaded: false,
        formattedCurrentTime: '00:00',
        pressed: false,
      });
      this.loadAudio();
    }
  };

  handleNextTrack = async () => {
    if (this.state.audioLoaded) {
      let {trackId, lastTrackId} = this.state;

      if (trackId !== 33799) {
        await TrackPlayer.reset();
        console.log('last track', lastTrackId);
        console.log('track id', trackId);
        if (trackId + 1 <= lastTrackId) {
          trackId += 1;
          this.setState({
            trackId,
            currentTime: 0,
            audioLoaded: false,
            formattedCurrentTime: '00:00',
            pressed: false,
          });

          setTimeout(() => this.loadAudio(), 500);
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
          });

          setTimeout(() => this.isAlbumImageChanged(null, null), 3000);

          setTimeout(() => this.loadAudio(), 4000);

          setTimeout(
            async () =>
              await AsyncStorage.setItem(
                'move_to_next_album',
                JSON.stringify(false),
              ),
            2000,
          );
        }

        console.log('track id after update', this.state.trackId);
      }
    }
  };

  renderFileInfo() {
    const {
      trackPlayerInit,
      minimazed,
      tracksTitles,
      tracksAuthors,
      trackId,
      firstTrackId,
    } = this.state;
    return trackPlayerInit ? (
      <View style={minimazed ? styles.trackInfoMinimazed : styles.trackInfo}>
        <Text
          style={
            minimazed
              ? [styles.largeTextMinimazed, styles.trackInfoTextMinimazed]
              : [styles.largeText, styles.trackInfoText]
          }>
          {tracksTitles[trackId - firstTrackId]}
        </Text>
        <Text
          style={
            minimazed
              ? [styles.smallTextMinimazed, styles.trackInfoTextMinimazed]
              : [styles.smallText, styles.trackInfoText]
          }>
          {tracksAuthors[trackId - firstTrackId]}
        </Text>
      </View>
    ) : null;
  }

  async trackPosition() {
    const {
      audioLoaded,
      currentTime,
      tracksDuration,
      trackId,
      firstTrackId,
    } = this.state;

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

      let dur = tracksDuration[trackId - firstTrackId];
      if (time === dur) {
        console.log('Track Just Finish, going next');
        this.handleNextTrack();
      }

      // updating value for Slider
      this.setState({
        currentTime: position,
        formattedCurrentTime: time,
      });
    }
  }

  minimazedPlayer() {
    const {audioLoaded, isPlaying, albumImage, trackPlayerInit} = this.state;
    return (
      <View style={styles.containerMinimazed}>
        <TouchableOpacity
          style={styles.imageAndInfo}
          onPress={
            () => (audioLoaded ? this.setState({minimazed: false}) : null) // open modal, if track was loaded
          }>
          <Image
            style={styles.albumCoverMinimazed}
            source={
              trackPlayerInit
                ? {
                    uri: albumImage,
                  }
                : require('../../../images/osya/none/ndCopy.png')
            }
          />
          {this.renderFileInfo()}
        </TouchableOpacity>
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlMinimazed}
            onPress={this.handlePreviousTrack}>
            <Image
              source={require('../../../images/icons/playerControl/prevHit/prevHitCopy.png')}
              style={styles.controlImage}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlMinimazed}
            onPress={this.handlePlayPause}>
            {isPlaying ? (
              <Image
                source={require('../../../images/icons/playerControl/pauseHit/pauseHitCopy.png')}
                style={styles.controlImage}
              />
            ) : (
              <Image
                source={require('../../../images/icons/playerControl/playHit/playHitCopy.png')}
                style={styles.controlImage}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlMinimazed}
            onPress={this.handleNextTrack}>
            <Image
              source={require('../../../images/icons/playerControl/nextHit/nextHitCopy.png')}
              style={styles.controlImage}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // called when user ended sliding track position
  handleTrackPosition = async (value) => {
    const {audioLoaded} = this.state;
    try {
      if (audioLoaded) {
        console.log(value);
        await TrackPlayer.seekTo(value);
        this.setState({currentTime: value});
      }
    } catch (e) {
      console.log('Error from handleTrackPosition()', e);
    }
  };

  render() {
    return (
      <View style={styles.container}>
        {this.minimazedPlayer()}
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
              source={{
                uri: this.state.albumImage,
              }}
            />
            <View style={styles.sliderWrap}>
              <Slider
                minimumValue={0}
                maximumValue={
                  this.state.trackPlayerInit
                    ? this.state.formattedDurMillis[
                        this.state.trackId - this.state.firstTrackId
                      ]
                    : null
                }
                minimumTrackTintColor={'rgb(244,121,40)'}
                onSlidingComplete={(value) => {
                  console.log(value);
                  this.handleTrackPosition(value);
                }}
                thumbTintColor="rgb(244,121,40)"
                step={1}
                value={this.state.currentTime}
              />
              <View style={styles.sliderDuration}>
                <Text>{this.state.formattedCurrentTime}</Text>
                <Text>
                  {this.state.trackPlayerInit
                    ? this.state.tracksDuration[
                        this.state.trackId - this.state.firstTrackId
                      ]
                    : null}
                </Text>
              </View>
            </View>
            {this.renderFileInfo()}
            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.control}
                onPress={this.handlePreviousTrack}>
                <Image
                  source={require('../../../images/icons/playerControl/prevHit/prevHitCopy.png')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.control}
                onPress={this.handlePlayPause}>
                {this.state.isPlaying ? (
                  <Image
                    source={require('../../../images/icons/playerControl/pauseHit/pauseHitCopy.png')}
                  />
                ) : (
                  <Image
                    source={require('../../../images/icons/playerControl/playHit/playHitCopy.png')}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.control}
                onPress={this.handleNextTrack}>
                <Image
                  source={require('../../../images/icons/playerControl/nextHit/nextHitCopy.png')}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerMinimazed: {
    height: 80,
    width: '100%',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    // position: "absolute",
    bottom: Platform.OS === 'ios' ? 40 : 0,
    borderTopColor: 'rgb(244,121,40)',
    borderTopWidth: 1,
  },
  imageAndInfo: {
    flexDirection: 'row',
    width: 240,
    alignItems: 'center',
  },
  albumCover: {
    width: 350,
    height: 350,
  },
  albumCoverMinimazed: {
    height: 60,
    width: 60,
    resizeMode: 'contain',
  },
  trackInfo: {
    padding: 20,
  },
  trackInfoMinimazed: {
    width: '70%',
    paddingLeft: 10,
    textAlign: 'left',
  },
  trackInfoText: {
    textAlign: 'center',
    flexWrap: 'wrap',
    fontFamily: 'HouschkaPro-Medium',
  },
  trackInfoTextMinimazed: {
    textAlign: 'left',
    flexWrap: 'wrap',
    fontFamily: 'HouschkaPro-Medium',
  },
  largeText: {
    fontSize: 22,
  },
  largeTextMinimazed: {
    fontSize: 18,
  },
  smallText: {
    fontSize: 16,
    color: 'rgb(147, 149, 152)',
  },
  smallTextMinimazed: {
    fontSize: 14,
    color: 'rgb(147, 149, 152)',
  },
  control: {
    margin: 20,
  },
  controlMinimazed: {
    margin: 5,
    width: 25,
  },
  controls: {
    flexDirection: 'row',
  },
  sliderDuration: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderDurationMinimazed: {
    display: 'none',
  },
  sliderWrap: {
    width: '90%',
  },
  sliderWrapMinimazed: {
    display: 'none',
  },
  thumb: {
    display: 'none',
  },
  controlImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
