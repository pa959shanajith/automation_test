import * as React from 'react';
import {findByTestAtrr} from '../../../setupTests';
import {mount}from 'enzyme';
import RefBarItems from '../components/RefBarItems';
import dummyData from './dummyData'
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';
import * as reactRedux from 'react-redux';
const scrapeItems=  [
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
]
describe('<RefBarItems/> Positive Scenarios',()=>{
    let store;
    let wrapper;
    const contextValues={
        scrapeItems:scrapeItems, 
        setScrapeItems:jest.fn(), 
        scrapedURL:'google.com', 
        mainScrapedData:{
            "createdthrough": "",
            "mirror": "dummyMirrorValue",
            "name": "Screen_test31",
            "reuse": false,
            "scrapedurl": "https://www.google.com/",
            "view": [
              {
                "_id": "6030dd3af6dadf602e5650cf",
                "custname": "img_NONAME1_img",
                "height": 92,
                "hiddentag": "No",
                "left": 632,
                "parent": [
                  "5fecc7e5d2ce8ecfe96896a3"
                ],
                "tag": "img",
                "tempId": 0,
                "top": 161,
                "url": "b1ea3fd0778176dec18b303b7a05e08949d13beda20b7e00e9f1890ec3c068dd",
                "width": 272,
                "xpath": "f62425c2602093ba3b72db27eea1dc68aaa5f8f6cb8d45e79b5094ef429102fc9dabcd2011ce16eb7b96ac70aad5e7a8;/html/body/div[1]/div[2]/div/img;327df21e7a746e056f21ea83ea560009464d4d2cbdd073b43956815d228d71e0fd12a45b498cd24ebbd56bd89d7c052f755c64cc08e95e3066734544e3684b66"
              },
              {
                "_id": "6030dd3af6dadf602e5650d1",
                "custname": "btnK1_btn",
                "height": 36,
                "hiddentag": "No",
                "left": 627,
                "parent": [
                  "5fecc7e5d2ce8ecfe96896a3"
                ],
                "tag": "button",
                "tempId": 2,
                "top": 354,
                "url": "b1ea3fd0778176dec18b303b7a05e08949d13beda20b7e00e9f1890ec3c068dd",
                "width": 128,
                "xpath": "f62425c2602093ba3b72db27eea1dc68a349c945010ae070a2cf578646cd756f526a36aeb47b5e643b129df1e83c4bfa0c47eb5758c9011aa5d0dbe84fcba47b19c434e8e3cc343ba6f63cad7a171abb;/html/body/div[1]/div[3]/form/div[2]/div[1]/div[3]/center/input[1];08f24cada5a4a5e29dee7ca0e3f18ec6fd54bc8f99a7ff5c203a010a45ef26e870ca5480569de8edf48db4379e5b602d608f36b2576f9dd64e8eb79951acf9b8"
              },
              {
                "_id": "6030dd3af6dadf602e5650d2",
                "custname": "boxadd_txtbox",
                "height": 34,
                "hiddentag": "No",
                "left": 524,
                "parent": [
                  "5fecc7e5d2ce8ecfe96896a3"
                ],
                "tag": "input",
                "tempId": 1,
                "top": 285,
                "url": "b1ea3fd0778176dec18b303b7a05e08949d13beda20b7e00e9f1890ec3c068dd",
                "width": 487,
                "xpath": "f62425c2602093ba3b72db27eea1dc68a349c945010ae070a2cf578646cd756f526a36aeb47b5e643b129df1e83c4bfaeed9de96eb098c2928c2ed4cc78186badae6ea27eaa0e4dea51fde37042eb1cb;/html/body/div[1]/div[3]/form/div[2]/div[1]/div[1]/div/div[2]/input;980db611dec8e1dc3d96fb3cf98193a2acf3c46c15650aedd184ac2eab862a4bb4666db0ee71632b8c373cadc0dac3dc65e04e46b05c85c38995326b887fb1bd"
              },
              {
                "_id": "6030dd6cf6dadf602e5650d3",
                "custname": "qwe_txtbox",
                "parent": [
                  "5fecc7e5d2ce8ecfe96896a3"
                ],
                "tag": "input",
                "tempId": 3,
                "xpath": ""
              }
            ]
          }, 
        newScrapedData:" ", 
        setShowPop:jest.fn()
    };
    const d=jest.fn();
    beforeEach(()=>{
      store = {
        plugin:{CT:dummyData.CT,tasksJson:dummyData.tasksJson,FD:dummyData.FD},
        login:{userinfo:dummyData.userinfo},
        scrape:{
            ScrapeData : [],
            disableAction: false,
            disableAppend: false,
            compareFlag:false,
            objValue:{val:0}
      },   
      }
        const props={mirror:" "}
        const mockStore=createStore(reducer,store);
        jest.spyOn(React,'useContext').mockImplementation(()=>{return contextValues})
        
        jest.spyOn(reactRedux,'useDispatch').mockReturnValue(d)
        wrapper=mount(<Provider store={mockStore} ><RefBarItems {...props}/></Provider>);
    })
    afterEach(()=>{
        jest.restoreAllMocks()
    });
    it('Should contain all the components',()=>{
        expect(findByTestAtrr(wrapper,'screenshot').length).toBe(1);
        expect(findByTestAtrr(wrapper,'filter').length).toBe(1);
    });
    it('Should show screenshot popup and filter popup',async ()=>{
      expect(findByTestAtrr(wrapper,'popupSS').length).toBe(0)
      findByTestAtrr(wrapper,'screenshot').simulate('click')
      await Promise.resolve();
      wrapper.update();
      const imgSS= findByTestAtrr(wrapper,'popupSS').find('img').at(1);
      //  Assert that the screenshot popup is being displayed
      expect(findByTestAtrr(wrapper,'popupSS').length).toBe(1);
      // Assert that the screenshot image is been displayed in the popup
      expect(imgSS.length).toBe(1)   
      expect(findByTestAtrr(wrapper,'popupFilter').length).toBe(0);
      findByTestAtrr(wrapper,'filter').simulate('click');
      await Promise.resolve();
      wrapper.update();
      // Assert that pop filter is displayed
      expect(findByTestAtrr(wrapper,'popupFilter').length).toBe(1);
      //  Assert that the all filter contents are being diaplyed accrodingly
      expect(findByTestAtrr(wrapper,'popupFilterContent').children().length).toBe(14)
    });
    it('SHould Filter the contents of the scrape',async ()=>{
      findByTestAtrr(wrapper,'filter').simulate('click');
      await Promise.resolve();
      wrapper.update();
      // Assert that pop filter is displayed
      expect(findByTestAtrr(wrapper,'popupFilter').length).toBe(1);
      wrapper.update();
      const filterButtons=findByTestAtrr(wrapper,'filterButton');
      filterButtons.at(0).simulate('click');
      wrapper.update();
      // Assert that the items are filtered (only button is visible in the scrape items list)
      expect(contextValues.setScrapeItems.mock.calls[0][0][1].hide).toBe(false);
    })
})