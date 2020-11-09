import { createStore, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import progressBarReducer from "./pages/global/state/reducer";
import LoginReducer from './pages/login/state/reducer';
import adminReducer from './pages/admin/state/reducer.js';
import pluginReducer from './pages/plugin/state/reducer.js';
import mindmapReducer from './pages/mindmap/state/reducer.js';
import designReducer from './pages/design/state/reducer';

const persistConfig = {
    key: 'login',
    storage: storage,
    whitelist: ['login', 'plugin'] //reducer that needs to be saved for refresh
  };

/* combining multiple domains reducer */
export const rootReducer = combineReducers({
    mindmap : mindmapReducer,
    progressbar : progressBarReducer,
    login : LoginReducer,
    admin : adminReducer,
    plugin : pluginReducer,
    design : designReducer,
});
  
const pReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(pReducer)
export const persistor = persistStore(store);
