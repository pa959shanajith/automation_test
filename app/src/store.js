import { configureStore } from "@reduxjs/toolkit";
// import all the slices for the components 
// for example
// import loginReducer from './pages/login/loginSlice.js

import loginReducer from './pages/login/loginSlice'
import designSlice from "./pages/design/designSlice";
import landingReducer from './pages/landing/LandingSlice';

export default configureStore({
    reducer:{
        // All the reducer from the slices needs to be combined here ex
        login: loginReducer,
        landing:landingReducer,
        // plugin:pluginReducer,
        // admin:adminReducer
        design: designSlice
        
    }
})