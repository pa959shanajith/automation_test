import * as React from 'react';
import {  mount } from 'enzyme';
import { findByTestAtrr } from '../../../setupTests';
import { act } from 'react-dom/test-utils';
import DetailsDialog from '../components/DetailsDialog';

let props = {
    setShow: jest.fn(), 
    onSetRowData: jest.fn(), 
    TCDetails: "",
    idx: 1
}

describe('<DetailsDialog /> positive scenario test', ()=>{

    let wrapper;
    
    beforeEach(async() => {

        wrapper = mount( <DetailsDialog {...props} /> );

        await act(()=>Promise.resolve())
    });

    afterEach(()=> {
        jest.resetAllMocks()
    })

    it('Should Render Details Dialog and All its components', ()=>{
        wrapper.update();
        
        const dialog = findByTestAtrr(wrapper, 'd__ddc');
        expect(dialog.length).toBe(1);

        const inputFields = findByTestAtrr(wrapper, "d__ddinp");
        expect(inputFields.length).toBe(3);

        const actionBtns = findByTestAtrr(wrapper, "d__ddbtn");
        expect(actionBtns.length).toBe(2);
    })

    it('Should retain entered values', ()=>{
        const dummyValues = ["field 1", "field 2", "field 3"];

        const inputFields = findByTestAtrr(wrapper, 'd__ddinp');

        for (let i=0; i<inputFields.length; i++){
            inputFields.at(i).simulate('focus');
            inputFields.at(i).simulate('change', {
                target: {
                    value: dummyValues[i]
                }
            })
        }     

        wrapper.update();

        for (let i=0; i<inputFields.length; i++){
            expect(inputFields.at(i).instance().value).toBe(dummyValues[i]);
        }
    })

    it('Should Reset Values on reset button', ()=>{
        const dummyValues = ["field 1", "field 2", "field 3"];

        const inputFields = findByTestAtrr(wrapper, 'd__ddinp');

        for (let i=0; i<inputFields.length; i++){
            inputFields.at(i).simulate('focus');
            inputFields.at(i).simulate('change', {
                target: {
                    value: dummyValues[i]
                }
            })
        }

        wrapper.update();

        const resetBtn = findByTestAtrr(wrapper, 'd__ddbtn').at(0);

        resetBtn.simulate('click'); 
        
        wrapper.update();

        for (let i=0; i<inputFields.length; i++){
            expect(inputFields.at(i).instance().value.length).toBe(0);
        }
    })

    it('Should Save when pressed Save Button', ()=>{
        const saveBtn = findByTestAtrr(wrapper, 'd__ddbtn').at(1);
        saveBtn.simulate('click');

        expect(props.onSetRowData).toHaveBeenCalled();
        expect(props.setShow).toHaveBeenCalled();
    })

})