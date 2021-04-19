import React from 'react';
import { mount } from 'enzyme';
import ExecPanel from '../components/ExecPanel';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import {suiteSelected, suSelected} from './dummyData';
import * as api from '../api'
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';
import { act } from 'react-dom/test-utils';

const setUp=()=>{
    const expectedProps={
        displayError: (input)=>{},
        setBlockui: (input)=>{},
        setScDetails: (input)=>{},
        setSelectedDetails: (input)=>{},
        selectedScDetails: {_id: "5df71838d9be728cf8e80358", name: "1"} 
    }
    const store = {
        report:{
            suiteSelected: suiteSelected,
            suiteDetails: suSelected
        },
        login:{
            dateformat: "YYYY-MM-DD"
        }
    }
    let mockStore=createStore(reducer,store) 
    let wrapper = mount(<Provider store={mockStore} ><ExecPanel {...expectedProps} /></Provider>);
    return wrapper
}

const updateWrapper = async(wrapper) => {
    await act(async()=>{
        await new Promise(r=>setTimeout(r))
        wrapper.update()
    })
}

describe('<ExecPanel/> positive scenario test',()=>{
    let wrapper;
    beforeEach(async ()=>{
        wrapper=setUp()
        await updateWrapper(wrapper)    
    });

    afterEach(()=>{
        jest.resetAllMocks();
    })
    
    it('Should render execution table correctly',() => {
        expect(findByTestAtrr(wrapper,'start_date').length).toBe(4)
        expect(findByTestAtrr(wrapper,'end_date').length).toBe(4)
    })
    it('Should render start and end date correctly',() => {
        expect(findByTestAtrr(wrapper,'start_date').at(0).props().children).toBe("2019-08-30 04:53")
        expect(findByTestAtrr(wrapper,'end_date').at(0).props().children).toBe("2019-08-30 11:32")
    })

    
  
})