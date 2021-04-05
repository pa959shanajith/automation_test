import * as React from 'react';
import * as reactRedux  from 'react-redux';
import { Provider }  from 'react-redux';
import { createStore } from 'redux';
import { shallow, mount } from 'enzyme';
import { findByTestAtrr } from '../../../setupTests';
import { BrowserRouter } from 'react-router-dom';
import reducer from '../state/reducer';
import { act } from 'react-dom/test-utils';
import * as data from './DummyData';
import * as api from "../api";
import DesignHome from '../containers/DesignHome';

describe('<DesignHome /> Positive Scenario', ()=>{

    let wrapper;
    let mockDispatch;
    let state = {
        login: data.loginReducerData,
        plugin: {
            CT: data.CT,
            FD: data.FD,
            tasksJson: data.taskJson,
        },
        design: {
            copiedTestCases: {},
            testCases: [],
            modified: {},
            saveEnable: false,
        }
    }
    
    beforeEach(async() => {
        const mockStore = createStore(reducer, state);

        mockDispatch = jest.fn();

        jest.spyOn(reactRedux,'useDispatch')
            .mockImplementation( ()=> mockDispatch );

        jest.spyOn(api, 'readTestCase_ICE')
            .mockImplementation( ()=> Promise.resolve(data.tcData));

        jest.spyOn(api, 'getScrapeDataScreenLevel_ICE')
            .mockImplementation( ()=> Promise.resolve(data.scrapeData));

        jest.spyOn(api, 'getKeywordDetails_ICE')
            .mockImplementation( ()=> Promise.resolve(data.keywordData));

        wrapper = mount(
            <Provider store={mockStore}>
                <BrowserRouter>
                    <DesignHome />
                </BrowserRouter>
            </Provider>
        );

        await act(()=>Promise.resolve())
    });

    afterEach(()=> {
        jest.resetAllMocks()
    })

    it('Should Render Header', ()=>{
        const header = findByTestAtrr(wrapper, 'd__header');
        expect(header.length).toBe(1);
    })

    it('Should Render Action Bar', ()=>{
      const actionBar = findByTestAtrr(wrapper, 'd__actionBar');
      expect(actionBar.length).toBe(1);
    })

    it('Should Render Content', ()=>{
        const contents = findByTestAtrr(wrapper, 'd__contents');
        expect(contents.length).toBe(1);
    })

    it('Should Render Reference Bar', ()=>{
        const refBar = findByTestAtrr(wrapper, 'd__refBar');
        expect(refBar.length).toBe(1);
    })

    it('Should Render Footer', ()=>{
        const footer = findByTestAtrr(wrapper, 'd__footer');
        expect(footer.length).toBe(1);
    })
})