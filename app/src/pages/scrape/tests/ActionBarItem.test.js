import * as React from 'react';
import {findByTestAtrr} from '../../../setupTests';
import {mount}from 'enzyme';
import ActionBarItems from '../components/ActionBarItems';
import dummyData from './dummyData'
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';
import { Thumbnail } from '../../global';
import * as api from '../api';

class FileReaderMock {
    readyState = 0;
    abort = jest.fn();
    addEventListener = jest.fn();
    dispatchEvent = jest.fn();
    onabort = jest.fn();
    onerror = jest.fn();
    onload = jest.fn();
    onloadend = jest.fn();
    onloadprogress = jest.fn();
    onloadstart = jest.fn();
    onprogress = jest.fn();
    readAsArrayBuffer = jest.fn();
    readAsBinaryString = jest.fn();
    readAsDataURL = jest.fn();
    readAsText = jest.fn();
    removeEventListener = jest.fn();
}
const data={
    "createdthrough": "",
    "mirror": "fakeMirrorstring",
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
    ],
    "appType": "Web",
    "screenId": "5fecc7e5d2ce8ecfe96896a3",
    "versionnumber": 0
  }

// Positive
describe('<ActionBarItem/> positive Scenarios',()=>{
    let wrapper, upperContent, bottomContent, mF,winspy,spy,q;
    const file2 = new File([new ArrayBuffer(1)], 'chucknorris.json');
    beforeEach( ()=>{
      const store = {
            plugin:{CT:dummyData.CT,tasksJson:dummyData.tasksJson,FD:dummyData.FD},
            login:{userinfo:dummyData.userinfo},
            scrape:{
                ScrapeData : [],
                disableAction: false,
                disableAppend: false,
                compareFlag:false
            },   
      }
      const mockStore=createStore(reducer,store) 
      const scrapeItems= [
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
      upperContent={setShowAppPop:jest.fn(),saved:false, startScrape:jest.fn(), setSaved:jest.fn()}
      bottomContent={setShowObjModal:jest.fn(), scrapeItems:scrapeItems, setShowPop:jest.fn(), fetchScrapeData:jest.fn()}
      mF=new FileReaderMock()
      jest.spyOn(React,'useContext').mockImplementationOnce(()=>{return upperContent})
                                    .mockImplementation(()=>{return bottomContent});
      jest.spyOn(window,'FileReader').mockImplementation(()=>{return mF});
      window.URL.createObjectURL=jest.fn().mockReturnValue("blob:http://localhost:3000/54dae0fd-df17-4349-a77f-14faedd94c4f") 
      wrapper=mount(<Provider store={mockStore} ><ActionBarItems/></Provider>);
      
      jest.spyOn(api,'updateScreen_ICE').mockImplementation(()=>{return Promise.resolve("proceed")});
      jest.spyOn(api,'getScrapeDataScreenLevel_ICE').mockImplementation((appType, screenId, projectId, testCaseId)=>{return Promise.resolve(data)});
    });
    afterEach(()=>{
        jest.resetAllMocks()
    })
    it('Should render the required components',()=>{
        // UpperContent
        expect(findByTestAtrr(wrapper,'scrapeOnHeading').length).toBe(1);
        expect(findByTestAtrr(wrapper,'appendInput').length).toBe(1);
        expect(findByTestAtrr(wrapper,'append').length).toBe(1);
        expect(wrapper.find(Thumbnail).length).toBe(12)
    });
    it('Should scrape on the selected option',()=>{
        const ieDiv=wrapper.find(Thumbnail).at(0).find('div');
        ieDiv.simulate('click');
        expect(upperContent.startScrape).toHaveBeenNthCalledWith(1,'ie');

        const chromeDiv=wrapper.find(Thumbnail).at(1).find('div');
        chromeDiv.simulate('click');
        expect(upperContent.startScrape).toHaveBeenNthCalledWith(2,'chrome');

        const mozillaDiv=wrapper.find(Thumbnail).at(2).find('div');
        mozillaDiv.simulate('click');
        expect(upperContent.startScrape).toHaveBeenNthCalledWith(3,'mozilla');

        const edgeDiv=wrapper.find(Thumbnail).at(3).find('div');
        edgeDiv.simulate('click');
        expect(upperContent.startScrape).toHaveBeenNthCalledWith(4,'edge');

        const edgeChromiumeDiv=wrapper.find(Thumbnail).at(4).find('div');
        edgeChromiumeDiv.simulate('click');
        expect(upperContent.startScrape).toHaveBeenNthCalledWith(5,'chromium');

        const pdfUilityScrape=wrapper.find(Thumbnail).at(5).find('div');
        pdfUilityScrape.simulate('click');
        expect(upperContent.startScrape).toHaveBeenNthCalledWith(6,'pdf');
    })
    it('Should call the respective Modal',()=>{
        // add
        const addObjectDiv=findByTestAtrr(wrapper,'bottomContent').at(0).find('div');
        addObjectDiv.simulate('click')
        expect(bottomContent.setShowObjModal).toHaveBeenNthCalledWith(1,'addObject');

        // map
        const mapObjectDiv=findByTestAtrr(wrapper,'bottomContent').at(1).find('div');
        mapObjectDiv.simulate('click')
        expect(bottomContent.setShowObjModal).toHaveBeenNthCalledWith(2,'mapObject');

        // compare
        const compareObjectDiv=findByTestAtrr(wrapper,'bottomContent').at(2).find('div');
        compareObjectDiv.simulate('click')
        expect(bottomContent.setShowObjModal).toHaveBeenNthCalledWith(3,'compareObject');

        //create
        const createObjectDiv=findByTestAtrr(wrapper,'bottomContent').at(3).find('div');
        createObjectDiv.simulate('click')
        expect(bottomContent.setShowObjModal).toHaveBeenNthCalledWith(4,'createObject');
    });
    it('Should call the import test cases',async ()=>{
        const importTestCase=findByTestAtrr(wrapper,'bottomContent').at(4).find('div');
        const fileInput=findByTestAtrr(wrapper,'fileInput');
        await fileInput.simulate('change',{target:{files:[file2]}})
        await Promise.resolve();
        wrapper.update()
        // Assert that the reader readAstext as been called
        expect(mF.readAsText).toHaveBeenNthCalledWith(1,file2)
    });
});
