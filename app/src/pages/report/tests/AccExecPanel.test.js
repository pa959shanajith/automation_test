import React from 'react';
import { mount } from 'enzyme';
import AccExecPanel from '../components/AccExecPanel';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import {AccExecPanelDummy} from './dummyData';
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
    }
    const store = {
        report:{
            suiteSelected: AccExecPanelDummy.suiteSelected,
            suDetails: AccExecPanelDummy.suDetails
        },
        login:{
            dateformat: "DD-MM-YYYY"
        }
    }
    let mockStore=createStore(reducer,store) 
    let wrapper = mount(<Provider store={mockStore} ><AccExecPanel {...expectedProps} /></Provider>);
    return wrapper
}

const updateWrapper = async(wrapper) => {
    await act(async()=>{
        await new Promise(r=>setTimeout(r))
        wrapper.update()
    })
}

describe('<AccExecPanel /> positive scenario test',()=>{
    let wrapper;
    beforeEach(async ()=>{
        wrapper=setUp()
        await updateWrapper(wrapper)    
    });

    afterEach(()=>{
        jest.resetAllMocks();
    })
    
    it('Should render execution table correctly',() => {
        beforeEach(async ()=>{
            wrapper=setUp()
            await updateWrapper(wrapper)    
        });
        setTimeout(()=>{
            expect(findByTestAtrr(wrapper,'ac_head').length).toBe(1)
            expect(findByTestAtrr(wrapper,'ac_title').length).toBe(4)
            expect(findByTestAtrr(wrapper,'ac_executedtime').at(0).props().children).toBe("25-03-2021 18:13")
        })
    })
})