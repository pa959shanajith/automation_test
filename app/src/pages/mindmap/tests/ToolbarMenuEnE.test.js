import * as React from 'react';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import {mount}from 'enzyme';
import ToolbarMenuEnE from '../components/ToolbarMenuEnE';
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';
import * as dummyData from './dummyData'
import ModuleListDropEnE from '../components/ModuleListDropEnE';
const props={
    "setBlockui": jest.fn(),
    "setPopup":jest.fn()
}
const state={
    mindmap:{
        selectedProj:"5fb4fc98f4da702833d7e0a0",
        projectList:{
            "5fb4fc98f4da702833d7e0a0": {
                "apptype": "5db0022cf87fdec084ae49b6",
                "name": "test",
                "apptypeName": "Web",
                "id": "5fb4fc98f4da702833d7e0a0",
                "releases": [
                    {
                        "cycles": [
                            {
                                "_id": "5fb4fc98f4da702833d7e09f",
                                "name": "c1"
                            }
                        ],
                        "name": "r1"
                    }
                ],
                "domains": "Banking"
            },
            "5fdde98cd2ce8ecfe968964a": {
                "apptype": "5db0022cf87fdec084ae49af",
                "name": "desk",
                "apptypeName": "Desktop",
                "id": "5fdde98cd2ce8ecfe968964a",
                "releases": [
                    {
                        "cycles": [
                            {
                                "_id": "5fdde98cd2ce8ecfe9689649",
                                "name": "c1"
                            }
                        ],
                        "name": "r1"
                    }
                ],
                "domains": "Banking"
            }
        },
        moduleList:dummyData.moduleList,
        selectedModule:{}
    }
}
// Positive
describe('<ToolbarMenuEnE/> Positive Scenarios',()=>{
    it('Should contain the reqiured and expected props',()=>{
        const expectedProps={
            "setBlockui": ()=>{},
            "setPopup": ()=>{}
        }
        const propsError=checkProps(ToolbarMenuEnE,expectedProps);
        expect(propsError).toBeUndefined();
    });
});
describe('<ToolbarMenuEnE/> Positive Scenarios',()=>{
    let wrapper;
    beforeEach(async()=>{
        const mockStore=createStore(reducer,state);
        wrapper=mount(<Provider store={mockStore}><ToolbarMenuEnE {...props}/></Provider>);
        await Promise.resolve()
    });
    it('Should render the component',()=>{
        // Assert that the fields of the component exist
        expect(findByTestAtrr(wrapper,'projectLabel').length).toBe(1);
        expect(findByTestAtrr(wrapper,'projectSelect').length).toBe(1);
        expect(findByTestAtrr(wrapper,'projectSelect').children().length).toBe(2);
        expect(findByTestAtrr(wrapper,'search').length).toBe(1);
        expect(findByTestAtrr(wrapper,'search').children().length).toBe(2);
        expect(findByTestAtrr(wrapper,'search').find('input').length).toBe(1);
        expect(findByTestAtrr(wrapper,'search').find('img').length).toBe(1);
        // Assert that modulelistdrop for EnE is rendered
        expect(wrapper.find(ModuleListDropEnE).length).toBe(1);
    });
});