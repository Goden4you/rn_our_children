import {createStore, combineReducers} from 'redux';
import {albumsReducer} from './reducers/albums';

const rootReducer = combineReducers({
  albums: albumsReducer,
});

export default createStore(rootReducer);
