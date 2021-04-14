import React from 'react';
import { mount } from 'enzyme';
import ScDetailPanel from '../components/ScDetailPanel';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import {scDetails, suSelected} from './dummyData';
import * as api from '../api'
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';
import { act } from 'react-dom/test-utils';

const setUp=()=>{
    const expectedProps={
        scDetails: scDetails,
        setBlockui: (input)=>{},
        displayError: (input)=>{},
        selectedScDetails: {
            "_id": scDetails[0].reportid,
            "name": "1"
        }
    }
    const store = {
        login:{
            dateformat: "YYYY-MM-DD"
        }
    }
    let mockStore=createStore(reducer,store) 
    let wrapper = mount(<Provider store={mockStore} ><ScDetailPanel {...expectedProps} /></Provider>);
    return wrapper
}

const updateWrapper = async(wrapper) => {
    await act(async()=>{
        await new Promise(r=>setTimeout(r))
        wrapper.update()
    })
}

describe('<ScDetailPanel/> positive scenario test',()=>{
    let wrapper;
    beforeEach(async ()=>{
        wrapper=setUp()
        await updateWrapper(wrapper)    
    });

    afterEach(()=>{
        jest.resetAllMocks();
    })
    
    it('Should render scenario details table correctly',() => {
        expect(findByTestAtrr(wrapper,'executed_time').length).toBe(2)
    })
    it('Should render execution date correctly',() => {
        expect(findByTestAtrr(wrapper,'executed_time').at(0).props().children).toBe("2021-01-19 16:04:02")
    })
})