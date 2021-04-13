import * as React from 'react';
import {  mount } from 'enzyme';
import { findByTestAtrr } from '../../../setupTests';
import { tcData } from './DummyData';
import { act } from 'react-dom/test-utils';
import SelectMultipleDialog from '../components/SelectMultipleDialog';

let props = {
    setShow: jest.fn(),
    selectSteps: jest.fn(),
    upperLimit: tcData.testcase.length
}

describe('<SelectMultipleDialog /> positive scenario test', ()=>{

    let wrapper;
    
    beforeEach(async() => {

        wrapper = mount( <SelectMultipleDialog {...props} /> );

        await act(()=>Promise.resolve())
    });

    afterEach(()=> {
        jest.resetAllMocks()
    })

    it('Should Render Dialog and All its Components', ()=>{
        expect(findByTestAtrr(wrapper, 'd__smlbl').at(0).text()).toBe("Select step(s) no:");
        expect(findByTestAtrr(wrapper, 'd__smlbl').at(1).text()).toBe("For multiple select. Eg: 5;10-15;20;22");
        expect(findByTestAtrr(wrapper, 'd__sminp').length).toBe(1);
        expect(findByTestAtrr(wrapper, 'd__sminp').instance().value).toBe("");
    })


    it('Should Retain Entered Values(multiple)', ()=>{
        const inputField = findByTestAtrr(wrapper, 'd__sminp');

        const testValue = "1;2;3"
        
        inputField.simulate('focus');
        inputField.simulate('change', {
            target: {
                value: testValue
            }
        })

        wrapper.update();

        expect(inputField.instance().value).toBe(testValue);
    })

    it('Should Retain Entered Value (single)', ()=>{
        const inputField = findByTestAtrr(wrapper, 'd__sminp');

        const testValue = "1"
        
        inputField.simulate('focus');
        inputField.simulate('change', {
            target: {
                value: testValue
            }
        })

        wrapper.update();

        expect(inputField.instance().value).toBe(testValue);
    })

    it('Should Submit on action "Submit"', ()=>{
        const inputField = findByTestAtrr(wrapper, 'd__sminp');

        const testValue = "1"
        
        inputField.simulate('focus');
        inputField.simulate('change', {
            target: {
                value: testValue
            }
        })

        wrapper.update();

        expect(inputField.instance().value).toBe(testValue);

        const submitBtn = findByTestAtrr(wrapper, 'd__smactionbtn');
        submitBtn.simulate('click');

        expect(props.selectSteps).toHaveBeenCalled();
    })
})


describe('<SelectMultipleDialog /> negative scenario test', ()=>{

    let wrapper;
    
    beforeEach(async() => {

        wrapper = mount( <SelectMultipleDialog {...props} /> );

        await act(()=>Promise.resolve())
    });

    afterEach(()=> {
        jest.resetAllMocks()
    })

    it('Should Retain Only Correct Values(multiple)', ()=>{
        const inputField = findByTestAtrr(wrapper, 'd__sminp');

        const incorrectValue = "1;2;3;@#$"
        const correctValue = "1;2;3;"
        
        inputField.simulate('focus');
        inputField.simulate('change', {
            target: {
                value: incorrectValue
            }
        })

        wrapper.update();

        expect(inputField.instance().value).toBe(correctValue);
    })


    it('Incorrect Value (special symbols)', ()=>{
        const inputField = findByTestAtrr(wrapper, 'd__sminp');

        const incorrectValue = "~`!@#$%^&*()_+=-}{[]|\\:;\"'?/>.<,"
        const correctValue = "-;"
        
        inputField.simulate('focus');
        inputField.simulate('change', {
            target: {
                value: incorrectValue
            }
        })

        wrapper.update();

        expect(inputField.instance().value).toBe(correctValue);
    })

    it('Incorrect Value (Albhabets)', ()=>{
        const inputField = findByTestAtrr(wrapper, 'd__sminp');

        const incorrectValue = "QWERTYUIOPLKJHGFDSAZXCVBNM"
        const correctValue = ""
        
        inputField.simulate('focus');
        inputField.simulate('change', {
            target: {
                value: incorrectValue
            }
        })

        wrapper.update();

        expect(inputField.instance().value).toBe(correctValue);
    })

    it('Should Show Empty Textbox Error', ()=>{
        const errorMsg = "*Textbox cannot be empty";

        const inputField = findByTestAtrr(wrapper, 'd__sminp');

        const testValue = ""
        
        inputField.simulate('focus');
        inputField.simulate('change', {
            target: {
                value: testValue
            }
        })

        wrapper.update();

        expect(inputField.instance().value).toBe(testValue);

        const submitBtn = findByTestAtrr(wrapper, 'd__smactionbtn');
        submitBtn.simulate('click');

        expect(props.selectSteps).toHaveBeenCalledTimes(0);

        const errorMsgBox = findByTestAtrr(wrapper, 'd__smerror');
        expect(errorMsgBox.length).toBe(1);

        expect(errorMsgBox.text()).toBe(errorMsg);
    })

    it('Should Show Invalid Character Error', ()=>{
        const errorMsg = "Invalid format is given";

        const inputField = findByTestAtrr(wrapper, 'd__sminp');

        const testValue = "1;;2"
        
        inputField.simulate('focus');
        inputField.simulate('change', {
            target: {
                value: testValue
            }
        })

        wrapper.update();

        expect(inputField.instance().value).toBe(testValue);

        const submitBtn = findByTestAtrr(wrapper, 'd__smactionbtn');
        submitBtn.simulate('click');

        expect(props.selectSteps).toHaveBeenCalledTimes(0);

        const errorMsgBox = findByTestAtrr(wrapper, 'd__smerror');
        expect(errorMsgBox.length).toBe(1);

        expect(errorMsgBox.text()).toBe(errorMsg);
    })

    it('Should Show Invalid Step Number Error', ()=>{
        const errorMsg = "*Please enter a valid step no";

        const inputField = findByTestAtrr(wrapper, 'd__sminp');

        const testValue = "200"
        
        inputField.simulate('focus');
        inputField.simulate('change', {
            target: {
                value: testValue
            }
        })

        wrapper.update();

        expect(inputField.instance().value).toBe(testValue);

        const submitBtn = findByTestAtrr(wrapper, 'd__smactionbtn');
        submitBtn.simulate('click');
        
        expect(props.selectSteps).toHaveBeenCalledTimes(0);

        const errorMsgBox = findByTestAtrr(wrapper, 'd__smerror');
        expect(errorMsgBox.length).toBe(1);

        expect(errorMsgBox.text()).toBe(errorMsg);
    })
})