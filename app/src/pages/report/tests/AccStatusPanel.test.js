import React from 'react';
import { mount } from 'enzyme';
import AccStatusPanel from '../components/AccStatusPanel';
import {findByTestAtrr} from '../../../setupTests';
import {AccStatusPanelDummy} from './dummyData';
import { act } from 'react-dom/test-utils';

const setUp=()=>{
    const expectedProps={
        arr: AccStatusPanelDummy.arr,
        selectedScDetails: AccStatusPanelDummy.selectedScDetails,
        scDetails: AccStatusPanelDummy.scDetails
    }
    let wrapper = mount(<AccStatusPanel {...expectedProps} />);
    return wrapper
}

const updateWrapper = async(wrapper) => {
    await act(async()=>{
        await new Promise(r=>setTimeout(r))
        wrapper.update()
    })
}

describe('<AccStatusPanel/> positive scenario test',()=>{
    let wrapper;
    beforeEach(async ()=>{
        wrapper=setUp()
        await updateWrapper(wrapper)    
    });

    afterEach(()=>{
        jest.resetAllMocks();
    })
    
    it('Should render Execution Status Panel correctly',() => {
        expect(findByTestAtrr(wrapper,'passes').length).toBe(1)
        expect(findByTestAtrr(wrapper,'violation').length).toBe(1)
        expect(findByTestAtrr(wrapper,'inapplicable').length).toBe(1)
    }) 
})