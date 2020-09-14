import {createStore, combineReducers} from 'redux';
import {albumsReducer, playerReducer} from './reducers/albums';

const rootReducer = combineReducers({
  albums: albumsReducer,
  player: playerReducer,
});

export default createStore(rootReducer);
