import React from 'react'
import { mount } from 'enzyme'
import { findByTestAtrr, checkProps } from '../../../setupTests'
import UserProject from '../containers/UserProject'
import { act } from 'react-dom/test-utils'
import * as api from '../../admin/api'
import { domainData, assignedProj, iceData, userinfo } from './dummyData'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import reducer from '../../login/state/reducer'

const setUp = () => {
    const expectedProps = {
        resetMiddleScreen: jest.fn(),
        setMiddleScreen: jest.fn(),
    }
    const store = {
        login:{
            userinfo,
            dateformat:"DD-MM-YYYY"
        }
    }
    const mockStore = createStore(reducer, store)


    jest.spyOn(api, 'getDomains_ICE').mockImplementation(() => {
        return Promise.resolve(domainData)
    })

    jest.spyOn(api, 'getAssignedProjects_ICE').mockImplementation(() => {
        return Promise.resolve(assignedProj)
    })
    jest.spyOn(api, 'getDetails_ICE').mockImplementation(() => {
        return Promise.resolve(iceData)
    })
    let component
    component = mount(<Provider store={mockStore} ><UserProject {...expectedProps} /></Provider>)
    return component
}



const updateWrapper = async (wrapper) => {
    await act(async () => {
        await new Promise(r => setTimeout(r))
        wrapper.update()
    })
}


describe('<UserProject/> Positive Scenarios', () => {
    let wrapper
    let projDrop
    it('Should contain the expected and required props', () => {
        const expectedProps = {
            resetMiddleScreen: jest.fn(),
            setMiddleScreen: jest.fn(),
        }
        const propsError = checkProps(UserProject, expectedProps)
        expect(propsError).toBeUndefined()
    })

    it('Show project details',async()=>{
        wrapper=setUp()
        await updateWrapper(wrapper)
        projDrop=findByTestAtrr(wrapper,'project-select-test')
        projDrop.simulate('change',{
            target:{value:1}
        })
        await updateWrapper(wrapper)
        expect(findByTestAtrr(wrapper,'project-detail-test').length).toBe(1)
    })
    it('Verify project details',async()=>{
        await updateWrapper(wrapper)
        let type=findByTestAtrr(wrapper,'app-type-test')
        let name=findByTestAtrr(wrapper,'project-name-test')
        let domain=findByTestAtrr(wrapper,'domain-test')
        expect(type.length).toBe(1)
        expect(type.text()).toBe("Web")
        expect(name.length).toBe(1)
        expect(name.text()).toBe("WEB")
        expect(domain.length).toBe(1)
        expect(domain.text()).toBe("Banking")
    })
})