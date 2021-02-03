import React from 'react';
import { shallow,mount, } from 'enzyme';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import LoginFields,{handleShowPass}  from '../components/LoginFields';
import { SetProgressBar as SPB} from '../../global';
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


// True Positive Scene 
// 1.   Check for the props that are being passed to the component
// 2.   Check for the Landing page render with basic 3 fields (username,arrow button, username icon)
// 3.1  Click operation on the arrow button of the username
// 3.2  Able to render the password components (password input field, password icon and  the login button)
// 4.   Upon changing the username while logging in, the password field should be disappeared

describe('<LoginFields/> props Check',()=>{
    it('Should contain required and expected props',()=>{
        const expectedProps = {
            SetProgressBar: SPB,
        };
        const propsError = checkProps(LoginFields, expectedProps);

        // Assert that expected props have been passed to the component
        expect(propsError).toBeUndefined();
    })
})

describe('<LoginFields/> positive scenario test',()=>{
	let wrapper;
    beforeEach(()=>{
        wrapper=setUp()
		jest.spyOn(api,'checkUser').mockImplementation(()=>{
            return Promise.resolve({proceed:true})
        });
        
    })
	afterEach(()=>{
        jest.restoreAllMocks()
    })
	
	it('Should render the username input, icon and arrow key',()=>{
        const component=findByTestAtrr(wrapper,'login-username');
        // Assert that username component is being rendered
        expect(component.length).toBe(1)

        // Assert that username icon is being rendered
        expect(findByTestAtrr(wrapper,'username-icon').length).toBe(1)

        // Assert that username input box is rendered
        expect(findByTestAtrr(wrapper,'username-input').length).toBe(1)

        // Assert that the arrow button is present in the username componenet
        expect(findByTestAtrr(wrapper,'login-username-button').length).toBe(1)

        //Assert that password field is not shown initially
        expect(findByTestAtrr(wrapper,'login-password').length).toBe(0)
    })
	
	it('Should render the password components',(done)=>{
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

    it('Should disable the password filed when username is changed',(done)=>{
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


// True Negative Scene  
// 1. If no username is present and arrow button is clicked the username error message should be rendered
// 2. If no password is provided and the Login button is clicked then the error message(Please enter the password) should be displayed
// 3. If invalid credentials then corresponding error message should be diaplayed.

describe('<LoginFields/> negative scenario test ',()=>{

    let wrapper;
    beforeEach(()=>{
        wrapper=setUp()
		jest.spyOn(api,'checkUser').mockImplementation(()=>{
            return Promise.resolve({proceed:true})
        });
        // jest.spyOn(api,'authenticateUser').mockImplementation((username, password)=>{
        //   return Promise.resolve('inValidCredential')  
        // }); 
        jest.spyOn(api,'authenticateUser').mockResolvedValueOnce('inValidCredential')
                                          .mockResolvedValueOnce('userLogged')
    })
	afterEach(()=>{
        jest.restoreAllMocks()
    })

    it('Should render username error for blank username input ', ()=>{
        const btn=findByTestAtrr(wrapper,'login-username-button');

        //Assert that default username image is displayed
        expect(findByTestAtrr(wrapper,'username-image').prop('src')).toBe('static/imgs/ic-username.png')
        
        btn.simulate('click')

        //Assert that image source is changed to the correspnding error image
        expect(findByTestAtrr(wrapper,'username-image').prop('src')).toBe('static/imgs/ic-username-error.png')
        
        //Assert that clicking on arrow with blank username input will render the required error
        expect(findByTestAtrr(wrapper,'login-username-error').length).toBe(1)
        
    })
 
    it('Should display "Please enter password" when no input for password field provided',()=>{
        wrapper=inputFieldChange(wrapper,'username-input',USERCREDENTAILS.INVALIDUN)
        const btn=findByTestAtrr(wrapper,'login-username-button')
        btn.simulate('click')
        
        setTimeout(()=>{
            wrapper.update();
            const loginButton=findByTestAtrr(wrapper,'login-button')
            //Assert that the default password image is being used
            expect(findByTestAtrr(wrapper,'password-image').prop('src')).toBe('static/imgs/ic-password.png')
            loginButton.simulate('click',{preventDefault:jest.fn()})
            //Assert that password img src is changed to respective error image
            expect(findByTestAtrr(wrapper,'password-image').prop('src')).toBe('static/imgs/ic-password-error.png')
            // Assert that with no password the errpr message gets displayed
            expect(findByTestAtrr(wrapper,'password-error').length).toBe(1)
            
        })
    })

    it('Should render the corresponding error message when clicking the login button',(done)=>{
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

})
