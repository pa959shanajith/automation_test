import React from 'react';
import { mount } from 'enzyme';
import AccStandardDesc from '../components/AccStandardDesc';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import {accStanDesc} from './dummyData';
import { act } from 'react-dom/test-utils';

const setUp=()=>{
    const expectedProps={
        scDetails: accStanDesc.scDetails,
        standardTypeDetails: accStanDesc.standardTypeDetails
    }
    let wrapper = mount(<AccStandardDesc {...expectedProps} />);
    return wrapper
}

const updateWrapper = async(wrapper) => {
    await act(async()=>{
        await new Promise(r=>setTimeout(r))
        wrapper.update()
    })
}

describe('<AccStandardDesc/> positive scenario test',()=>{
    let wrapper;
    beforeEach(async ()=>{
        wrapper=setUp()
        await updateWrapper(wrapper)    
    });

    afterEach(()=>{
        jest.resetAllMocks();
    })
    
    it('Should render description table correctly',() => {
        expect(findByTestAtrr(wrapper,'ar_desc-head').length).toBe(1)
        expect(findByTestAtrr(wrapper,'ar_sn').length).toBe(5)
        expect(findByTestAtrr(wrapper,'ar_status').length).toBe(5)
        expect(findByTestAtrr(wrapper,'ar_desc').length).toBe(5)
        expect(findByTestAtrr(wrapper,'ar_help').length).toBe(5)
        expect(findByTestAtrr(wrapper,'ar_impact').length).toBe(5)
    }) 
})