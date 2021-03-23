import * as React from 'react';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import {mount}from 'enzyme';
import TaskBox from '../components/TaskBox';
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';
import * as dummyData from './dummyData'
import CalendarComp from '../components/CalendarComp';
import Complexity from '../components/Complexity';
document.body.innerHTML=dummyData.docTaskBox


const state={
    mindmap:{
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
        unassignTask:[],
        selectedProj:"5fb4fc98f4da702833d7e0a0"
    },
    login:{
        userinfo:{
            "user_id": "5fb4fbf9f4da702833d7e09e",
            "username": "aditya.k",
            "email_id": "aditya.k@slkgroup.com",
            "additionalrole": [],
            "firstname": "Aditya",
            "lastname": "Nayak",
            "role": "5db0022cf87fdec084ae49aa",
            "taskwflow": false,
            "token": "720",
            "dbuser": true,
            "ldapuser": false,
            "samluser": false,
            "openiduser": false,
            "rolename": "Test Lead",
            "pluginsInfo": [
                {
                    "pluginName": "Integration",
                    "pluginValue": true
                },
                {
                    "pluginName": "APG",
                    "pluginValue": false
                },
                {
                    "pluginName": "Dashboard",
                    "pluginValue": false
                },
                {
                    "pluginName": "Mindmap",
                    "pluginValue": true
                },
                {
                    "pluginName": "Neuron Graphs",
                    "pluginValue": false
                },
                {
                    "pluginName": "Performance Testing",
                    "pluginValue": false
                },
                {
                    "pluginName": "Reports",
                    "pluginValue": true
                },
                {
                    "pluginName": "Utility",
                    "pluginValue": true
                },
                {
                    "pluginName": "Webocular",
                    "pluginValue": false
                }
            ],
            "page": "plugin",
            "tandc": false
        }
    }
}
const props={
        "setPopup": jest.fn(),
        "clickUnassign": jest.fn(),
        "nodeDisplay": {
          "0": "{_id: \"5fbbf896f4da702833d7e0e1\", hidden: false, im…}",
          "1": "{_id: \"5fbbf896f4da702833d7e0e2\", hidden: false, im…}",
          "2": "{_id: \"5fbbf896f4da702833d7e0e3\", hidden: false, im…}",
          "3": "{_id: \"5fbbf896f4da702833d7e0e4\", hidden: false, im…}"
        },
        "releaseid": "0",
        "cycleid": "5fb4fc98f4da702833d7e09f",
        "ctScale": {
          "x": 240.17000000000002,
          "y": 159.5,
          "k": 1
        },
        "nid": "node_3",
        "dNodes":dummyData.dNodes,
        "setTaskBox": jest.fn(),
        "clickAddTask": jest.fn(),
        "displayError": jest.fn()
}
// Rendering of the component with the condition set: already propogated,assigned and no batch 
// liest of fields that has to be rendered
const itemList=['taskLabel','taskSelect','assignedtoLabel','assignedselect1','reviewLabel','reviewSelect1','startDateLabel','endDateLabel','complexityLabel','complexityValue','taskDetails','unassign','ok']
// list of fields that has not to be rendered 
const notDisplayed=['batchLabel','batchInput','assignedselect2','reviewSelect2','propogateLabel','propogateInput','reassign']

// Positive 
describe('<TaskBox/> Positive Scenarios',()=>{
    let wrapper;
    beforeEach(()=>{
        const mockStore=createStore(reducer,state)
        wrapper=mount(<Provider store={mockStore}><TaskBox {...props}/></Provider>);

    });
    it('should render the required fields in the taskbox ',()=>{
        
        for(let i=0;i<itemList.length;i++){
            // Assert that the required fields are being rendered(conditions::: already propogated, assigned,no batch)
            expect(findByTestAtrr(wrapper,itemList[i]).length).toBe(1);
        }
        // Assert that the task select length is 2
        expect(findByTestAtrr(wrapper,'taskSelect').find('option').length).toBe(2);
        // Assert tht the calendar comp is present in the start and end date
        expect(findByTestAtrr(wrapper,'startDate').find(CalendarComp).length).toBe(1);  
        expect(findByTestAtrr(wrapper,'endDate').find(CalendarComp).length).toBe(1);
        for(let i=0;i<notDisplayed.length;i++){
            expect(findByTestAtrr(wrapper,notDisplayed[i]).length).toBe(0)
        }
    });
    it('Should show the complexity modal',()=>{
        expect(wrapper.find(Complexity).length).toBe(0)
        findByTestAtrr(wrapper,'complexity').childAt(1).simulate('click',{stopPropagation:jest.fn(),nativeEvent:false});
        wrapper.update();
        expect(wrapper.find(Complexity).length).toBe(1);
    })
})