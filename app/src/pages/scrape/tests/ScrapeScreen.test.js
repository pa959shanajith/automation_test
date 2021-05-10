import React from 'react';
import {mount}from 'enzyme';
import ScrapeScreen from '../containers/ScrapeScreen';
import {findByTestAtrr} from '../../../setupTests';
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';
import * as scrapeApi from '../api';
import { BrowserRouter } from 'react-router-dom';
import * as  dummyData from './dummyData'
import { act } from 'react-dom/test-utils';
import * as reactRedux from 'react-redux'



describe.skip('<ScrapeScreen/> Positive Scenarios',()=>{
    let wrapper
    const store = {
        plugin:{ CT:dummyData.CT,tasksJson:dummyData.tasksJson,FD:dummyData.FD },
        login: { userinfo:dummyData.userinfo, notify:{data:[],unread:0}},
        scrape:{
            ScrapeData : [],
            disableAction: false,
            disableAppend: false,
            WsData:{
                    endPointURL:"url.com", 
                    method:"m", 
                    opInput:"output", 
                    reqHeader:"Header", 
                    reqBody:"body", 
                    paramHeader:"header"
                },
            objValue:{val:0}
        }
    }
    let mockDispatch = jest.fn();
    beforeEach(async ()=>{
        jest.spyOn(reactRedux,'useDispatch').mockReturnValue(mockDispatch);
        jest.spyOn(scrapeApi,'getScrapeDataScreenLevel_ICE')
        .mockImplementation(()=>{
            
            return Promise.resolve(dummyData.data);
        })
        const mockStore=createStore(reducer,store)
        wrapper=mount(
                        <Provider store={mockStore}>
                            <BrowserRouter>
                                <ScrapeScreen/>
                            </BrowserRouter>
                        </Provider>);
        await act(()=>Promise.resolve());
    });
    it('Should render the required sections of the scrape screen', ()=>{
        expect(findByTestAtrr(wrapper,'ssBody').length).toBe(1)
        expect(findByTestAtrr(wrapper,'ssMidSection').length).toBe(1)
        expect(findByTestAtrr(wrapper,'ssFooter').length).toBe(1)
        
    });

    it('Should call the dispatch required number of times with the expected parameter',()=>{
        console.log(mockDispatch.mock.calls)
        expect(mockDispatch).toHaveBeenCalled()
        // expect(mockDispatch).toHaveBeenCalledTimes(2)
    })

})
