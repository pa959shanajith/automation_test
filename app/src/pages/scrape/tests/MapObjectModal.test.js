import React from 'react';
import {mount}from 'enzyme';
import { act } from 'react-dom/test-utils';
import {findByTestAtrr, checkProps} from '../../../setupTests';
import reducer from '../state/reducer';
import * as api from '../api';
import * as  dummyData from './dummyData'
import MapObjectModal from '../components/MapObjectModal';

describe('<MapObjectModal/> Positive Scenarios',()=>{
    it('Should contain the expected and required props',()=>{
        const expectedProps={
            "scrapeItems": [{"a":1}],
            "current_task":dummyData.CT,
            "user_id": "5fb4fbf9f4da702833d7e09e",
            "role": "Test Lead",
            "fetchScrapeData":jest.fn(),
            "setShowPop": jest.fn(),
            "setShow":jest.fn()
          }
        const propsError=checkProps(MapObjectModal,expectedProps)
        expect(propsError).toBeUndefined()
    })
})

describe('<MapObjectModal/> Positive Scenarios',()=>{
    let wrapper;
    let props;
    beforeEach(()=>{
      props={
        scrapeItems:  [
            {
              "objId": "6030dd3af6dadf602e5650cf",
              "objIdx": 0,
              "val": 0,
              "tag": "img",
              "hide": false,
              "title": "img_NONAME1_img",
              "custname": "img_NONAME1_img",
              "isCustom": false
            },
            {
              "objId": "6030dd3af6dadf602e5650d1",
              "objIdx": 1,
              "val": 1,
              "tag": "button",
              "hide": false,
              "title": "btnK1_btn",
              "custname": "btnK1_btn",
              "isCustom": false
            },
            {
              "objId": "6030dd3af6dadf602e5650d2",
              "objIdx": 2,
              "val": 2,
              "tag": "input",
              "hide": false,
              "title": "boxadd_txtbox",
              "custname": "boxadd_txtbox",
              "isCustom": false
            },
            {
              "objId": "6030dd6cf6dadf602e5650d3",
              "objIdx": 3,
              "val": 3,
              "tag": "input",
              "hide": false,
              "title": "qwe_txtbox",
              "custname": "qwe_txtbox",
              "isCustom": true
            }
          ],
        current_task:dummyData.CT,
        user_id: "5fb4fbf9f4da702833d7e09e",
        role: "Test Lead",
        fetchScrapeData:jest.fn().mockResolvedValue("success"),
        setShow:jest.fn(),
        setShowPop: jest.fn(),
        
      }
      wrapper=mount(<MapObjectModal {...props}/>);
      jest.spyOn(api,'updateScreen_ICE').mockImplementation(()=>{return Promise.resolve("pass")}); 
    });
    afterEach(()=>{
      jest.resetAllMocks();
    });
    it('Should contain the required components in modal',()=>{
        // const wrapper=mount(<MapObjectModal {...props}/>);
        expect(findByTestAtrr(wrapper,'mapObjectScrapeObjectList').length).toBe(1);
        expect(findByTestAtrr(wrapper,'mapObjectHeading').length).toBe(1);
        expect(findByTestAtrr(wrapper,'mapObjectLabel').length).toBe(1);
        expect(findByTestAtrr(wrapper,'mapObjectListContent').length).toBe(1);
        expect(findByTestAtrr(wrapper,'mapObjectListItem').length).toBe(3)

        expect(findByTestAtrr(wrapper,'mapObjectCustomObjectList').length).toBe(1);
        expect(findByTestAtrr(wrapper,'mapObjectCustomHeading').length).toBe(1);
        expect(findByTestAtrr(wrapper,'mapObjectCustomContainer').length).toBe(1)

        expect(findByTestAtrr(wrapper,'showAll').length).toBe(1)
        expect(findByTestAtrr(wrapper,'unLink').length).toBe(1)
        expect(findByTestAtrr(wrapper,'submit').length).toBe(1)
    });
    it('Should render the custom scrape object list when clicked on the object type',()=>{
        expect(findByTestAtrr(wrapper,'mapObjectCustomListItem').length).toBe(0);
        findByTestAtrr(wrapper,'mapObjectTagHead').simulate('click');
        expect(findByTestAtrr(wrapper,'mapObjectCustomListItem').length).toBe(1);
    });
    it('Should drag and drop',()=>{
      findByTestAtrr(wrapper,'mapObjectTagHead').simulate('click');
      expect(findByTestAtrr(wrapper,'mapObjectListItem').length).toBe(1);
      const setData=jest.fn()
      findByTestAtrr(wrapper,'mapObjectListItem').simulate('dragStart',{dataTransfer:{setData:setData}})
      const getData=jest.fn().mockReturnValue('{"objId":"6030dd3af6dadf602e5650d2","objIdx":2,"val":2,"tag":"input","hide":false,"title":"boxadd_txtbox","custname":"boxadd_txtbox","isCustom":false}')
      findByTestAtrr(wrapper,'mapObjectCustomListItem').simulate('drop',{dataTransfer:{getData:getData}})
      expect(findByTestAtrr(wrapper,'mapObjectCustomListItem').text()).toBe('boxadd_txtbox')
    });
    it('Should submit the map',async ()=>{
      findByTestAtrr(wrapper,'mapObjectTagHead').simulate('click');
      expect(findByTestAtrr(wrapper,'mapObjectListItem').length).toBe(1);
      const setData=jest.fn()
      findByTestAtrr(wrapper,'mapObjectListItem').simulate('dragStart',{dataTransfer:{setData:setData}})
      const getData=jest.fn().mockReturnValue('{"objId":"6030dd3af6dadf602e5650d2","objIdx":2,"val":2,"tag":"input","hide":false,"title":"boxadd_txtbox","custname":"boxadd_txtbox","isCustom":false}')
      findByTestAtrr(wrapper,'mapObjectCustomListItem').simulate('drop',{dataTransfer:{getData:getData}})
      findByTestAtrr(wrapper,'submit').simulate('click');
      await act(()=>Promise.resolve())
      wrapper.update();
      expect(props.setShow).toHaveBeenCalledWith(false)
      expect(props.setShowPop).toHaveBeenCalledWith({title: 'Map Scrape Data', content: 'Mapped Scrape Data Successfully!'});
    });
    it('Should unlink the selected object',async ()=>{
      findByTestAtrr(wrapper,'mapObjectTagHead').simulate('click');
      expect(findByTestAtrr(wrapper,'mapObjectListItem').length).toBe(1);
      const setData=jest.fn();
      findByTestAtrr(wrapper,'mapObjectListItem').simulate('dragStart',{dataTransfer:{setData:setData}})
      const getData=jest.fn().mockReturnValue('{"objId":"6030dd3af6dadf602e5650d2","objIdx":2,"val":2,"tag":"input","hide":false,"title":"boxadd_txtbox","custname":"boxadd_txtbox","isCustom":false}')
      findByTestAtrr(wrapper,'mapObjectCustomListItem').simulate('drop',{dataTransfer:{getData:getData}})
      await act(()=>Promise.resolve());
      wrapper.update();
      expect(findByTestAtrr(wrapper,'mapObjectCustomListItem').text()).toBe("boxadd_txtbox")
      findByTestAtrr(wrapper,'mapObjectMappedName').simulate('click');
      await act(()=>Promise.resolve());
      wrapper.update();
      findByTestAtrr(wrapper,'unLink').simulate('click');
      wrapper.update();
      expect(findByTestAtrr(wrapper,'mapObjectCustomListItem').text()).toBe("qwe_txtbox")

    })
});

//Negative
describe('<MapObjectModal/> Negative Sceanrio',()=>{
  let wrapper, props;
  beforeEach(()=>{
    props={
      "scrapeItems":  [
          {
            "objId": "6030dd3af6dadf602e5650cf",
            "objIdx": 0,
            "val": 0,
            "tag": "img",
            "hide": false,
            "title": "img_NONAME1_img",
            "custname": "img_NONAME1_img",
            "isCustom": false
          },
          {
            "objId": "6030dd3af6dadf602e5650d1",
            "objIdx": 1,
            "val": 1,
            "tag": "button",
            "hide": false,
            "title": "btnK1_btn",
            "custname": "btnK1_btn",
            "isCustom": false
          },
          {
            "objId": "6030dd3af6dadf602e5650d2",
            "objIdx": 2,
            "val": 2,
            "tag": "input",
            "hide": false,
            "title": "boxadd_txtbox",
            "custname": "boxadd_txtbox",
            "isCustom": false
          },
          {
            "objId": "6030dd6cf6dadf602e5650d3",
            "objIdx": 3,
            "val": 3,
            "tag": "input",
            "hide": false,
            "title": "qwe_txtbox",
            "custname": "qwe_txtbox",
            "isCustom": true
          }
        ],
      "current_task":dummyData.CT,
      "user_id": "5fb4fbf9f4da702833d7e09e",
      "role": "Test Lead",
      "fetchScrapeData":jest.fn().mockRejectedValue(new Error()),
      "setShowPop": jest.fn(),
      "setShow":jest.fn()
    }
    jest.spyOn(api,'updateScreen_ICE').mockImplementation(()=>{return Promise.resolve("pass")})
    wrapper=mount(<MapObjectModal {...props}/>);
  })
  it('Should error in "Please select atleast one object to Map"',()=>{
    findByTestAtrr(wrapper,'submit').simulate('click')
    expect(findByTestAtrr(wrapper,'errorMessage').length).toBe(1)
  });
  it('Should raise popup with Pas Scrape Data Failed',async ()=>{
    findByTestAtrr(wrapper,'mapObjectTagHead').simulate('click');
    expect(findByTestAtrr(wrapper,'mapObjectListItem').length).toBe(1);
    const setData=jest.fn()
    findByTestAtrr(wrapper,'mapObjectListItem').simulate('dragStart',{dataTransfer:{setData:setData}})
    const getData=jest.fn().mockReturnValue('{"objId":"6030dd3af6dadf602e5650d2","objIdx":2,"val":2,"tag":"input","hide":false,"title":"boxadd_txtbox","custname":"boxadd_txtbox","isCustom":false}')
    findByTestAtrr(wrapper,'mapObjectCustomListItem').simulate('drop',{dataTransfer:{getData:getData}})
    findByTestAtrr(wrapper,'submit').simulate('click');
    await act(()=>Promise.resolve());
    wrapper.update()
    expect((props.setShowPop)).toHaveBeenCalledWith({title: 'Map Scrape Data', content: 'Mapped Scrape Data Failed!'})

  })
});