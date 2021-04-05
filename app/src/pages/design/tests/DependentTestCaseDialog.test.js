import * as React from 'react';
import * as reactRedux  from 'react-redux';
import { Provider }  from 'react-redux';
import { createStore } from 'redux';
import {  mount } from 'enzyme';
import { findByTestAtrr } from '../../../setupTests';
import { BrowserRouter } from 'react-router-dom';
import reducer from '../state/reducer';
import { act } from 'react-dom/test-utils';
import * as data from './DummyData';
import * as api from "../api";
import DependentTestCaseDialog from '../components/DependentTestCaseDialog';

let props = {
    scenarioId: data.CT.scenarioId,
    setShowDlg: jest.fn(),
    checkedTc: [],
    setCheckedTc: jest.fn(),
    setDTcFlag: jest.fn(),
    taskName: data.CT.testCaseName,
    taskId: data.CT.testCaseId,
    setShowPop: jest.fn(),
}

describe('<DependentTestCaseDialog /> positive scenario test', ()=>{

    let wrapper;
    let mockDispatch;
    let state = {
        login: data.loginReducerData,
        plugin: {
            CT: data.CT,
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
        
        jest.spyOn(api, 'getTestcasesByScenarioId_ICE')
            .mockImplementation( ()=> Promise.resolve(data.dependentTestCases));

            
        let windowMock = jest.fn();
        window.document = windowMock;

        wrapper = mount(
            <Provider store={mockStore}>
                <BrowserRouter>
                    <DependentTestCaseDialog {...props} />
                </BrowserRouter>
            </Provider>
        );

        await act(()=>Promise.resolve())
    });

    afterEach(()=> {
        jest.resetAllMocks()
    })

    it('Should Render Dependent Testcase Modal', ()=>{
        const dtcModal = findByTestAtrr(wrapper, 'd__dtc');
        expect(dtcModal.length).toBe(1);
    })

    it('Should Render all TestCases', ()=>{
        wrapper.update();
        const testCases = findByTestAtrr(wrapper, 'd__dtc_item');
        expect(testCases.length).toBe(data.dependentTestCases.length);
    })

    it('Should Save on Pressing Save Button', ()=>{
        const saveBtn = findByTestAtrr(wrapper, 'd__dtc_save');
        saveBtn.simulate('click');
        
        expect(props.setShowPop).toHaveBeenCalled();
    })

})