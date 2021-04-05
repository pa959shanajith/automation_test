import * as React from 'react';
import {  mount } from 'enzyme';
import { findByTestAtrr } from '../../../setupTests';
import { act } from 'react-dom/test-utils';
import RemarkDialog from '../components/RemarkDialog';



describe('<RemarkDialog /> positive scenario test', ()=>{

    let wrapper;
    let props = {
        setShow: jest.fn(), 
        onSetRowData: jest.fn(), 
        remarks: "", 
        idx: 1,
        firstname: "Vivek", 
        lastname: "Sharma"
    }
    
    beforeEach(async() => {

        wrapper = mount( <RemarkDialog {...props} /> );

        await act(()=>Promise.resolve())
    });

    afterEach(()=> {
        jest.resetAllMocks()
    })


    it('Should Render Remark Dialog and all its component', ()=>{

        expect(findByTestAtrr(wrapper, 'd__remcontainer').length).toBe(1);
        
        // nohistory yet
        expect(findByTestAtrr(wrapper, 'd__remhistorylbl').length).toBe(0); 
        expect(findByTestAtrr(wrapper, 'd__remhistory').length).toBe(0);
        // 

        expect(findByTestAtrr(wrapper, 'd__remaddlbl').length).toBe(1);
        expect(findByTestAtrr(wrapper, 'd__remtextarea').length).toBe(1);

        expect(findByTestAtrr(wrapper, 'd__rembtn').length).toBe(1);
        expect(wrapper.find('.remark_error').length).toBe(0);
    })

    it('Should save on submit', ()=> {
        const testValue = 'Test Remark';
        const textArea = findByTestAtrr(wrapper, 'd__remtextarea');
        
        textArea.simulate('focus');
        textArea.simulate('change', {
            target: {
                value: testValue
            }
        })

        wrapper.update();

        expect(textArea.instance().value).toBe(testValue);

        const submitBtn = findByTestAtrr(wrapper, 'd__rembtn');
        submitBtn.simulate('click');

        expect(props.onSetRowData).toHaveBeenCalled();
        expect(props.setShow).toHaveBeenCalled();
    })
})

describe('<RemarkDialog /> negative scenario test', ()=>{

    let wrapper;
    let props = {
        setShow: jest.fn(), 
        onSetRowData: jest.fn(), 
        remarks: "Remark 1;Remark 2; Remark 3", 
        idx: 1,
        firstname: "Vivek", 
        lastname: "Sharma"
    }
    
    beforeEach(async() => {

        wrapper = mount( <RemarkDialog {...props} /> );

        await act(()=>Promise.resolve())
    });

    afterEach(()=> {
        jest.resetAllMocks()
    })


    it('Should Render Remark Dialog and all its component (including history)', ()=>{

        expect(findByTestAtrr(wrapper, 'd__remcontainer').length).toBe(1);
        
        expect(findByTestAtrr(wrapper, 'd__remhistorylbl').length).toBe(1); 
        expect(findByTestAtrr(wrapper, 'd__remhistory').length).toBe(1);
        expect(findByTestAtrr(wrapper, 'd__remhistoryitem').length).toBe(3);

        expect(findByTestAtrr(wrapper, 'd__remaddlbl').length).toBe(1);
        expect(findByTestAtrr(wrapper, 'd__remtextarea').length).toBe(1);

        expect(findByTestAtrr(wrapper, 'd__rembtn').length).toBe(1);
        expect(wrapper.find('.remark_error').length).toBe(0);
    })

    it('Should Render Error Border when Submit Empty', ()=>{
        const testValue = '';
        const textArea = findByTestAtrr(wrapper, 'd__remtextarea');
        
        textArea.simulate('focus');
        textArea.simulate('change', {
            target: {
                value: testValue
            }
        })

        wrapper.update();

        expect(textArea.instance().value).toBe(testValue);

        const submitBtn = findByTestAtrr(wrapper, 'd__rembtn');
        submitBtn.simulate('click');

        expect(props.onSetRowData).toHaveBeenCalledTimes(0);
        expect(props.setShow).toHaveBeenCalledTimes(0);
        expect(wrapper.find('.remark_error').length).toBe(1);
    })
})
