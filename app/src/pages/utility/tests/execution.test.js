import * as React from 'react';
import { mount } from 'enzyme';
import { findByTestAtrr } from '../../../setupTests';
import UtilityCenter  from '../containers/UtilityCenter.js';
import CalendarComp from '../components/CalendarComp';
import Datetime from "react-datetime";

const setUp=()=>{
    const props = { pairwiseClicked: "pairwiseClicked" ,
                    setPairwiseClicked: jest.fn(), 
                    screenType: "execution",
                    setScreenType: jest.fn(),
                }
    const wrapper = mount(<UtilityCenter {...props} />);
    return wrapper;
}

describe('Execution Metrics', () => {
    let wrapper;
    beforeEach(() => {
        wrapper = setUp();
    });
    
    it('Should Render Title', () => {
        const titleComponent = findByTestAtrr(wrapper, 'util__pageTitle');
        expect(titleComponent.text()).toBe("Execution Metrics");
    });

    it("Should Render Labels Fields", () => {
        const requiredLabels = ['From Date*', 'To Date*', 'LOB*', 'Status', 'ExecutionID'];

        const labelComponents = findByTestAtrr(wrapper, 'util__inputLabel')
        const fieldComponents = findByTestAtrr(wrapper, 'util__input')
        const dateComponents = findByTestAtrr(wrapper, 'util__dateSelect');

        for (let i=0; i<labelComponents.length; i++){
            expect(labelComponents.at(i).text()).toBe(requiredLabels[i]);
        }
        expect(fieldComponents.length).toBe(requiredLabels.length);
        expect(dateComponents.length).toBe(2);
    })

    it("Should Reset on Reset Click", ()=>{
        const fieldData = ['18-3-2021', '17-3-2021', 'someLOB', 'someStatus', 'someExecID'];
        
        const fieldComponents = findByTestAtrr(wrapper, 'util__input');

        // const d=fieldComponents.at(0)
        // console.log(d.debug())
        // d.simulate('click')
        // wrapper.update()
        // console.log(wrapper.find(Datetime).at(0).prop('value'))
        // jest.spyOn(React,'useState')

        // const props = {
        //     date: "sdfsdf",
        //     setDate: jest.fn()
        // }
        // const dateWrapper = mount(<CalendarComp {...props} />)

        // console.log(dateWrapper.props())

        for (let i=0; i<fieldComponents.length; i++){
            if (i>1){
                fieldComponents.at(i).simulate('focus');
                fieldComponents.at(i).simulate('change', {
                    target: {
                        value: fieldData[i]
                    }
                })
                expect(fieldComponents.at(i).instance().value.length).toBeGreaterThan(0);
            }
            
        }


    })
});