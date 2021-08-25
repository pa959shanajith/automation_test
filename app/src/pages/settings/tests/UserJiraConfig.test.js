import React from 'react'
import { mount } from 'enzyme'
import { findByTestAtrr, checkProps } from '../../../setupTests'
import UserJiraConfig from '../containers/UserJiraConfig'
import { act } from 'react-dom/test-utils'
import * as api from '../api'
import { jiraData } from './dummyData'


const setUp = () => {
    const expectedProps = {
        resetMiddleScreen: jest.fn(),
        setMiddleScreen: jest.fn(),
    }
    let component
    component = mount(<UserJiraConfig {...expectedProps} />)
    return component

}



const updateWrapper = async (wrapper) => {
    await act(async () => {
        await new Promise(r => setTimeout(r))
        wrapper.update()
    })
}


describe('<JiraConfig/> Update button', () => {
    let wrapper
    let spy
    beforeEach(async()=>{
        wrapper=setUp()
        spy = jest.spyOn(api, 'getDetails_JIRA').mockImplementation(() => {
            return Promise.resolve(jiraData)
        })
        await updateWrapper(wrapper)
    })
    afterEach(async()=>{
        jest.clearAllMocks()
    })
    it('Should contain the expected and required props', () => {
        const expectedProps = {
            resetMiddleScreen: jest.fn(),
            setMiddleScreenc: jest.fn(),
        }
        const propsError = checkProps(UserJiraConfig, expectedProps)
        expect(propsError).toBeUndefined()
    })

    

    it('update and delete button should be rendered',() =>{
        expect(spy).toHaveBeenCalled()
        expect(findByTestAtrr(wrapper,'main-button-test').length).toBe(1)
        expect(findByTestAtrr(wrapper,'main-button-test').text()).toEqual("Update")
        expect(findByTestAtrr(wrapper,'delete-test').length).toBe(1)
        expect(findByTestAtrr(wrapper,'delete-test').text()).toEqual("Delete")
    })
    it('default input values should be present',  () =>{
        expect(spy).toHaveBeenCalled()
        expect(findByTestAtrr(wrapper,'url-test').get(0).props.value).toEqual("https://www.google.com")
        expect(findByTestAtrr(wrapper,'username-test').get(0).props.value).toEqual("Akshit_Agarwal")
        expect(findByTestAtrr(wrapper,'api-test').get(0).props.value).toEqual("sdfleiufgevdf")
    })
    
})

describe('<JiraConfig/> Create button', () => {
    let wrapper
    let spy
    beforeEach(async()=>{
        wrapper=setUp()
        spy = jest.spyOn(api, 'getDetails_JIRA').mockImplementation(() => {
            return Promise.resolve("empty")
        })
        await updateWrapper(wrapper)
    })
    afterEach(async ()=>{
        jest.resetAllMocks()
    })
    
    it('Should contain the expected and required props',() => {
        const expectedProps = {
            resetMiddleScreen: jest.fn(),
            setMiddleScreenc: jest.fn(),
        }
        const propsError = checkProps(UserJiraConfig, expectedProps)
        expect(propsError).toBeUndefined()
    })
    it('create and delete should be rendered', () =>{
        expect(spy).toHaveBeenCalled()
        expect(findByTestAtrr(wrapper,'main-button-test').length).toBe(1)
        expect(findByTestAtrr(wrapper,'main-button-test').text()).toEqual("Create")
        expect(findByTestAtrr(wrapper,'delete-test').length).toBe(1)
        expect(findByTestAtrr(wrapper,'delete-test').text()).toEqual("Delete")         
    })
    it('default input values should be empty', () =>{
        expect(spy).toHaveBeenCalled()
        expect(findByTestAtrr(wrapper,'url-test').get(0).props.value).toEqual("")
        expect(findByTestAtrr(wrapper,'username-test').get(0).props.value).toEqual("")
        expect(findByTestAtrr(wrapper,'api-test').get(0).props.value).toEqual("")
        
    })
})
