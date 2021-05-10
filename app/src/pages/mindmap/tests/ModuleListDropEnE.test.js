import * as React from 'react';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import {mount}from 'enzyme';
import * as reactRedux from 'react-redux';
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';
import ModuleListDropEnE from '../components/ModuleListDropEnE';
import * as dummyData from './dummyData';

const setUp=()=>{
    let state={
        mindmap:{
            moduleList:dummyData.moduleList,
            selectedProj:"5fb4fc98f4da702833d7e0a0",
            selectedModule:{}
        }
    }
    
    let mockDispatch=jest.fn();
    jest.spyOn(reactRedux,'useDispatch').mockImplementation(()=>{return mockDispatch});
    const mockstore=createStore(reducer,state);
    let wrapper=mount(<Provider store={mockstore}><ModuleListDropEnE {...props}/></Provider>);
    return wrapper
}
const props={
    "setBlockui": jest.fn(),
    "setPopup": jest.fn(),
    "filterSc": "",
    "setModName": jest.fn()
}
// Positive
describe('<ModuleListDropEnE/> Positive Scenarios',()=>{
    it('Should contain the required and expected props',()=>{
        const expectedProps={
            "setBlockui": jest.fn(),
            "setPopup": jest.fn(),
            "filterSc": "",
            "setModName": jest.fn()
        }
        const propsError=checkProps(ModuleListDropEnE,expectedProps)
        expect(propsError).toBeUndefined()
    })
})
describe('<ModuleListDropEnE/> Positive Scenarios',()=>{
    let wrapper;
    beforeEach(async ()=>{
        wrapper=setUp()
    });
    afterEach(()=>{
        jest.restoreAllMocks();
    })
    it('Should render all the components',()=>{
        // Assert that the dropDown is rendered without the modules
        expect(findByTestAtrr(wrapper,'moduleList').length).toBe(1);
        expect(findByTestAtrr(wrapper,'scenarioList').length).toBe(1);
        expect(findByTestAtrr(wrapper,'EnEbuttons').length).toBe(1);
        // Assert that there are 2 buttons in the button wrapper
        expect(findByTestAtrr(wrapper,'EnEbuttons').children().length).toBe(2);
    });
});

// Negative
describe('<ModuleListDropEnE/> Negative Scenarios',()=>{
    let wrapper;
    beforeEach(async ()=>{
        wrapper=setUp()
    });
    afterEach(()=>{
        jest.restoreAllMocks();
    })
    it('Should display the error if other than EnE module is selected',()=>{
        findByTestAtrr(wrapper,'individualModules').at(0).simulate('click')
        expect(props.setPopup).toHaveBeenCalledWith(({title:'ERROR',content:'First, Please select an end to end module or create a new one!',submitText:'Ok',show:true}))
    })
})