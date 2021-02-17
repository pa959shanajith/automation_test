import React from 'react';
import {findByTestAtrr, checkProps} from '../../../setupTests';
import { shallow,mount}from 'enzyme';
import { CreateObjectModal, EditObjectModal } from '../components/CustomObjectModal';
import ModalContainer from '../../global/components/ModalContainer'
import * as api from '../api';
import { act } from 'react-dom/test-utils';

const setUp=()=>{
    const wrapper=mount(<CreateObjectModal {...props}/>);
    return wrapper
}
const changeInput=(wrapper,inputFields)=>{
    let modalContainer=wrapper.find(ModalContainer);
    inputFields.forEach((item,index)=>{
        if (item==='createObjectInput')    findByTestAtrr(modalContainer,'createObjectInput').simulate('change',{target:{value:'box',name:'objName'}});
        else if(item==='createObjectType') findByTestAtrr(modalContainer,'createObjectType').simulate('change',{target:{value:'input-txtbox'}});
        else if(item==='enterURLInput')    findByTestAtrr(modalContainer,'enterURLInput').simulate('change',{target:{value:'google.com',name:'url'}});
        else if(item==='enterNameInput')   findByTestAtrr(modalContainer,'enterNameInput').simulate('change',{target:{value:'input',name:'name'}});
})
wrapper.update();
return wrapper;
}

const props={
    "scrapeItems": [
      {
        "objId": "5fcdc03921f3b014dbfb6029",
        "objIdx": 0,
        "val": 0,
        "tag": "table",
        "hide": false,
        "title": "table_NONAME1_tbl",
        "custname": "table_NONAME1_tbl",
        "isCustom": false
      },
      {
        "objId": "5fcdc03921f3b014dbfb602a",
        "objIdx": 1,
        "val": 1,
        "tag": "h3",
        "hide": false,
        "title": "Using ui:inputDateTime_elmnt",
        "custname": "Using ui:inputDateTime_elmnt",
        "isCustom": false
      },
      {
        "objId": "5fcdc03921f3b014dbfb602b",
        "objIdx": 2,
        "val": 2,
        "tag": "table",
        "hide": false,
        "title": "date_table1_tbl",
        "custname": "date_table1_tbl",
        "isCustom": false
      },
      {
        "objId": "5fce192821f3b014dbfb607c",
        "objIdx": 3,
        "val": 3,
        "tag": "input",
        "hide": false,
        "title": "textbox_txtbox",
        "custname": "textbox_txtbox",
        "disabled": true,
        "decryptFlag": true
      },
      {
        "objId": "5feaaaefd2ce8ecfe968968a",
        "objIdx": 4,
        "val": 4,
        "tag": "h3",
        "hide": false,
        "title": "e-Library_elmnt",
        "custname": "e-Library_elmnt",
        "isCustom": false
      },
      {
        "objId": "5feaaaefd2ce8ecfe968968b",
        "objIdx": 5,
        "val": 5,
        "tag": "label",
        "hide": false,
        "title": "Surat Municipal Corporation _elmnt",
        "custname": "Surat Municipal Corporation _elmnt",
        "isCustom": false
      },
      {
        "objId": "5feb0d65d2ce8ecfe968969d",
        "objIdx": 6,
        "val": 6,
        "tag": "table",
        "hide": false,
        "title": "LocalTable_tbl",
        "custname": "LocalTable_tbl",
        "isCustom": false
      }
    ],
    "newScrapedData": [],
    "setNewScrapedData":jest.fn(),
    "setSaved": jest.fn(),
    "setShow": jest.fn(),
    "setShowPop": jest.fn(),
    "updateScrapeItems":jest.fn() 
}

// Positive

describe('<CustomObjectModel/> Positive Scenarios',()=>{
    it('Should contain the expected and required props',()=>{
        const expectedProps={
            "scrapeItems": [1,2,3,4],
            "newScrapedData": [],
            "setNewScrapedData":jest.fn(),
            "setSaved": jest.fn(),
            "setShow": jest.fn(),
            "setShowPop": jest.fn(),
            "updateScrapeItems":jest.fn() 
        }
        const propsError=checkProps(CreateObjectModal,expectedProps)
        expect(propsError).toBeUndefined()
    })
})

describe('<CustomObjectModal/> Positive Scenarios',()=>{
    let wrapper;
    beforeEach(async ()=>{
        wrapper=setUp();
        jest.spyOn(api,'userObjectElement_ICE').mockResolvedValueOnce(" ")
        
    });
    afterEach(()=>{
        jest.resetAllMocks()
    })
    it('Should contain the units in the modal content',()=>{   
        let modalContainer=wrapper.find(ModalContainer)
        expect(findByTestAtrr(modalContainer,'createObjectRow').length).toBe(1);
        expect(findByTestAtrr(modalContainer,'createObjectInput').length).toBe(1);
        expect(findByTestAtrr(modalContainer,'createObjectType').length).toBe(1);
        expect(findByTestAtrr(modalContainer,'enterURL').length).toBe(1);
        expect(findByTestAtrr(modalContainer,'enterName').length).toBe(1);
        expect(findByTestAtrr(modalContainer,'enterrelXpath').length).toBe(1);
        expect(findByTestAtrr(modalContainer,'enterabsXpath').length).toBe(1);
        expect(findByTestAtrr(modalContainer,'enterID').length).toBe(1);
        expect(findByTestAtrr(modalContainer,'enterQuery').length).toBe(1);
        expect(findByTestAtrr(modalContainer,'saveButton').length).toBe(1)
        expect(findByTestAtrr(modalContainer,'submit').length).toBe(1)
        expect(findByTestAtrr(modalContainer,'reset').length).toBe(1)
        expect(findByTestAtrr(modalContainer,'submit').prop('disabled')).toBeTruthy()
    });
    it('Should reset the values that are entered',()=>{    
        let modalContainer
        wrapper=changeInput(wrapper,["createObjectInput","enterURL"])
        modalContainer=wrapper.find(ModalContainer)
        findByTestAtrr(modalContainer,'reset').simulate('click');
        wrapper.update();
        modalContainer=wrapper.find(ModalContainer);
        expect(findByTestAtrr(modalContainer,'createObjectInput').prop('value')).toBe("");
        expect(findByTestAtrr(modalContainer,'createObjectInput').find('input').prop('value')).toBe("");
    });
    it('Should add new item row when clicked on plus button and delete the new item when clicked on delete button',()=>{
        let modalContainer=wrapper.find(ModalContainer)
        findByTestAtrr(modalContainer,'objectAddButton').simulate('click');
        wrapper.update();
        modalContainer=wrapper.find(ModalContainer);
        expect(findByTestAtrr(modalContainer,'ssCreateObjectItem').length).toBe(2);
        const secItem=findByTestAtrr(modalContainer,'ssCreateObjectItem').at(1)
        findByTestAtrr(secItem,'objectDeleteButton').simulate('click');
        wrapper.update();
        modalContainer=wrapper.find(ModalContainer);
        expect(findByTestAtrr(modalContainer,'ssCreateObjectItem').length).toBe(1);
    });  
    it('Should be able to click on submit button and popup of object saved should appear',async ()=>{
        let modalContainer;
        wrapper=changeInput(wrapper,["createObjectInput","createObjectType","enterURLInput","enterNameInput"])
        modalContainer=wrapper.find(ModalContainer);
        findByTestAtrr(modalContainer,'saveButton').simulate('click');
        await act(()=>Promise.resolve())
        wrapper.update()
        modalContainer=wrapper.find(ModalContainer);
        // Assert that the submit button is clickable 
        expect(findByTestAtrr(modalContainer,'submit').prop('disabled')).toBeFalsy()

        findByTestAtrr(modalContainer,'submit').simulate('click')
        
        // Assert that the pop od object created has appeared
        expect(props.setShowPop).toHaveBeenNthCalledWith(1,{title: "Add Object", content: "Objects has been created successfully."})
        //Assert the props that are passed called when object is created successfully
        expect(props.setNewScrapedData).toHaveBeenCalled()
        expect(props.updateScrapeItems).toHaveBeenCalled()
        
    });  
})


// Negative
describe('<CustomObjectModal/> Negative Scenarios',()=>{
    let wrapper;
    beforeEach(()=>{
        wrapper=setUp();
        jest.spyOn(api,'userObjectElement_ICE').mockResolvedValueOnce("unavailableLocalServer")
                                               .mockResolvedValueOnce("fail")                                                                                
    });
    afterEach(()=>{
        jest.resetAllMocks()
    });
    it('Should error when create object is submitted without any inputs',()=>{    
        let modalContainer=wrapper.find(ModalContainer);
        findByTestAtrr(modalContainer,'saveButton').simulate('click');
        wrapper.update();
        modalContainer=wrapper.find(ModalContainer);
        expect(findByTestAtrr(modalContainer,'createObjectInput').prop('className')).not.toBe('createObj_input');

        findByTestAtrr(modalContainer,'createObjectInput').simulate('change',{target:{value:'box',name:'objName'}});
        findByTestAtrr(modalContainer,'saveButton').simulate('click');
        wrapper.update();
        modalContainer=wrapper.find(ModalContainer);
        expect(findByTestAtrr(modalContainer,'createObjectType').prop('className')).not.toBe('createObj_objType');
        
        findByTestAtrr(modalContainer,'createObjectInput').simulate('change',{target:{value:'box',name:'objName'}});
        findByTestAtrr(modalContainer,'createObjectType').simulate('change',{target:{value:'input-txtbox'}})
        findByTestAtrr(modalContainer,'saveButton').simulate('click');
        wrapper.update();
        modalContainer=wrapper.find(ModalContainer);
        expect(findByTestAtrr(modalContainer,'enterURLInput').prop('className')).not.toBe('createObj_input');
    });
    it('Should raise popup with message "Please enter at least one property"',()=>{
        let modalContainer
        wrapper=changeInput(wrapper,["createObjectInput","createObjectType","enterURLInput"])
        modalContainer=wrapper.find(ModalContainer)
        findByTestAtrr(modalContainer,'saveButton').simulate('click');
        expect(props.setShowPop.mock.calls).toEqual([[{title: 'Warning!', content: "Please enter at least one property"}]])
    });
    it('Should raise popup with respective messages',async ()=>{
        let modalContainer
        wrapper=changeInput(wrapper,["createObjectInput","createObjectType","enterURLInput","enterNameInput"])
        modalContainer=wrapper.find(ModalContainer)
        findByTestAtrr(modalContainer,'saveButton').simulate('click');
        await Promise.resolve();
        wrapper.update()
        modalContainer=wrapper.find(ModalContainer);
        expect(props.setShowPop).toHaveBeenNthCalledWith(1,{title: "Fail", content: "Failed to create object ICE not available"})
        findByTestAtrr(modalContainer,'saveButton').simulate('click');
        await Promise.resolve();
        wrapper.update();
        modalContainer=wrapper.find(ModalContainer);
        expect(props.setShowPop).toHaveBeenNthCalledWith(2,{title: "Fail", content: "Failed to create object"})
    });
})
describe('<CustomObjectModal/> Negative Scenarios',()=>{
    let wrapper;
    beforeEach(()=>{
        wrapper=setUp();
        jest.spyOn(api,'userObjectElement_ICE').mockResolvedValueOnce(" ")
    })
    it('Should be able to click on submit button and popup of error should appear',async ()=>{
        
        let modalContainer;
        findByTestAtrr(wrapper.find(ModalContainer),'createObjectInput').simulate('change',{target:{value:'LocalTable',name:'objName'}});
        findByTestAtrr(wrapper.find(ModalContainer),'createObjectType').simulate('change',{target:{value:'Table-tbl'}});
        wrapper.update();
        wrapper=changeInput(wrapper,["enterURLInput","enterNameInput"])
        
        modalContainer=wrapper.find(ModalContainer);
        findByTestAtrr(modalContainer,'saveButton').simulate('click');
        await act(()=>Promise.resolve())
        wrapper.update()
        modalContainer=wrapper.find(ModalContainer);
        findByTestAtrr(modalContainer,'submit').simulate('click')
        wrapper.update()
        // // Assert that the pop od object created has appeared
        expect(props.setShowPop).toHaveBeenNthCalledWith(1,{title: 'Create Object', content: `Object Characteristics are same for LocalTable!`})
    });
})