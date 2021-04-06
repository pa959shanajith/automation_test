import * as React from 'react';
import {findByTestAtrr} from '../../../setupTests';
import {shallow}from 'enzyme';
import Legends from '../components/Legends'


describe('<Legends/> Positive Scenarios',()=>{
    it('Should render the compoents when its not EnE',()=>{
        const props={isEnE:false}
        const wrapper=shallow(<Legends {...props}/>);
        expect(findByTestAtrr(wrapper,'modules').length).toBe(1);
        expect(findByTestAtrr(wrapper,'scenarios').length).toBe(1);
        expect(findByTestAtrr(wrapper,'screens').length).toBe(1);
        expect(findByTestAtrr(wrapper,'testcases').length).toBe(1);
    });
    it('Should render the compoent when its EnE',()=>{
        const props={isEnE:true}
        const wrapper=shallow(<Legends {...props}/>);
        expect(findByTestAtrr(wrapper,'modules').length).toBe(1);
        expect(findByTestAtrr(wrapper,'scenarios').length).toBe(1);
        // Assert that screens and testcases are not displayed
        expect(findByTestAtrr(wrapper,'screens').length).toBe(0);
        expect(findByTestAtrr(wrapper,'testcases').length).toBe(0);
    });
})