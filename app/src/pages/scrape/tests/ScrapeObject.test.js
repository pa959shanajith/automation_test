import * as React from 'react';
import {findByTestAtrr, checkProps} from '../../../setupTests';
import { mount}from 'enzyme';
import ScrapeObject from '../components/ScrapeObject';
import * as reactRedux from 'react-redux';
import * as actions from '../state/action'

const props={
    "activeEye": null,
    "object": {
        "objId": "6030dd3af6dadf602e5650cf",
        "objIdx": 0,
        "val": 0,
        "tag": "img",
        "hide": false,
        "title": "img_NONAME1_img",
        "custname": "img_NONAME1_img",
        "isCustom": false
        },
    "idx":0,
    "hideCheckbox":false,
    "setActiveEye":jest.fn(),
    "updateChecklist":jest.fn(),
    "modifyScrapeItem":jest.fn()
}
const setUp=()=>{
    let wrapper=mount(<ScrapeObject {...props}/>);
    return wrapper;
}
describe('<ScrapeObject/> Positive Scenarios',()=>{
    let mockDispacth=jest.fn();
    let wrapper;
    beforeEach(()=>{
        jest.spyOn(reactRedux,'useDispatch').mockReturnValue(mockDispacth);
        wrapper=setUp()
    });
    afterEach(()=>{
        jest.resetAllMocks()
    });
    it('Should render all the required components',()=>{
        //  Assert that the conponents are present
        expect(findByTestAtrr(wrapper,'eyeIcon').length).toBe(1);
        expect(findByTestAtrr(wrapper,'objectInput').length).toBe(0);
        expect(findByTestAtrr(wrapper,'checkBox').length).toBe(1);
        expect(findByTestAtrr(wrapper,'objectName').length).toBe(1);
        findByTestAtrr(wrapper,'objectName').simulate('doubleclick');
        // Assert that the object name is editable after double clicking ion the object name
        expect(findByTestAtrr(wrapper,'objectInput').length).toBe(1);
    });

    it('Should call methods with appropriate object value',()=>{
        findByTestAtrr(wrapper,'eyeIcon').simulate('click');
        // Assert that the setActiveEYe has been called with the respective obj val
        expect(props.setActiveEye).toHaveBeenNthCalledWith(1,0);
        // Assert that the dispacth hook is executed with required parameters
        expect(mockDispacth).toHaveBeenNthCalledWith(1,{type: actions.SET_OBJVAL, payload: {val:0}});
        
        findByTestAtrr(wrapper,'checkBox').simulate('change');
        // Assert that checkList is being updated
        expect(props.updateChecklist).toHaveBeenNthCalledWith(1,0);
    });
    it('Should change the object name',()=>{
        findByTestAtrr(wrapper,'objectName').simulate('doubleclick');
        wrapper.update()
        findByTestAtrr(wrapper,'objectInput').simulate('change',{target:{value:"newObjectName"}})
        findByTestAtrr(wrapper,'objectInput').simulate('keydown',{keyCode:13});
        // Assert that object name has been updated with  name 
        expect(props.modifyScrapeItem).toHaveBeenNthCalledWith(1,0,{custname: "newObjectName"})
    })
})