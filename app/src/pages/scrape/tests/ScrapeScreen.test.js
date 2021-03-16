import React from 'react';
import { shallow,mount}from 'enzyme';
import ScrapeScreen from '../containers/ScrapeScreen';
import {findByTestAtrr, checkProps} from '../../../setupTests';
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';
import * as scrapeApi from '../api';
import* as redux from "react-redux"
import { BrowserRouter } from 'react-router-dom';
import * as  dummyData from './dummyData'
import { act } from 'react-dom/test-utils';
import { find } from 'async';
import { useDispatch } from 'react-redux'; 
import * as reactRedux from 'react-redux'



describe('<ScrapeScreen/> Positive Scenarios',()=>{
    let wrapper
    let mockDispatch = jest.fn();
    beforeEach(async ()=>{
        jest.spyOn(scrapeApi,'getScrapeDataScreenLevel_ICE')
        .mockImplementation(()=>{
            console.log("Hello from mocked API")
            return Promise.resolve(dummyData.data)
        })
        jest.spyOn(reactRedux,'useDispatch').mockReturnValue(mockDispatch)
        const mockStore=createStore(reducer,dummyData.store)
        wrapper=mount(
        <Provider store={mockStore}><BrowserRouter><ScrapeScreen/></BrowserRouter></Provider>
        )
        await act(()=>Promise.resolve())
    })
    afterEach(()=>{
        jest.resetAllMocks()
    })
    it('Should render the sections of the scrape screen', ()=>{   
        // Asert that body of scrape screen is present
        expect(findByTestAtrr(wrapper,'ssBody').length).toBe(1)
        // Asert that mid section of scrape screen is present
        expect(findByTestAtrr(wrapper,'ssMidSection').length).toBe(1)
        // Asert that footer of scrape screen is present
        expect(findByTestAtrr(wrapper,'ssFooter').length).toBe(1)
    });
    it('Should contain the contain the required number of child components in mid section',()=>{
        // Assert that mid section contains 3 childrens
        expect(findByTestAtrr(wrapper,'ssMidSection').children().length).toBe(3)
    })
    // it("Should dispatch the dispatch with proper parameters",()=>{
    //     expect(mockDispatch).toHaveBeenCalledTimes(8)
    // })
})

