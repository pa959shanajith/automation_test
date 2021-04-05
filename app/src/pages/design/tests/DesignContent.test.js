import * as React from 'react';
import { useRef } from 'react';
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
import DesignContent from '../containers/DesignContent';

jest.mock('react', ()=>{
    const originReact = jest.requireActual('react');
    const mUseRef = jest.fn();
    return {
        ...originReact,
        useRef: mUseRef,
    }
})

let props = {
    current_task: data.CT,
    imported: false, 
    setImported: jest.fn(),  
    setMirror: jest.fn(), 
    setShowPop: jest.fn(),
    setShowConfirmPop: jest.fn(),
    setDisableActionBar: jest.fn(),
}

describe('<DesignContent /> positive scenario test', ()=>{

    let wrapper;
    let mockDispatch;
    let state = {
        login: data.loginReducerData,
        plugin: {
            // CT: data.CT,
            FD: data.FD,
            // tasksJson: data.taskJson,
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

        jest.spyOn(document, 'getElementById')
            .mockImplementation( ()=>Promise.resolve({indeterminate: true}))

        let scrollIntoViewMock = jest.fn();
        window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

        wrapper = mount(
            <Provider store={mockStore}>
                <BrowserRouter>
                    <DesignContent {...props} />
                </BrowserRouter>
            </Provider>
        );

        await act(()=>Promise.resolve())
    });

    afterEach(()=> {
        jest.resetAllMocks()
    })

    it('Should Render TaskName- "Design Batch_Execution_Script1"', ()=>{
        const pageTitle = findByTestAtrr(wrapper, "d__taskName");
        expect(pageTitle.text()).toBe("Design Batch_Execution_Script1");
    })

    it('Should Render all Table Action Buttons', ()=>{
        const tableActionBtns = findByTestAtrr(wrapper, "d__tblActionBtns");
        expect(tableActionBtns.length).toBe(7);
    })

    it('Should Render all Table Row', ()=>{
        wrapper.update();
        const tableRows = findByTestAtrr(wrapper, 'd__tc_row');
        expect(tableRows.length).toBe(data.tcData.testcase.length);
    })

    it('Should Add a Row when Clicked Add Icon', ()=>{
        wrapper.update();

        const addBtn = findByTestAtrr(wrapper, 'd__tblActionBtns').at(0);
        addBtn.simulate('click');
        wrapper.update();
        const tableRows = findByTestAtrr(wrapper, 'd__tc_row');
        expect(tableRows.length).toBe(data.tcData.testcase.length+1);
    })
  
    it('Should Display a popup when clicked Edit Icon', ()=>{
        wrapper.update();

        const editBtn = findByTestAtrr(wrapper, 'd__tblActionBtns').at(1);
        editBtn.simulate('click');
        
        expect(props.setShowPop).toHaveBeenCalled();
    })

    it('Should Display Select Multiple Popup when clicked the Icon', ()=>{
        wrapper.update();

        const smBtn = findByTestAtrr(wrapper, 'd__tblActionBtns').at(2);
        smBtn.simulate('click');
        
        const smPopup = findByTestAtrr(wrapper, 'd__selectMultiple');
        expect(smPopup.length).toBe(1);
    })

    it('Should Display no Steps to paste when clicked Paste Icon', ()=>{
        wrapper.update();

        const psBtn = findByTestAtrr(wrapper, 'd__tblActionBtns').at(5);
        psBtn.simulate('click');
        
        expect(props.setShowPop).toHaveBeenCalled();
    })
})