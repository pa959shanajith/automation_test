import * as actionTypes from './action';

const initialState = {
    // userinfo: {},
    SR: "Test Lead",
    userinfo:  
    {
        "user_id": "5f30e0c829ab779aceb37a53",
        "username": "anvesh.sharma",
        "email_id": "anvesh.sharma@slkgroup.com",
        "additionalrole": [],
        "firstname": "Anvesh",
        "lastname": "Sharma",
        "role": "5db0022cf87fdec084ae49aa",
        "taskwflow": false,
        "token": "720",
        "dbuser": true,
        "ldapuser": false,
        "samluser": false,
        "openiduser": false,
        "rolename": "Test Lead",
        "pluginsInfo": [
          {
            "pluginName": "Integration",
            "pluginValue": true
          },
          {
            "pluginName": "APG",
            "pluginValue": false
          },
          {
            "pluginName": "Dashboard",
            "pluginValue": false
          },
          {
            "pluginName": "Mindmap",
            "pluginValue": true
          },
          {
            "pluginName": "Neuron Graphs",
            "pluginValue": false
          },
          {
            "pluginName": "Performance Testing",
            "pluginValue": false
          },
          {
            "pluginName": "Reports",
            "pluginValue": true
          },
          {
            "pluginName": "Utility",
            "pluginValue": true
          },
          {
            "pluginName": "Webocular",
            "pluginValue": false
          }
        ],
        "page": "plugin"
      }
}

const reducer = (state=initialState, action) => {
    switch(action.type){
        case actionTypes.SET_USERINFO:
            return {
                ...state, userinfo: action.payload
            }
        case actionTypes.SET_SR:
            return {
                ...state, SR: action.payload
            }
        default:
            return state
    }
}

export default reducer;

