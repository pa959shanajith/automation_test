import * as React from 'react';
import {findByTestAtrr, checkProps} from '../../../setupTests';
import {mount}from 'enzyme';
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';
import ExportMapButton from '../components/ExportMapButton'
import * as api from '../api';
import * as dummyData from './dummyData'
import {ModalContainer} from '../../global';
const props={
    "isAssign": false,
    "setBlockui": jest.fn(),
    "setPopup": jest.fn(),
    "displayError": jest.fn(),
    "releaseRef": {
      "current": "<select />"
    },
    "cycleRef": {
      "current": "<select />"
    }
}
const store={
    mindmap:{
        selectedModule:dummyData.selectedModule,
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
describe('<ExportMapButton> Positive Scenarios',()=>{
    it('Should contain the required and expected props',()=>{
        const expectedProps={
            "isAssign": false,
            "setBlockui": jest.fn(),
            "setPopup": jest.fn(),
            "displayError": jest.fn(),
            "releaseRef": { "current": "<select />"},
            "cycleRef": {"current": "<select />"}
        }
        const propsError=checkProps(ExportMapButton,expectedProps);
        expect(propsError).toBeUndefined()
    })
})
describe('<ExportMapButton> Positive Scenarios',()=>{
    let wrapper;
    beforeEach(()=>{
        const mockStore=createStore(reducer,store);
        jest.spyOn(api,'exportToExcel').mockImplementation(()=>{return Promise.resolve("file")});
        window.URL.createObjectURL=jest.fn().mockReturnValue("blob:http://localhost:3000/54dae0fd-df17-4349-a77f-14faedd94c4f")
        window.URL.revokeObjectURL=jest.fn() 
        wrapper=mount(<Provider store={mockStore}><ExportMapButton {...props}/></Provider>)
    });
    afterEach(()=>{
        jest.resetAllMocks();
    })
    it('Should render the required fields of button and modal container',()=>{
        // Assert that the export Button is present
        expect(findByTestAtrr(wrapper,'exportButton').length).toBe(1);
        findByTestAtrr(wrapper,'exportButton').simulate('click');
        wrapper.update();
        // Assert that after clicking Export Button the ModalContainer gets displayed
        expect(wrapper.find(ModalContainer).length).toBe(1);
        // Assert that the modal container contains all the required fields for the export 
        expect(findByTestAtrr(wrapper,'exportRow').length).toBe(2);
        // Assert that the name of the filename is same as the name of the module
        expect(findByTestAtrr(wrapper,'exportRow').at(0).find('input').prop('defaultValue')).toBe(dummyData.selectedModule.name);
        // Assert that modalContainer contains the footer Export Button
        expect(findByTestAtrr(wrapper,'footerExportButton').length).toBe(1);
    });
    it('Should export in excel',async ()=>{
        expect(findByTestAtrr(wrapper,'exportButton').length).toBe(1);
        findByTestAtrr(wrapper,'exportButton').simulate('click');
        wrapper.update();
        const exportContainer=wrapper.find(ModalContainer);
        findByTestAtrr(exportContainer,'exportRow').at(1).find('option').at(1).instance().selected=true;
        findByTestAtrr(exportContainer,'exportRow').at(1).find('select').simulate('change',{current:{value:'excel'}});
        wrapper.update();
        findByTestAtrr(wrapper,'footerExportButton').simulate('click');
        await Promise.resolve();
        wrapper.update();
        expect(props.setBlockui).toHaveBeenCalledWith({show:true,content:'Exporting Mindmap ...'}); 
        expect(props.setPopup).toHaveBeenCalledWith({title:'Mindmap',content:'Data Exported Successfully.',submitText:'Ok',show:true})
    });
});

// Negative
describe('<ExportMapButton> Negative Scenarios>',()=>{
    let wrapper;
    beforeEach(()=>{
        const mockStore=createStore(reducer,store);
        jest.spyOn(api,'exportToExcel').mockImplementation(()=>{return Promise.reject("failure")});
        window.URL.createObjectURL=jest.fn().mockReturnValue("blob:http://localhost:3000/54dae0fd-df17-4349-a77f-14faedd94c4f")
        window.URL.revokeObjectURL=jest.fn() 
        wrapper=mount(<Provider store={mockStore}><ExportMapButton {...props}/></Provider>)
    });
    it('Should display in error',async ()=>{
        expect(findByTestAtrr(wrapper,'exportButton').length).toBe(1);
        findByTestAtrr(wrapper,'exportButton').simulate('click');
        wrapper.update();
        const exportContainer=wrapper.find(ModalContainer);
        findByTestAtrr(exportContainer,'exportRow').at(1).find('option').at(1).instance().selected=true;
        findByTestAtrr(exportContainer,'exportRow').at(1).find('select').simulate('change',{current:{value:'excel'}});
        wrapper.update();
        findByTestAtrr(wrapper,'footerExportButton').simulate('click');
        await Promise.resolve();
        wrapper.update();
        expect(props.displayError).toHaveBeenCalled();
    });
});

