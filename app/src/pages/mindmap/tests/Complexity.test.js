import * as React from 'react';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import {mount}from 'enzyme';
import Complexity from '../components/Complexity'
import {ModalContainer } from '../../global';
const props={
    "complexity": {
        "show": true,
        "val": "Not Set"
    },
    "setComplexity":jest.fn(),
    "setShowcomplexity":jest.fn()
}
describe('<Complexity/> Positive Scenarios',()=>{
    it('Should contain the required and expected props',()=>{
        const expectedProps={
            "complexity":{"a":1,"b":2},
            "setComplexity":jest.fn(),
            "setShowcomplexity":jest.fn()
        }
        const propsErr=checkProps(Complexity,expectedProps)
        expect(propsErr).toBeUndefined()
    })
})
describe('<Complexity/> Positive Scenarios',()=>{
    
    afterEach(()=>{
        jest.resetAllMocks()
    })
    it('Should render the complexity container',()=>{
        const newProps={...props,"type":"scenarios"};
        let wrapper;wrapper=mount(<Complexity {...newProps}/>);
        // Assert that the complexity container for scenarios is being rendered
        expect(findByTestAtrr(wrapper,'complexButton').length).toBe(1);
        expect(findByTestAtrr(wrapper,'complexityContainer').length).toBe(1);
        expect(wrapper.find(ModalContainer).length).toBe(1);
        expect(findByTestAtrr(wrapper,'complexityFooter').length).toBe(1);
        expect(findByTestAtrr(wrapper,'complexityLabel').length).toBe(1);
        expect(findByTestAtrr(wrapper,'okButton').length).toBe(1);
    });
    it('Should render the complexity container for scenarios',()=>{
        const newProps={...props,"type":"scenarios"}
        let wrapper;wrapper=mount(<Complexity {...newProps}/>);
        // Assert that the complexity container for scenarios is being rendered
        expect(findByTestAtrr(wrapper,'complexRows').length).toBe(5);
    });
    it('Should render the component fields for Screen Complexity ',()=>{
        const newProps={...props,"type":"screens"}
        let wrapper;wrapper=mount(<Complexity {...newProps}/>);
        // Assert that the complexity container for screen is being rendered
        expect(findByTestAtrr(wrapper,'complexRows').length).toBe(2);
    });
    it('Should render the component fields for testcases Complexity ',()=>{
        const newProps={...props,"type":"testcases"}
        let wrapper;wrapper=mount(<Complexity {...newProps}/>);
        // Assert that the complexity container for testcases is being rendered
        expect(findByTestAtrr(wrapper,'complexButton').length).toBe(1);
        expect(wrapper.find(ModalContainer).length).toBe(1);
        expect(findByTestAtrr(wrapper,'complexRows').length).toBe(7);
    });
    it('Should submit the complexity',()=>{
        const newProps={...props,"type":"screens"};
        let wrapper=mount(<Complexity {...newProps}/>);
        const multiLingual=findByTestAtrr(wrapper,"complexRows").at(0);
        const numbObj=findByTestAtrr(wrapper,"complexRows").at(1);
        multiLingual.find('option').at(1).instance().selected = true;
        multiLingual.find('select').simulate('change',{current:{value:'1'}});

        numbObj.find('option').at(1).instance().selected = true;
        numbObj.find('select').simulate('change',{current:{value:'<11'}});
        
        wrapper.update();
        // Assert that the complexity label is changed
        expect(findByTestAtrr(wrapper,'complexityLabel').text()).toBe('complexity : Low')
        
        findByTestAtrr(wrapper,'okButton').simulate('click');
        expect(props.setComplexity).toHaveBeenCalledWith({show:true,clist:[10,"1","<11"],val:"Low"})

    })
});