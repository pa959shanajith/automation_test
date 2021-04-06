import * as React from 'react';
import {findByTestAtrr} from '../../../setupTests';
import {mount}from 'enzyme';
import CalendarComp from '../components/CalendarComp'

describe('<CalenderComp/> Positive Scenarios',()=>{
    it('Should render the calender component',()=>{
        const wrapper=mount(<CalendarComp/>);
        // Assert that the date container and date picker icon are rendered
        expect(findByTestAtrr(wrapper,'dateContainer').length).toBe(1)
        expect(findByTestAtrr(wrapper,'datePickerIcon').length).toBe(1)
    });
});