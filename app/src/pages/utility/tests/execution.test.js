import * as React from 'react';
import { mount } from 'enzyme';
import { findByTestAtrr } from '../../../setupTests';
import UtilityCenter  from '../containers/UtilityCenter.js';

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

        for (let i=0; i<fieldComponents.length; i++){
            if (i>1){
                fieldComponents.at(i).simulate('focus');
                fieldComponents.at(i).simulate('change', {
                    target: {
                        value: fieldData[i]
                    }
                })
            }            
        }

        const resetButton = findByTestAtrr(wrapper, "util__reset");

        resetButton.simulate("click");
        wrapper.update();
        for (let i=0; i<fieldComponents.length; i++){
            if (i>1){
                expect(fieldComponents.at(i).instance().value.length).toBe(0);
            }            
        }

    })

    it("Should Not Fetch Without Mandatory Values", ()=>{
        const fetchBtn = findByTestAtrr(wrapper, "util__fetch");

        fetchBtn.simulate('click');

        expect(wrapper.find(".execM__inputError").length).toBe(3);
    })
});