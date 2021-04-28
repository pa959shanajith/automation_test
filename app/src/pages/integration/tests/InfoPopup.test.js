import React from 'react';
import { mount } from 'enzyme';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import InfoPopup from '../components/InfoPopup';


const setup =(reqDetails)=>{
    var setInfo = jest.fn()
    var displayError =  jest.fn()
    return mount(<InfoPopup reqDetails={reqDetails} displayError={displayError} setInfo={setInfo} />);
}


describe('<InfoPopup/> positive scenario test',()=>{
    it('Should contain the expected and required props',()=>{
        const expectedProps={
            setInfo : jest.fn(),
            reqDetails : [{reqid:"",reqname:"",reqcreationdate:"",reqdescription:""}],
            displayError: jest.fn()
        }
        const propsError=checkProps(InfoPopup,expectedProps)
        expect(propsError).toBeUndefined()
    })
   it('Should Render 2 message',()=>{
    var wrapper = setup([{reqid:"",reqname:"",reqcreationdate:"",reqdescription:""},{reqid:"",reqname:"",reqcreationdate:"",reqdescription:""}])
    var zphyrInfo = findByTestAtrr(wrapper,'zphyre-info-box');
    expect(zphyrInfo.find('.zphyre-info-step').length).toBe(2)
    })
})
describe('<InfoPopup/> negative scenario test',()=>{
    it('Should Render empty info message',()=>{
        var wrapper = setup([])
        var zphyrInfo = findByTestAtrr(wrapper,'zphyre-info-box');
        expect(zphyrInfo.length).toBe(0)
   })
})