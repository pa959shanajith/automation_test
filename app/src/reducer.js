import { createStore, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import progressBarReducer from "./pages/global/state/reducer";
import LoginReducer from './pages/login/state/reducer';
import adminReducer from './pages/admin/state/reducer.js'
import mindmapReducer from './pages/mindmap/state/reducer.js';

const persistConfig = {
    key: 'login',
    storage: storage,
    whitelist: ['login'] //reducer that needs to be saved for refresh
  };

/* combining multiple domains reducer */
export const rootReducer = combineReducers({
    mindmap : mindmapReducer,
    progressbar : progressBarReducer,
    login : LoginReducer,
    admin : adminReducer
});
  
const pReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(pReducer)
export const persistor = persistStore(store);
