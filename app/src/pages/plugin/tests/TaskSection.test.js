import React from 'react';
import { act } from 'react-dom/test-utils';
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import {mount} from 'enzyme';
import TaskSection from '../components/TaskSection';
import {findByTestAtrr, checkProps} from '../../../setupTests';
import {userInfo,dummyData, dummyData1,firstCall,secondCall} from './dummyData';
import * as api from '../api';
import reducer from '../state/reducer';


const setUp=()=>{
    const props={
        userInfo:userInfo,
        userRole:'Test Lead',
        dispatch: jest.fn()
    }
    const wrapper=mount(<TaskSection {...props}/>)
    return wrapper
}

// True Positive Scenes
// 1. Expected and required properties
// 2. Lists all the tasks components i.e Heading, search filter ToDo and review
// 3. Dispatch with expected action type and payload
// 4. Contain the required number of task items under ToDo and To Review sub section

const sampleObject={test:'test'}
describe('<TaskSection/> Positive Scenarios',()=>{
    it('Should contain the required and expected props',()=>{
        const expectedProps={
            userInfo : sampleObject,
            userRole : 'Test Lead',
            dispatch : jest.fn()
        }
        const propsError=checkProps(TaskSection,expectedProps)
        expect(propsError).toBeUndefined()
    })
})

describe('<TaskSection/> Positive Scenarios',()=>{
    let wrapper;
    beforeEach(()=>{
        wrapper=setUp()
    })
    it('Should render all the required attributes of the my task section',()=>{
        // Assert that task header is renderd
        expect(findByTestAtrr(wrapper,'task-header').length).toBe(1)
        // Assert that my task heading is rendered
        expect(findByTestAtrr(wrapper,'my-task').length).toBe(1)
        // Assert that search input is not rendered
        expect(findByTestAtrr(wrapper,'search-input').length).toBe(0)
        // Assert that search-icon is rendered
        expect(findByTestAtrr(wrapper,'search-icon').length).toBe(1)
        // Assert that filter-icon is rendered
        expect(findByTestAtrr(wrapper,'filter-icon').length).toBe(1)
        // Assert that To Do is rendered
        expect(findByTestAtrr(wrapper,'task-toDo').length).toBe(1)
        // Assert that To Review is rendered
        expect(findByTestAtrr(wrapper,'task-toReview').length).toBe(1)
        // Assert that Filter dialog is not  rendered initially
        expect(findByTestAtrr(wrapper,'filerdialog-component').length).toBe(0)
    })
    
    it('Should render the required task content component',()=>{
        // Assert that scroll bar component is rendered
        
        expect(findByTestAtrr(wrapper,'scrollbar-component').length).toBe(1)
        // Assert that task content component is rendered
        expect(findByTestAtrr(wrapper,'taskcontent-component').length).toBe(1)
    })
    it('Should change the search bar when search icon is clicked',()=>{
        let searchIcon=findByTestAtrr(wrapper,'search-icon')
        searchIcon.simulate('click')
        wrapper.update()
        expect(findByTestAtrr(wrapper,'search-input').length).toBe(1)
    })
    it('Should render the filter dialog pop up when clicked on filter icon',()=>{
        let fltr=findByTestAtrr(wrapper,'filter-icon');
        fltr.simulate('click')
        wrapper.update()
        // Assert that filter dialog is rendered when clicked on filter icon
        expect(findByTestAtrr(wrapper,'filterdialog-component').length).toBe(1)

    })
})

describe('<TaskSection/> Positive Scenarios',()=>{
    let wrapper;
    const props={
        userInfo:userInfo,
        userRole:'Test Lead',
        dispatch: jest.fn()
    }
    beforeEach( async ()=>{    
        jest.spyOn(api,'getProjectIDs').mockImplementation(()=>{
           
            return Promise.resolve(dummyData)
        });
        jest.spyOn(api,'getTaskJson_mindmaps').mockImplementation((dummyData)=>{
            
            return Promise.resolve(dummyData1)
        });
        const mockStore=createStore(reducer,{data:'dummy'})
        
        wrapper=mount(<Provider store={mockStore}><TaskSection {...props}/></Provider>) 
        
        await act(()=>Promise.resolve())
    
    })
    afterEach(()=>{
        jest.restoreAllMocks()
    })
    it('Should dispatch with the expected action type and payload',()=>{
        
        wrapper.update()  
        // Assert that dispatch has been called twice
        expect(props.dispatch).toHaveBeenCalledTimes(2)
        // Assert that the first dispatch was called with expected parameter
        expect(props.dispatch).toHaveBeenNthCalledWith(1,firstCall)
        // Assert that second dispatch was called with the expected parameter
        expect(props.dispatch).toHaveBeenNthCalledWith(2,secondCall)
        
    })
    it('Should contain the required number of items under To Do and ToReview',async()=>{
        wrapper.update()
        expect(findByTestAtrr(wrapper,'taskcontent-component').children().length).toBe(14)
        const tR=findByTestAtrr(wrapper,'task-toReview')
        tR.simulate('click') 
        wrapper.update()
        expect(findByTestAtrr(wrapper,'taskcontent-component').children().length).toBe(2)
    })
    it('Should update the task section with the searched value',async ()=>{
        findByTestAtrr(wrapper,'search-icon').simulate('click')
        wrapper.update()
        let searchInput=findByTestAtrr(wrapper,'search-input');   
        searchInput.simulate('change',{target:{value:'username'}})
        wrapper.update();
        expect(findByTestAtrr(wrapper,'taskcontent-component').children().length).toBe(1);  
    })
})

// Negative
// 1. ScreenOverlay should be rendered if loading tasks more time
// 2. PopUp should appear if failed to load data
describe('<TaskSection/> Negative Scenarios',()=>{
    let wrapper;
    beforeEach(()=>{
        wrapper=setUp();
        
    });
    it('should render the ScreenOverlay component if more time is taken to load',()=>{  
        // Assert that screen overlay is rendered with the required value if loading tasks takes more time to load
        expect(findByTestAtrr(wrapper,'screenoverlay-component').text()).toBe('Loading Tasks..Please wait...')
    })
})

describe('<TaskSection/> Negative Scenarios',()=>{
    let wrapper;
    beforeEach(async ()=>{
        const props={
            userInfo:userInfo,
            userRole:'Test Lead',
            dispatch: jest.fn()
        }
        
        jest.spyOn(api,'getProjectIDs').mockImplementation(()=>{
            return Promise.reject(new Error('some error'))
        });
        const mockStore=createStore(reducer,{data:'dummy'})
        
        wrapper=mount(<Provider store={mockStore}><TaskSection {...props}/></Provider>)
        await act(()=>Promise.resolve())
            
  
    })
    it('Should render failed to load data', ()=>{
        wrapper.update()
        // Assert that Failed to load data pop up appears
        expect(findByTestAtrr(wrapper,'popup').length).toBe(1)
        
    })
})