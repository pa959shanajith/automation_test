import * as React from 'react';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import {mount,shallow}from 'enzyme';
import {Provider}  from 'react-redux';
import * as reactRedux from 'react-redux'
import {createStore} from 'redux';
import reducer from '../state/reducer';
import SaveMapButton from '../components/SaveMapButton';
import * as dummyData from './dummyData';
document.body.innerHTML=
'<svg class="ct-actionBox" id="ct-save">'+
'<g id="ct-saveAction" class="ct-actionButton">'+
'<rect x="0" y="0" rx="12" ry="12" width="80px" height="25px">'+
'</rect>'+
'<text x="23" y="18">Save</text>'+
'</g>'+
'</svg>'

const props={
    "isEnE":false,
    "isAssign": false,
    "dNodes": dummyData.dNodes,
    "cycId": "5fb4fc98f4da702833d7e09f",
    "setPopup": jest.fn(),
    "setBlockui":jest.fn()
}

const state={
    mindmap:{
        deletedNodes:[],
        unassignTask:[],
        selectedProj:"5fb4fc98f4da702833d7e0a0",
        initEnEProj:undefined,
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
    }
}
// Positive
describe('<SaveMapButton/> Positive Scenarios',()=>{
    let wrapper;
    const mockDisptach=jest.fn();
    beforeEach(async ()=>{
        jest.spyOn(reactRedux,'useDispatch').mockReturnValue(mockDisptach)
        const mockStore=createStore(reducer,state);
        wrapper=mount(<Provider store={mockStore}><SaveMapButton {...props}/></Provider>);
        await Promise.resolve()

    });
    afterEach(()=>{
        jest.resetAllMocks()
    })
    it('Should render the components',()=>{
        expect(findByTestAtrr(wrapper,'saveSVG').length).toBe(1)
    });
    it.skip('Should Show the saved popup',()=>{
        findByTestAtrr(wrapper,'saveSVG').simulate('click')
        expect(props.setPopup).toHaveBeenCalled();
    })
})