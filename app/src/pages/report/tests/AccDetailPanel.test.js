import React from 'react';
import { mount } from 'enzyme';
import AccDetailPanel from '../components/AccDetailPanel';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import {AccDetailPanelDummy} from './dummyData';
import { act } from 'react-dom/test-utils';

const setUp=()=>{
    const expectedProps={
        scDetails: AccDetailPanelDummy.scDetails
    }
    let wrapper = mount(<AccDetailPanel {...expectedProps} />);
    return wrapper
}

const updateWrapper = async(wrapper) => {
    await act(async()=>{
        await new Promise(r=>setTimeout(r))
        wrapper.update()
    })
}

describe('<AccDetailPanel/> positive scenario test',()=>{
    let wrapper;
    beforeEach(async ()=>{
        wrapper=setUp()
        await updateWrapper(wrapper)    
    });

    afterEach(()=>{
        jest.resetAllMocks();
    })
    
    it('Should render standard report table correctly',() => {
        expect(findByTestAtrr(wrapper,'ar_detail-head').length).toBe(1)
        expect(findByTestAtrr(wrapper,'ar_detail-sn').length).toBe(2)
        expect(findByTestAtrr(wrapper,'ar_detail-stname').length).toBe(2)
        expect(findByTestAtrr(wrapper,'ar_detail-status').length).toBe(2)
        expect(findByTestAtrr(wrapper,'ar_detail-report').length).toBe(2)
    }) 
})