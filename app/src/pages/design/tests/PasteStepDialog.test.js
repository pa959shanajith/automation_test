import * as React from 'react';
import {  mount } from 'enzyme';
import { findByTestAtrr } from '../../../setupTests';
import { tcData } from './DummyData';
import { act } from 'react-dom/test-utils';
import PasteStepDialog from '../components/PasteStepDialog';

let props = {
    setShow: jest.fn(),
    pasteSteps: jest.fn(),
    upperLimit: tcData.testcase.length
}

describe('<PasteStepDialog /> positive scenario test', ()=>{

    let wrapper;
    
    beforeEach(async() => {

        wrapper = mount( <PasteStepDialog {...props} /> );

        await act(()=>Promise.resolve())
    });

    afterEach(()=> {
        jest.resetAllMocks()
    })

    it('Should Render Paste Step input Dialog and all its components', ()=>{
        const dialog = findByTestAtrr(wrapper, "d__psd");
        expect(dialog.length).toBe(1);

        const lblValues = ["Paste after step no:", "For multiple paste. Eg: 5;10;20"];
        const labels = findByTestAtrr(wrapper, "d__pslbl");

        for (let i=0; i<labels.length; i++)
            expect(labels.at(i).text()).toBe(lblValues[i]);

        const inputField = findByTestAtrr(wrapper, 'd__psinp');
        expect(inputField.length).toBe(1);

        // first render shouldn't contain errorMsg
        const errorMsg = findByTestAtrr(wrapper, 'd__pserrmsg');
        expect(errorMsg.length).toBe(0); 

        const actionBtn = findByTestAtrr(wrapper, 'd__psbtn');
        expect(actionBtn.length).toBe(1);

    })

    it('Should Retain Entered Values(multiple)', ()=>{
        const inputField = findByTestAtrr(wrapper, 'd__psinp');

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
        const inputField = findByTestAtrr(wrapper, 'd__psinp');

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
        const inputField = findByTestAtrr(wrapper, 'd__psinp');

        const testValue = "1"
        
        inputField.simulate('focus');
        inputField.simulate('change', {
            target: {
                value: testValue
            }
        })

        wrapper.update();

        expect(inputField.instance().value).toBe(testValue);

        const submitBtn = findByTestAtrr(wrapper, 'd__psbtn');
        submitBtn.simulate('click');

        expect(props.pasteSteps).toHaveBeenCalled();
    })
})

describe('<PasteStepDialog /> negative scenario test', ()=>{

    let wrapper;
    
    beforeEach(async() => {

        wrapper = mount( <PasteStepDialog {...props} /> );

        await act(()=>Promise.resolve())
    });

    afterEach(()=> {
        jest.resetAllMocks()
    })

    it('Should Retain Only Correct Values(multiple)', ()=>{
        const inputField = findByTestAtrr(wrapper, 'd__psinp');

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
        const inputField = findByTestAtrr(wrapper, 'd__psinp');

        const incorrectValue = "~`!@#$%^&*()_+=-}{[]|\\:;\"'?/>.<,"
        const correctValue = ";"
        
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
        const inputField = findByTestAtrr(wrapper, 'd__psinp');

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

        const inputField = findByTestAtrr(wrapper, 'd__psinp');

        const testValue = ""
        
        inputField.simulate('focus');
        inputField.simulate('change', {
            target: {
                value: testValue
            }
        })

        wrapper.update();

        expect(inputField.instance().value).toBe(testValue);

        const submitBtn = findByTestAtrr(wrapper, 'd__psbtn');
        submitBtn.simulate('click');

        expect(props.pasteSteps).toHaveBeenCalledTimes(0);

        const errorMsgBox = findByTestAtrr(wrapper, 'd__pserrmsg');
        expect(errorMsgBox.length).toBe(1);

        expect(errorMsgBox.text()).toBe(errorMsg);
    })

    it('Should Show Invalid Character Error', ()=>{
        const errorMsg = "*Textbox cannot contain characters other than numbers seperated by single semi colon";

        const inputField = findByTestAtrr(wrapper, 'd__psinp');

        const testValue = "1;;2"
        
        inputField.simulate('focus');
        inputField.simulate('change', {
            target: {
                value: testValue
            }
        })

        wrapper.update();

        expect(inputField.instance().value).toBe(testValue);

        const submitBtn = findByTestAtrr(wrapper, 'd__psbtn');
        submitBtn.simulate('click');

        expect(props.pasteSteps).toHaveBeenCalledTimes(0);

        const errorMsgBox = findByTestAtrr(wrapper, 'd__pserrmsg');
        expect(errorMsgBox.length).toBe(1);

        expect(errorMsgBox.text()).toBe(errorMsg);
    })

    it('Should Show Invalid Step Number Error', ()=>{
        const errorMsg = "*Please enter a valid step no";

        const inputField = findByTestAtrr(wrapper, 'd__psinp');

        const testValue = "200"
        
        inputField.simulate('focus');
        inputField.simulate('change', {
            target: {
                value: testValue
            }
        })

        wrapper.update();

        expect(inputField.instance().value).toBe(testValue);

        const submitBtn = findByTestAtrr(wrapper, 'd__psbtn');
        submitBtn.simulate('click');
        
        expect(props.pasteSteps).toHaveBeenCalledTimes(0);

        const errorMsgBox = findByTestAtrr(wrapper, 'd__pserrmsg');
        expect(errorMsgBox.length).toBe(1);

        expect(errorMsgBox.text()).toBe(errorMsg);
    })
})