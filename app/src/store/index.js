import {createStore, combineReducers, applyMiddleware} from 'redux';
import {albumsReducer} from './reducers/albums';
import {playerReducer} from './reducers/player';
import {generalReducers} from './reducers/general';
import {composeWithDevTools} from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';
import rootSagas from '../sagas';

const sagaMiddleware = createSagaMiddleware();

const middlewares = [sagaMiddleware];

const rootReducer = combineReducers({
  albums: albumsReducer,
  player: playerReducer,
  general: generalReducers,
});

const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(...middlewares)),
);

sagaMiddleware.run(rootSagas);

export default store;
