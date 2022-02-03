import { createStore, combineReducers } from 'redux';
import { persistStore, persistReducer, createTransform} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import progressBarReducer from "./pages/global/state/reducer.js";
import LoginReducer from './pages/login/state/reducer.js';
import adminReducer from './pages/admin/state/reducer.js';
import pluginReducer from './pages/plugin/state/reducer.js';
import mindmapReducer from './pages/mindmap/state/reducer.js';
import scrapeReducer from './pages/scrape/state/reducer.js';
import designReducer from './pages/design/state/reducer.js';
import integrationReducer from './pages/integration/state/reducer.js';
import utilityReducer from './pages/utility/state/reducer.js';


export const JSOGTransform = createTransform(
  (inboundState, key) => {
    if(key === 'login')inboundState.socket = undefined; //presisting socket gets circular json stringify error
    return inboundState
  },
  (outboundState, key) => outboundState,
)

const persistConfig = {
    key: 'login',
    storage: storage,
    whitelist: ['login', 'plugin'], //reducer that needs to be saved for refresh
    transforms: [JSOGTransform]
  };

/* combining multiple domains reducer */
export const rootReducer = combineReducers({
    mindmap : mindmapReducer,
    progressbar : progressBarReducer,
    login : LoginReducer,
    admin : adminReducer,
    plugin : pluginReducer,
    scrape : scrapeReducer,
    design : designReducer,
    integration: integrationReducer,
    utility: utilityReducer
});
  
const pReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(pReducer)
export const persistor = persistStore(store);
