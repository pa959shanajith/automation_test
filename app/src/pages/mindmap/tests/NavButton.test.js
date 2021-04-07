import * as React from 'react';
import {findByTestAtrr} from '../../../setupTests';
import {mount}from 'enzyme';
import NavButton from '../components/NavButton';

const itemList=['upArrow','leftArrow','rightArrow','downArrow','zoomInBtn','zoomOutBtn'];
// Positive
describe('<NavButton/> Positive Scenarios',()=>{
    it('should render the component',()=>{
        const wrapper=mount(<NavButton/>);
        for(let i=0;i<5;i++){
            expect(findByTestAtrr(wrapper,itemList[i]).length).toBe(1)
        }
    })
})