import * as React from 'react';
import {findByTestAtrr, checkProps} from '../../../setupTests';
import {mount}from 'enzyme';
import SubmitTask from '../components/SubmitTask';
import ModalContainer from '../../global/components/ModalContainer'
import ScrollBar from '../../global/components/ScrollBar';
import dummyData from './dummyData'
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';
import { act } from 'react-dom/test-utils';
import { Thumbnail } from '../../global';
import * as globalapi from '../../global/api';
import * as reactRedux from 'react-redux';
import * as scrapeApi from '../api';
import { BrowserRouter } from 'react-router-dom';
import ScrapeScreen from '../containers/ScrapeScreen'

// describe('<SubmitTask/> POsitive Scenarios',()=>{
//     it('Should render the required components when under review',async ()=>{
//         const contextValues={
//             isUnderReview:true,
//             hideSubmit:true, 
//             setShowConfirmPop:jest.fn(), 
//             setShowPop:jest.fn()
//         }
//         const store = {plugin:{CT:dummyData.CT}}
//         const mockStore=createStore(reducer,store) 
//         // jest.spyOn(globalapi,'reviewTask').mockImplementation(()=>{return Promise.resolve("underReview")})
//         jest.spyOn(React,'useContext').mockImplementation(()=>{return contextValues})
//         let wrapper=mount(<Provider store={mockStore}><SubmitTask/></Provider>)
//         // console.log(wrapper.debug())
//         // Assert that the if underReview then reassign and approve button is only rendered and submit button is not rendered
//         expect(findByTestAtrr(wrapper,'reassignButton').length).toBe(1);
//         expect(findByTestAtrr(wrapper,'approveButton').length).toBe(1);
//         expect(findByTestAtrr(wrapper,'submitButton').length).toBe(0);
//     });
//     it('Should render submit button when not under review',()=>{
//         const contextValues={
//             isUnderReview:false,
//             hideSubmit:false, 
//             setShowConfirmPop:jest.fn(), 
//             setShowPop:jest.fn()
//         }
//         const store = {plugin:{CT:dummyData.CT}}
//         const mockStore=createStore(reducer,store) 
//         jest.spyOn(React,'useContext').mockImplementation(()=>{return contextValues});
//         let wrapper=mount(<Provider store={mockStore}><SubmitTask/></Provider>);
//         expect(findByTestAtrr(wrapper,'submitButton').length).toBe(1);
//         expect(findByTestAtrr(wrapper,'reassignButton').length).toBe(0);
//         expect(findByTestAtrr(wrapper,'approveButton').length).toBe(0);
//     });
// })

describe('asdw',()=>{
    it('qwea',async ()=>{
    let wrapper
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
    const store = {
        plugin:{ CT:dummyData.CT,tasksJson:dummyData.tasksJson,FD:dummyData.FD },
        login: { userinfo:dummyData.userinfo, notify:{data:[],unread:0}},
        scrape:{
            ScrapeData : [],
            disableAction: false,
            disableAppend: false,
            WsData:{endPointURL:"url.com", method:"m", opInput:"output", reqHeader:"Header", reqBody:"body", paramHeader:"header"},
            objValue:{val:0}
        }
    }
    let mockDispatch = jest.fn();
    jest.spyOn(React,'useContext').mockImplementation(()=>{return {scrapeItems:scrapeItems}})
    // const wrapper=mount(<ScrapeScreen/>);
    jest.spyOn(reactRedux,'useDispatch').mockReturnValue(mockDispatch);
    jest.spyOn(scrapeApi,'getScrapeDataScreenLevel_ICE')
    .mockImplementation(()=>{return Promise.resolve(dummyData.data)});
    const mockStore=createStore(reducer,store)
    wrapper=mount(<Provider store={mockStore}>
                        <BrowserRouter>
                            <ScrapeScreen/>
                        </BrowserRouter>
                    </Provider>);
    await act(()=>Promise.resolve());
    console.log(wrapper.debug())
    })
})