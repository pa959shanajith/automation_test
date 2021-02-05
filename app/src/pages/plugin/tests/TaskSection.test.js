import React from 'react';
import { shallow,mount,render } from 'enzyme';
import TaskSection from '../components/TaskSection';
import {findByTestAtrr, checkProps} from '../../../setupTests';
import {userInfo,dummyData, dummyData1} from './dummyData';
import * as api from '../api';
import { act } from 'react-dom/test-utils';

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

const sampleObject={test:'test'}
// expect(findByTestAtrr(wrapper,''))
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
        // Assert that search input is rendered
        expect(findByTestAtrr(wrapper,'search-input').length).toBe(1)
        // Assert that search-icon is rendered
        expect(findByTestAtrr(wrapper,'search-icon').length).toBe(1)
        // Assert that filter-icon is rendered
        expect(findByTestAtrr(wrapper,'filter-icon').length).toBe(1)
        // Assert that To Do is rendered
        expect(findByTestAtrr(wrapper,'task-toDo').length).toBe(1)
        // Assert that To Review is rendered
        expect(findByTestAtrr(wrapper,'task-toReview').length).toBe(1)
        // Assert that Filter dialog is not  rendered initially
        expect(wrapper.find('FilterDialog').length).toBe(0)
    })
    
    it('Should render the required task content component',()=>{
        // Assert that scroll bar component is rendered
        
        expect(wrapper.find('ScrollBar').length).toBe(2)
        // Assert that task content component is rendered
        expect(wrapper.find('TaskContents').length).toBe(1)
    })
    it('Should render the filter dialog pop up when clicked on filter icon',()=>{
        let fltr=findByTestAtrr(wrapper,'filter-icon');
        fltr.simulate('click')
        wrapper.update()
        // Assert that filter dialog is rendered when clicked on filter icon
        expect(wrapper.find('FilterDialog').length).toBe(1)

    })

})


// Negative
// 1.ScreenOverlay should be rendered if loading tasks more time
describe('<TaskSection/>',()=>{
    let wrapper;
    beforeEach(()=>{
        wrapper=setUp();
    })
    it('should render the ScreenOverlay component if more time taken to load',()=>{
        // Assert that screen overlay is rendered with the required value if loading tasks takes more time to load
        expect(wrapper.find('ScreenOverlay').text()).toBe('Loading Tasks..Please wait...')
    })
})


