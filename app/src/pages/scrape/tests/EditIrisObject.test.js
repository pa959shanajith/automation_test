import * as React from 'react';
import {findByTestAtrr, checkProps} from '../../../setupTests';
import { mount}from 'enzyme';
import EditIrisObject from '../components/EditIrisObject';
import * as reactRedux from 'react-redux';
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';
import * as  api from '../api';

// dummy props to mount the component EditIrisObject
const props=
    {
        "utils": {
          "operation": "editIrisObject",
          "object": {
            "objId": "602f4b7a2327706263f85159",
            "objIdx": 23,
            "val": 23,
            "tag": "iris;UnrecognizableObject",
            "hide": false,
            "title": "img_object_376_105_985_330",
            "custname": "img_object_376_105_985_330",
            "hiddentag": "No",
            "checked": true,
            "url": "",
            "xpath": "iris;img_object_376_105_985_330;376;105;985;330;relative",
            "editable": true
          },
          "cord": "b'randomString'",
          "modifyScrapeItem":jest.fn(),
    
        },
        "taskDetails": {
          "projectid": "5de4e4aed9cdd57f4061bca5",
          "screenid": "5de4e4afd9cdd57f4061c7ef",
          "screenname": "Batch_Execution_Screen1",
          "versionnumber": 0
        },
        setShow:jest.fn(),
        setShowPop:jest.fn()
      }

describe('<EditIris/> Positive Sceanrios',()=>{
    let wrapper;
    
    beforeEach(()=>{
        jest.spyOn(api,'updateIrisDataset').mockResolvedValueOnce('success')
        wrapper=mount(<EditIrisObject {...props}/>);
    });
    afterEach(()=>{
        jest.resetAllMocks();
    });
    it('Should render all the fields in the edit iris pop up field',()=>{

        expect(findByTestAtrr(wrapper,'objTypeHeading').length).toBe(1);
        expect(findByTestAtrr(wrapper,'selectObjType').length).toBe(1);
        // Assert that the length of items in the select option is 13
        expect(findByTestAtrr(wrapper,'selectObjType').children().length).toBe(13);
        expect(findByTestAtrr(wrapper,'objStatusHeading').length).toBe(0);
        expect(findByTestAtrr(wrapper,'selectobjStatus').length).toBe(0);
        expect(findByTestAtrr(wrapper,'objTag').length).toBe(1);
        expect(findByTestAtrr(wrapper,'objTagValue').length).toBe(1);
        // Assert that iris image is present
        expect(findByTestAtrr(wrapper,'irirsImage').length).toBe(1);

    });
    it('Should submit edit iris form',async ()=>{
        findByTestAtrr(wrapper,'selectObjType').simulate('change',{target:{value:'button'}});
        wrapper.update();
        findByTestAtrr(wrapper,'submit').simulate('click');
        await Promise.resolve();
        wrapper.update();
        // Assert that the setSHowPop and modifyScrapeItems has been called after the iris object has been updated
        expect(props.setShowPop).toHaveBeenCalled()
        expect(props.utils.modifyScrapeItem).toHaveBeenCalledWith(23,{custname: 'img_object_376_105_985_330',tag: `iris;button`,url: '',xpath: "iris;img_object_376_105_985_330;376;105;985;330;relative",editable: true},true)
    });
});

describe('<EditIrisObject/> Positive Sceanrios',()=>{
    let wrapper;
    beforeEach(()=>{
        jest.spyOn(api,'updateIrisDataset').mockResolvedValueOnce(' ')
        wrapper=mount(<EditIrisObject {...props}/>);
    });
    afterEach(()=>{
        jest.resetAllMocks();
    });
    it('Should raise "Failed to update Iris object" popup',async ()=>{
        findByTestAtrr(wrapper,'selectObjType').simulate('change',{target:{value:'button'}});
        wrapper.update();
        findByTestAtrr(wrapper,'submit').simulate('click');
        await Promise.resolve();
        wrapper.update()
        expect(props.setShowPop).toHaveBeenCalled()

    })
})