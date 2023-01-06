import React from 'react';
import {findByTestAtrr, checkProps} from '../../../setupTests';
import { shallow}from 'enzyme';
import AddObjectModal from '../components/AddObjectModal';
import ModalContainer from '../../global/components/ModalContainer'

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
    "setShow":jest.fn(),
    "setScrapeItems":jest.fn(),
    "setSaved":jest.fn(),
    "setShowPop":jest.fn()
}
const setUp=()=>{
  const wrapper=shallow(<AddObjectModal {...props}/>)
  return wrapper;
}
// True Positive
describe('<AddObjectModal/> Positive Scenarios',()=>{
  it('Should contain the expected and required props',()=>{
      const expectedProps={
        "scrapeItems": [{"A":1},{"B":2}],
        "setShow":jest.fn(),
        "setScrapeItems":jest.fn(),
        "setSaved":jest.fn(),
        "setShowPop":jest.fn()
      }
      const propsError=checkProps(AddObjectModal,expectedProps)
      expect(propsError).toBeUndefined()
  })
});
describe('<AddObjectModal/> Positive Sceanrios',()=>{
    it('should contian the required and expected props',()=>{
        const expectedProps={
            "scrapeItems":[1,2,3,4],
            "setShow":jest.fn(),
            "setScrapeItems":jest.fn(),
            "setSaved":jest.fn(),
            "setShowPop":jest.fn()
        }
        const propsError=checkProps(AddObjectModal,expectedProps)
        expect(propsError).toBeUndefined()
    })
});
describe('<AddObjectModel/> Positive Sceanrios',()=>{
    let wrapper;
    beforeEach(()=>{
        wrapper=setUp();
    });
    afterEach(()=>{
      jest.resetAllMocks();
    })
    it('Should render the full modal container',()=>{    
        // Assert that modal is rendered
        expect(findByTestAtrr(wrapper,'ssObjectModal').length).toBe(1);
    });
    it('Should contain the the required contents in the modal container',()=>{
       
        const modalContainer=wrapper.find(ModalContainer).dive();
        // Assert that units of the modal is present
        expect(findByTestAtrr(modalContainer,'addObjectInput').length).toBe(1);
        expect(findByTestAtrr(modalContainer,'addObjectTypeSelect').length).toBe(1);
        expect(findByTestAtrr(modalContainer,'addObjectButton').length).toBe(1);
        expect(findByTestAtrr(modalContainer,'reset').length).toBe(1);
        expect(findByTestAtrr(modalContainer,'submit').length).toBe(1)
    });
    
    it('Should clear the inputs when reset is clicked',()=>{
      let modalContainer=wrapper.find(ModalContainer).dive();
      findByTestAtrr(modalContainer,'addObjectInput').simulate('change',{target:{value:'button'}})
      findByTestAtrr(modalContainer,'addObjectTypeSelect').simulate('change',{target:{value:'Link'}})
      wrapper.update()
      modalContainer=wrapper.find(ModalContainer).dive()
      findByTestAtrr(modalContainer,'reset').simulate('click')
      wrapper.update()
      modalContainer=wrapper.find(ModalContainer).dive()
      //Assert that input field and select option values are reset 
      expect(findByTestAtrr(modalContainer,'addObjectInput').prop('value')).toBe("")
      expect(findByTestAtrr(modalContainer,'addObjectTypeSelect').prop('value')).toBe('')
    });
    it('Should add input item when clicked on plus icon and delete when clicked on delete icon',()=>{
      
      let modalContainer=wrapper.find(ModalContainer).dive();
      const plusButton=findByTestAtrr(modalContainer,'addObjectButton')
      plusButton.simulate('click')
      wrapper.update();
      modalContainer=wrapper.find(ModalContainer).dive();
      // Assert that modal item has been added
      expect(findByTestAtrr(modalContainer,'objModalItem').length).toBe(2)
      let secItem=findByTestAtrr(modalContainer,'objModalItem').at(1)
      findByTestAtrr(secItem,'deleteObjectButton').simulate('click')
      wrapper.update()
      modalContainer=wrapper.find(ModalContainer).dive();
      // Assert that modal item has been deleted
      expect(findByTestAtrr(modalContainer,'objModalItem').length).toBe(1)
    })
    it('Should accept the inputs and display the object saved popup',()=>{
      let modalContainer=wrapper.find(ModalContainer).dive();
      findByTestAtrr(modalContainer,'addObjectInput').simulate('change',{target:{value:'button'}})
      findByTestAtrr(modalContainer,'addObjectTypeSelect').simulate('change',{target:{value:'a-lnk'}})
      wrapper.update()
      modalContainer=wrapper.find(ModalContainer).dive();
      let submitButton=findByTestAtrr(modalContainer,'submit')
      submitButton.simulate('click')
      wrapper.update();
      expect(props.setShowPop.mock.calls).toEqual([[{title: "Add Object", content: "Element(s) added sucessfully."}]])
    })
});
// Negative Sceanrios
describe('<AddObjectModel/> Negative Sceanrios',()=>{
    let wrapper;
    beforeEach(()=>{
      wrapper=setUp();
    })
    afterEach(()=>{
      jest.resetAllMocks();
    })
    it('Should error when add object form is submitted without object name ',()=>{ 
      let modalContainer=wrapper.find(ModalContainer).dive();
      expect(findByTestAtrr(modalContainer,'addObjectInput').prop('className')).toBe('addObj_name')
      findByTestAtrr(modalContainer,'submit').simulate('click')
      wrapper.update();
      modalContainer=wrapper.find(ModalContainer).dive();
      expect(findByTestAtrr(modalContainer,'addObjectInput').prop('className')).not.toBe('addObj_name')
    });
    it('Should error when add object form is submitted when object type isn\'t selected',()=>{
      let modalContainer=wrapper.find(ModalContainer).dive();
      findByTestAtrr(modalContainer,'addObjectInput').simulate('change',{target:{value:'button'}})
      wrapper.update();
      modalContainer=wrapper.find(ModalContainer).dive();
      expect(findByTestAtrr(modalContainer,'addObjectTypeSelect').prop('className')).toBe('addObj_objType');
      findByTestAtrr(modalContainer,'submit').simulate('click');
      wrapper.update();
      modalContainer=wrapper.find(ModalContainer).dive();
      expect(findByTestAtrr(modalContainer,'addObjectTypeSelect').prop('className')).not.toBe('addObj_objType');
    });
    it('Should throw popup with message Object Charcertistics are same',()=>{  
      let modalContainer=wrapper.find(ModalContainer).dive();
      findByTestAtrr(modalContainer,'addObjectInput').simulate('change',{target:{value:'LocalTable'}}) 
      findByTestAtrr(modalContainer,'addObjectTypeSelect').simulate('change',{target:{value:'Table-tbl'}})
      wrapper.update()
      modalContainer=wrapper.find(ModalContainer).dive();
      let submitButton=findByTestAtrr(modalContainer,'submit')
      submitButton.simulate('click')
      wrapper.update();
      expect(props.setShowPop.mock.calls).toEqual([[{title: 'Add Objects', content: `Object Characteristics are same for LocalTable!`}]])
    })
});