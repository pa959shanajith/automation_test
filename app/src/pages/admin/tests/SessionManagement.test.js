import React from 'react';
import { mount } from 'enzyme';
import SessionManagement from '../containers/SessionManagement';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import {SessionData} from './dummyData';
import * as api from '../api'
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';
import { act } from 'react-dom/test-utils';

const setUp=()=>{
    const props = {
        "resetMiddleScreen": {
            "tokenTab": true,
            "provisionTa": true,
            "Preferences": true,
            "sessionTab": true,
            "ldapConfigTab": true,
            "createUser": true,
            "projectTab": true,
            "assignProjectTab": true,
            "samlConfigTab": true,
            "oidcConfigTab": true,
            "emailConfigTab": true
        },
        "middleScreen": "sessionTab"
    }
    const store = {
        login:{
            dateformat: "YYYY-MM-DD"
        }
    }
    jest.spyOn(api,'manageSessionData').mockImplementation(()=>{
        return Promise.resolve(SessionData)
    })
    let mockStore=createStore(reducer,store) 
    let wrapper = mount(<Provider store={mockStore} ><SessionManagement {...props} /></Provider>);
    return wrapper
}

const updateWrapper = async(wrapper) => {
    await act(async()=>{
        await new Promise(r=>setTimeout(r))
        wrapper.update()
    })
}

describe('<SessionManagement/> positive scenario test',()=>{
    let wrapper;
    beforeEach(async ()=>{
        wrapper=setUp()
        await updateWrapper(wrapper)    
    });

    afterEach(()=>{
        jest.resetAllMocks();
    })
    
    it('Should render token expiry table correctly',() => {
        expect(findByTestAtrr(wrapper,'login_date_time').length).toBe(1)
    })
    it('Should render token expiry date correctly',() => {
        expect(findByTestAtrr(wrapper,'login_date_time').at(0).props().children[1]).toBe("2021-04-15 13:05")
    })
})