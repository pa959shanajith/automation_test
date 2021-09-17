import React from 'react'
import { mount, shallow } from 'enzyme'
import { findByTestAtrr, checkProps } from '../../../setupTests'
import UserGitConfig from '../containers/UserGitConfig'
import { act } from 'react-dom/test-utils'
import { userinfo } from './dummyData'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import reducer from '../../login/state/reducer'

const setUp = (props = {}) => {
    const expectedProps = {
        resetMiddleScreen: jest.fn(),
        setMiddleScreen: jest.fn(),
    }
    const store = {
        login:{
            userinfo
        }
    }
    const mockStore = createStore(reducer, store)
    let component
    component = mount(<Provider store={mockStore} ><UserGitConfig {...expectedProps} /></Provider>)
    return component

}



const updateWrapper = async (wrapper) => {
    await act(async () => {
        await new Promise(r => setTimeout(r))
        wrapper.update()
    })
}


describe('<UserGitConfig/> Positive Scenarios', () => {
    let wrapper
    beforeEach(()=>{
        wrapper=setUp()
    })
    it('Should contain the expected and required props', () => {
        const expectedProps = {
            resetMiddleScreen: jest.fn(),
            setMiddleScreen: jest.fn(),
        }
        const propsError = checkProps(UserGitConfig, expectedProps)
        expect(propsError).toBeUndefined()
    })

    it('select user should not be rendered', async () =>{
        await updateWrapper(wrapper)
        expect(findByTestAtrr(wrapper,'user_git').length).toBe(0)
        
    })
    
})

