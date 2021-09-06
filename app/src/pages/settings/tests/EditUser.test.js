import React from 'react'
import { mount, shallow } from 'enzyme'
import { findByTestAtrr, checkProps } from '../../../setupTests'
import EditUser from '../containers/EditUser'
import { act } from 'react-dom/test-utils'
import * as api from '../../admin/api'
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
        }
    }
    
    const mockStore = createStore(reducer, store)
    jest.spyOn(api, 'manageUserDetails').mockImplementation(() => {
        return Promise.resolve('success')
    })
    let component
    component = mount(<Provider store={mockStore} ><EditUser {...expectedProps} /></Provider>)
    return component

}



const updateWrapper = async (wrapper) => {
    await act(async () => {
        await new Promise(r => setTimeout(r))
        wrapper.update()
    })
}


describe('<EditUser/> Positive Scenarios', () => {
    let wrapper
    beforeEach(()=>{
        wrapper=setUp()
    })
    it('Should contain the expected and required props', () => {
        const expectedProps = {
            resetMiddleScreen: jest.fn(),
            setMiddleScreenc: jest.fn(),
        }
        const propsError = checkProps(EditUser, expectedProps)
        expect(propsError).toBeUndefined()
    })

    it('update button should be rendered', async () =>{
        await updateWrapper(wrapper)
        expect(findByTestAtrr(wrapper,'update-test').length).toBe(1)
        
    })
    it('default input values should be present',  async () =>{
        await updateWrapper(wrapper)
        expect(findByTestAtrr(wrapper,'first-name-test').get(0).props.value).toEqual("Akshit")
        expect(findByTestAtrr(wrapper,'last-name-test').get(0).props.value).toEqual("Agarwal")
        expect(findByTestAtrr(wrapper,'password-1-test').get(0).props.value).toEqual("")
        expect(findByTestAtrr(wrapper,'email-test').get(0).props.value).toEqual("Akshit1@lnmiit.com")
       
    })
    it('show success popup', async ()=>{
        await updateWrapper(wrapper)
        const pass1 = findByTestAtrr(wrapper,'password-1-test').at(0)
        const pass2 = findByTestAtrr(wrapper,'password-2-test').at(0)
        const pass3 = findByTestAtrr(wrapper,'password-3-test').at(0)
        pass1.simulate('change',{
            target:{value:"Akshit!2"}
        })
        pass2.simulate('change',{
            target:{value:"Akshit!23"}
        })
        pass3.simulate('change',{
            target:{value:"Akshit!23"}
        })
        const button = findByTestAtrr(wrapper,'form-test').at(0)
        button.simulate('submit',{
            preventDefault: ()=>{}
        })
        await updateWrapper(wrapper)
        const pop = findByTestAtrr(wrapper,'popup-test')
        expect(pop.length).toBe(1)
        expect(pop.get(0).props.title).toEqual("Updated User")

    })
    
})

describe('<EditUser/>  Negative Scenarios', () => {
    let wrapper
    beforeEach(()=>{
        wrapper=setUp()
        jest.resetAllMocks()
        jest.spyOn(api, 'manageUserDetails').mockImplementation(() => {
            return Promise.resolve('fail')
        })
    })
   
    it('show erro popup', async ()=>{
        await updateWrapper(wrapper)
        const pass1 = findByTestAtrr(wrapper,'password-1-test').at(0)
        const pass2 = findByTestAtrr(wrapper,'password-2-test').at(0)
        const pass3 = findByTestAtrr(wrapper,'password-3-test').at(0)
        pass1.simulate('change',{
            target:{value:"Akshit!2"}
        })
        pass2.simulate('change',{
            target:{value:"Akshit!23"}
        })
        pass3.simulate('change',{
            target:{value:"Akshit!23"}
        })
        const button = findByTestAtrr(wrapper,'form-test').at(0)
        button.simulate('submit',{
            preventDefault: ()=>{}
        })
        await updateWrapper(wrapper)
        const pop = findByTestAtrr(wrapper,'popup-test')
        expect(pop.length).toBe(1)
        expect(pop.get(0).props.title).toEqual("Error")

    })
    
})

