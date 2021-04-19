import React from 'react';
import { mount } from 'enzyme';
import ScheduleContent from '../containers/ScheduleContent';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import {scheduleData, testSuiteData, FD, CT} from './dummyData';
import * as api from '../api'
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../../login/state/reducer';
import { act } from 'react-dom/test-utils';


const setUp=(FnReport)=>{
    const expectedProps={
        smartMode: "normal", 
        execEnv: "default", 
        syncScenario: false, 
        setBrowserTypeExe:(input)=>{},
        setExecAction:(input)=>{},
        appType:"web",
        browserTypeExe:[],
        execAction:"serial"
    }
    const store = {
        plugin:{
            tasksJson: {},
            FD: FD,
            CT: CT,
            RD: {
                'cycleid': undefined,
                'releaseid': undefined,
                'testsuiteid': undefined,
                'projectid': undefined,
                'testsuitename': undefined
            }
        },
        login:{
            dateformat: "YYYY-MM-DD"
        }
        
        
    }
    let mockStore=createStore(reducer,store) 

    jest.spyOn(api,'getScheduledDetails_ICE').mockImplementation(()=>{
    
            return Promise.resolve(scheduleData)
        
    })
    
    jest.spyOn(api, 'readTestSuite_ICE').mockImplementation(()=>{
        
            return Promise.resolve(testSuiteData)    
        
    })
    let wrapper = mount(<Provider store={mockStore} ><ScheduleContent {...expectedProps} /></Provider>);

    return wrapper
}

const updateWrapper = async(wrapper) => {
    await act(async()=>{
        await new Promise(r=>setTimeout(r))
        wrapper.update()
    })
}

describe('<ScheduleContent/> positive scenario test',()=>{
    let wrapper;
    beforeEach(async ()=>{
        wrapper=setUp()
        await updateWrapper(wrapper)    
    });

    afterEach(()=>{
        jest.resetAllMocks();
    })
    
    it('Should render schedule table correctly',() => {
        expect(findByTestAtrr(wrapper,'schedule_data_date').length).toBe(20)
        expect(findByTestAtrr(wrapper,'schedule_data_target_user').length).toBe(20)
        expect(findByTestAtrr(wrapper,'schedule_data_scenario_name').length).toBe(20)
        expect(findByTestAtrr(wrapper,'schedule_data_date_suite_name').length).toBe(20)
        expect(findByTestAtrr(wrapper,'schedule_data_browser_type').length).toBe(20)
        expect(findByTestAtrr(wrapper,'schedule_data_status').length).toBe(20)

    })

    it('Should render date format correctly',()=>{
        expect(findByTestAtrr(wrapper,'schedule_data_date').at(0).props().children).toBe("2021-04-03 14:10")
    })
  
})  
