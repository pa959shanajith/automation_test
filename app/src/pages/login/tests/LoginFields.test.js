import React from 'react';
import { shallow,mount, } from 'enzyme';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import LoginFields,{handleShowPass}  from '../components/LoginFields';
import { SetProgressBar as SPB} from '../../global';
import apiMock from '../apiMock'
import * as api from '../api'


const setUp=()=>{
    const props={SetProgressBar:SPB}
    const wrapper=shallow(<LoginFields {...props} />);
    return wrapper
}

const USERCREDENTAILS={
    UN:'user',
    PWD:'password',
    INVALIDUN: 'invalidun',
    INVALIDPWD: 'invalidpwd',
}

const inputFieldChange=(wrapper,dataTest,val)=>{
    let inp=findByTestAtrr(wrapper,dataTest)
    inp.simulate('focus');
    inp.simulate('change',{
            target:{
                value:val
            }
    })
    wrapper.update()
    return wrapper
}

describe('Props',()=>{
    it('should contain required and expected props',()=>{
        const expectedProps = {
            SetProgressBar: SPB,
        };
        const propsError = checkProps(LoginFields, expectedProps);

        // Assert that expected props have been passed to the component
        expect(propsError).toBeUndefined();
    })
})

describe('Initial login field rendering',()=>{

    let wrapper;
    beforeEach(()=>{
        wrapper=setUp()
    })

    it('Should render the username input, icon and arrow key',()=>{
        const component=findByTestAtrr(wrapper,'login-username');
        // Assert that username component is being rendered
        expect(component.length).toBe(1)

        // Assert that username icon is being rendered
        expect(findByTestAtrr(wrapper,'username-icon').length).toBe(1)

        // Assert that username input box is rendered
        expect(findByTestAtrr(wrapper,'username-input').length).toBe(1)

    })

    it('Username Error Check', ()=>{
        const btn=findByTestAtrr(wrapper,'login-username-button');
        btn.simulate('click')

        //Assert that clicking on arrow with blank username input will render the required error
        expect(findByTestAtrr(wrapper,'login-username-error').length).toBe(1)
        
    })
})

describe('Password Field Operations',()=>{
    let wrapper
    
    beforeEach(()=>{
        wrapper=setUp();
        jest.spyOn(api,'checkUser').mockImplementation(()=>{
            return Promise.resolve({proceed:true})
        });
        jest.spyOn(api,'authenticateUser').mockImplementation((username, password)=>{
            return Promise.resolve('inValidCredential')  
        });   
    })

    afterEach(()=>{
        jest.restoreAllMocks()
    })
    
    it('password components should be rendered',async (done)=>{
        wrapper=inputFieldChange(wrapper,'username-input',USERCREDENTAILS.UN)
        const btn=findByTestAtrr(wrapper,'login-username-button')
        btn.simulate('click')
        setTimeout(()=>{
            wrapper.update();

            //Assert if the whole password compoenent is been rendered->
            expect(findByTestAtrr(wrapper,'login-password').length).toBe(1)

            //Assert if password input is present in the wrapper->
            expect(findByTestAtrr(wrapper,'password-input').length).toBe(1)

            //Assert that login button is present ->
            expect(findByTestAtrr(wrapper,'login-button').length).toBe(1)          
            done();
        })
        
    })

    it('Operations on password field',async (done)=>{
        wrapper=inputFieldChange(wrapper,'username-input',USERCREDENTAILS.INVALIDUN)
        const btn=findByTestAtrr(wrapper,'login-username-button')
        btn.simulate('click')
        setTimeout(()=>{
            wrapper.update();
            wrapper=inputFieldChange(wrapper,'password-input',USERCREDENTAILS.INVALIDPWD)
            const loginButton=findByTestAtrr(wrapper,'login-button')
            loginButton.simulate('click',{preventDefault:jest.fn()})
            setTimeout(()=>{
                wrapper.update()

                //Assert that login validation is being rendered depending on the inputs
                expect(findByTestAtrr(wrapper,'login-validation').text()).toBe("The username or password you entered isn't correct. Please try again.")
                done();
            })
        })
    })

    it('Password field should disapper when username is tried to change',(done)=>{
        wrapper=inputFieldChange(wrapper,'username-input',USERCREDENTAILS.INVALIDUN)
        const btn=findByTestAtrr(wrapper,'login-username-button')
        btn.simulate('click')
        setTimeout(()=>{
            wrapper.update()

            //Assert that password componenet is being rendered
            expect(findByTestAtrr(wrapper,'password-input').length).toBe(1)
            wrapper=inputFieldChange(wrapper,'username-input','changing Username')

            //Assert that password input is not present after changin the username 
            expect(findByTestAtrr(wrapper,'password-input').length).toBe(0)
            done()
        })
    })
})

