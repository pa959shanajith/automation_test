import React from 'react'
import { mount} from 'enzyme'
import { findByTestAtrr, checkProps } from '../../../setupTests'
import UserTokenMgmt from '../containers/UserTokenMgmt'
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
            userinfo,
            dateformat:"DD-MM-YYYY"
        }
    }
    const mockStore = createStore(reducer, store)
    let component
    component = mount(<Provider store={mockStore} ><UserTokenMgmt {...expectedProps} /></Provider>)
    return component

}



const updateWrapper = async (wrapper) => {
    await act(async () => {
        await new Promise(r => setTimeout(r))
        wrapper.update()
    })
}


describe('<UserTokenMgmt/> Positive Scenarios', () => {
    let wrapper
    beforeEach(()=>{
        wrapper=setUp()
    })
    it('Should contain the expected and required props', () => {
        const expectedProps = {
            resetMiddleScreen: jest.fn(),
            setMiddleScreenc: jest.fn(),
        }
        const propsError = checkProps(UserTokenMgmt, expectedProps)
        expect(propsError).toBeUndefined()
    })

    it('Components that should or should not be rendered', async () =>{
        await updateWrapper(wrapper)
        
        expect(findByTestAtrr(wrapper,'user-test').length).toBe(0)
        expect(findByTestAtrr(wrapper,'ice-type-test').length).toBe(0)
        expect(findByTestAtrr(wrapper,'token-test').length).toBe(1)
        expect(findByTestAtrr(wrapper,'token-area-test').length).toBe(1)
        expect(findByTestAtrr(wrapper,'token-mgmt-list-test').length).toBe(1)
    })
    
})

