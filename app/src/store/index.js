import {createStore, combineReducers, applyMiddleware} from 'redux';
import {albumsReducer} from './reducers/albums';
import {playerReducer} from './reducers/player';
import createSagaMiddleware from 'redux-saga';
import rootSagas from '../sagas';

const sagaMiddleware = createSagaMiddleware();

const middlewares = [sagaMiddleware];

const rootReducer = combineReducers({
  albums: albumsReducer,
  player: playerReducer,
});

const store = createStore(rootReducer, applyMiddleware(...middlewares));

sagaMiddleware.run(rootSagas);

export default store;
