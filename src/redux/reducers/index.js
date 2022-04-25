import Thunk from 'redux-thunk';
import {createStore, applyMiddleware, combineReducers} from 'redux';

import UserTokenReducer from './UserTokenReducer';

const reducers = combineReducers({
  UserTokenReducer,
});

const store = createStore(reducers, applyMiddleware(Thunk));

export default store;
