import * as React from 'react';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import {mount}from 'enzyme';
import ToolbarMenuAssign from '../components/ToolbarMenuAssign';
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';
const props={
    "cycleRef": {
      "current": "<select />"
    },
    "releaseRef": {
      "current": "<select />"
    },
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
        }
    }
}
// Positive
describe('<ToolbarMenuAssign/> Positive Scenarios',()=>{
    it('Should contain the reqiured and expected props',()=>{
        const expectedProps={
            "cycleRef": { "a": "1"},
            "releaseRef": {"b": "2"},
            "setBlockui": ()=>{},
            "setPopup":()=>{}
        }
        const propsError=checkProps(ToolbarMenuAssign,expectedProps)
        expect(propsError).toBeUndefined()
    });
});
describe('<ToolbarMenuAssign/> Positive Scenarios',()=>{
    let wrapper;
    beforeEach(async()=>{
        const mockStore=createStore(reducer,state);
        wrapper=mount(<Provider store={mockStore}><ToolbarMenuAssign {...props}/></Provider>);
        await Promise.resolve()
    })
    it('should render the component',async ()=>{
        // Assert that the required fields are being rendered
        expect(findByTestAtrr(wrapper,'projectLabel').length).toBe(1);
        expect(findByTestAtrr(wrapper,'projectSelect').length).toBe(1);
        expect(findByTestAtrr(wrapper,'releaseLablel').length).toBe(1);
        expect(findByTestAtrr(wrapper,'releaseSelect').length).toBe(1);
        expect(findByTestAtrr(wrapper,'cycleLabel').length).toBe(1);
        expect(findByTestAtrr(wrapper,'cycleSelect').length).toBe(1);
        expect(findByTestAtrr(wrapper,'searchSpan').length).toBe(1);
        expect(findByTestAtrr(wrapper,'searchSpan').find('input').length).toBe(1);
        expect(findByTestAtrr(wrapper,'searchSpan').find('img').length).toBe(1);
    });
    it('Should be able to select the cycle after selecting release and search for module name after selecting the cycle',()=>{
        findByTestAtrr(wrapper,'releaseSelect').find('option').at(1).instance().selected = true;
        findByTestAtrr(wrapper,'releaseSelect').simulate('change',{target:{value:"0"}})
        // Assert that cycle dropdowns is enabled after selecting the release id
        expect(findByTestAtrr(wrapper,'cycleSelect').children().length).toBe(2);
        // Asset that search input for module name is still disabled
        expect(findByTestAtrr(wrapper,'searchInput') .prop('disabled')).toBe(true);
        findByTestAtrr(wrapper,'cycleSelect').find('option').at(1).instance().selected = true;
        findByTestAtrr(wrapper,'cycleSelect').simulate('change',{target:{value:"5fb4fc98f4da702833d7e09f"}});
        // Search box should be enabled after selecting the release and cycle
        expect(findByTestAtrr(wrapper,'searchInput') .prop('disabled')).toBe(false);
    })
})
