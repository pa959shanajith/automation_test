import React from 'react';
import { mount } from 'enzyme';
import CalendarComp from '../components/CalendarComp';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import * as reactRedux from 'react-redux';
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';

const props = {
    inputProps: '',
    date:'',
    setDate: (val)=>{updateDate(val)}, 
    classCalender: "schedule_calender",
}
var datevalue = ""
function updateDate(date){
    datevalue = date
    console.log(date);
    return true;
}

const inputFieldChange=(wrapper,val)=>{
    let inp=findByTestAtrr(wrapper, 'calendar-comp')
    inp.simulate('focus');
    inp.simulate('change',{
            target:{
                value:val
            }
    })
    wrapper.update()
    return wrapper
}

// True Positive Scene 
// 1.   Check component if component is rendered



describe('<CalendarComp/> positive scenario test',()=>{
    let state={
        login:{
            dateformat: "MM-DD-YYYY"
        }
    }
    let wrapper;
    let mockDispatch;
    beforeEach(async ()=>{
        mockDispatch=jest.fn();
        jest.spyOn(reactRedux,'useDispatch').mockImplementation(()=>{return mockDispatch});
        const mockstore=createStore(reducer,state);
        wrapper=mount(<Provider store={mockstore}><CalendarComp {...props}/></Provider>);
    });
    afterEach(()=>{
        jest.restoreAllMocks();
    })
	
	it('Should render the calendar input',()=>{
        //wrapper=setUp()
        const component=findByTestAtrr(wrapper,'calendar-comp');
        // Assert that calendar component is being rendered
        expect(component.length).toBe(1);
    })
})



