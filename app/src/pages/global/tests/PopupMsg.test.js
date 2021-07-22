import React from 'react';
import { mount } from 'enzyme';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import { VARIANT } from '../components/Messages';
import { PopupMsg } from '..';

const props = {
    variant:VARIANT.SUCCESS,
    content:"POP UP MESSAGE"
}

// True Positive Scene 
// 1.   Check component if component is rendered

describe('<PopupMsg/> positive scenario test',()=>{
    let wrapper;
    beforeEach(async ()=>{
        wrapper=mount(<PopupMsg {...props}/>);
    });

    it('Should contain required and expected props',()=>{
        const propsError = checkProps(PopupMsg, props);
        expect(propsError).toBeUndefined();
    })
	
	it('Should render the popup',()=>{
        const component=findByTestAtrr(wrapper,'popup-comp');
        // Assert that the popup component is being rendered
        expect(component.length).toBe(1);
    })
})



