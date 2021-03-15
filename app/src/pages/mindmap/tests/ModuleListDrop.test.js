import * as React from 'react';
import {findByTestAtrr} from '../../../setupTests';
import {mount}from 'enzyme';
import * as reactRedux from 'react-redux';
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';
import ModuleListDrop from '../components/ModuleListDrop'
import * as api from '../api';
import {act} from 'react-dom/test-utils';
import * as dummyData from './dummyData'

const props={
    "cycleRef":{current:"select"},
    "isAssign": true,
    "setPopup":jest.fn()
}

describe('<ModuleListDrop/> Positive Scenarios',()=>{
    let state={
        mindmap:{
            moduleList:dummyData.moduleList,
            proj:"5fb4fc98f4da702833d7e0a0",
            selectedModule:{}
        }
    }
    let wrapper;
    let mockDispatch;
    beforeEach(async ()=>{
        mockDispatch=jest.fn();
        jest.spyOn(reactRedux,'useDispatch').mockImplementation(()=>{return mockDispatch});
        const mockstore=createStore(reducer,state);
        jest.spyOn(api,'getModules').mockImplementation(()=>{return Promise.resolve({completeFlow:true})})
        wrapper=mount(<Provider store={mockstore}><ModuleListDrop {...props}/></Provider>);
    });
    afterEach(()=>{
        jest.restoreAllMocks();
    })
    it('Should render all the components before and after clicking the dropdown button',()=>{
        // Assert that the dropDown is rendered without the modules
        expect(findByTestAtrr(wrapper,'dropDown').length).toBe(1)
        findByTestAtrr(wrapper,'dropDown').simulate('click')
        wrapper.update();
        // Lists all the required modules
        expect(findByTestAtrr(wrapper,'modules').length).toBe(4)
    });
    it('Should call the dispatch with respective data ',async()=>{
        findByTestAtrr(wrapper,'dropDown').simulate('click');
        findByTestAtrr(wrapper,'modules').at(2).simulate('click');
        await act(()=>Promise.resolve())
        wrapper.update();
        // Assert that the disptah has been called twice
        expect(mockDispatch).toHaveBeenCalledTimes(2)
    })
});
// Negative
describe('<ModuleListDrop/> Negative Scenarios',()=>{
    let wrapper;
    let mockDispatch;
    beforeEach(async ()=>{
        let state={
            mindmap:{
                moduleList:dummyData.moduleList,
                proj:"5fb4fc98f4da702833d7e0a0",
                selectedModule:{}
            }
        }
        mockDispatch=jest.fn();
        jest.spyOn(reactRedux,'useDispatch').mockImplementation(()=>{return mockDispatch});
        const mockstore=createStore(reducer,state);
        jest.spyOn(api,'getModules').mockImplementation(()=>{return Promise.resolve({completeFlow:false})})
        wrapper=mount(<Provider store={mockstore}><ModuleListDrop {...props}/></Provider>);
    });
    afterEach(()=>{
        jest.restoreAllMocks();
    });
    it('Should render the pop up to complete the tasks',async ()=>{     
        findByTestAtrr(wrapper,'dropDown').simulate('click');
        findByTestAtrr(wrapper,'modules').at(2).simulate('click');
        await act(()=>Promise.resolve())
        wrapper.update();
        // Assert that the popup occurs
        expect(props.setPopup).toHaveBeenCalledWith({title:'ERROR',content:"Please select a complete flow to assign tasks.",submitText:'Ok',show:true})
    });
});