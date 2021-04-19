import React from 'react';
import { mount } from 'enzyme';
import TokenMgmtList from '../components/TokenMgmtList';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import {TokenMgmgProps} from './dummyData';
import * as api from '../api'
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';
import { act } from 'react-dom/test-utils';

const setUp=()=>{
    
    const store = {
        login:{
            dateformat: "YYYY-MM-DD"
        }
    }
    let mockStore=createStore(reducer,store) 
    let wrapper = mount(<Provider store={mockStore} ><TokenMgmtList {...TokenMgmgProps} /></Provider>);
    return wrapper
}

const updateWrapper = async(wrapper) => {
    await act(async()=>{
        await new Promise(r=>setTimeout(r))
        wrapper.update()
    })
}

describe('<TokenMgmtList/> positive scenario test',()=>{
    let wrapper;
    beforeEach(async ()=>{
        wrapper=setUp()
        await updateWrapper(wrapper)    
    });

    afterEach(()=>{
        jest.resetAllMocks();
    })
    
    it('Should render token expiry table correctly',() => {
        expect(findByTestAtrr(wrapper,'token_expiry_date').length).toBe(1)
    })
    it('Should render token expiry date correctly',() => {
        expect(findByTestAtrr(wrapper,'token_expiry_date').at(0).props().children[1]).toBe("2021-10-29 00:44")
    })
})