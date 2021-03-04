import React from 'react';
import { shallow,mount, } from 'enzyme';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import UtilityCenter  from '../containers/UtilityCenter.js';
import * as api from '../api'
const setUp=()=>{
        const props={   pairwiseClicked:"pairwiseClicked" ,
                        setPairwiseClicked:jest.fn(), 
                        screenType:"encryption",
                        setScreenType:jest.fn(),
                    }
    const wrapper=mount(<UtilityCenter {...props} />);
    return wrapper
}
const dropdownOptions=["AES","MD5","Base64"]
const ondropDownorinputChange=(wrapper,dataTest,val)=>{
    let inp=findByTestAtrr(wrapper,dataTest)
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
// 2.   Check for the Landing page render with basic 3 fields (encrypt type select filed , Encryption Data input Field,Encrypted Data input Field)
// 3.1  Click operation on the arrow button of the username
// 3.2  Able to render the password components (password input field, password icon and  the login button)
// 4.   Upon changing the username while logging in, the password field should be disappeared

describe('<Encryption/> props Check',()=>{
    it('Should contain required and expected props',()=>{
        const expectedProps = { pairwiseClicked:"pairwiseClicked" ,
                                setPairwiseClicked:jest.fn(), 
                                screenType:"encryption",
                                setScreenType:jest.fn(),
                            };
        const propsError = checkProps(UtilityCenter, expectedProps);

        // Assert that expected props have been passed to the component
        expect(propsError).toBeUndefined();
    })
})

describe('<Encryption/> positive scenario test',()=>{
	let wrapper;
    beforeEach(()=>{
        wrapper=setUp()
		jest.spyOn(api,'Encrypt_ICE').mockImplementation(()=>{
            return Promise.resolve("ObJ0YfDpLIxece6to+fWSDO3q6eZKbIcb5gwNrTdGx8=")
        });
        
    })
	afterEach(()=>{
        jest.restoreAllMocks()
    })
	
	it('Should render the select dropdown, Encryption data input field , encrypted data field',()=>{

        // Assert that the encryption type select dropdown is being rendered
        expect(findByTestAtrr(wrapper,'utility_screen_selection_sel').length).toBe(1)

        // Assert that encryption data field is rendered
        expect(findByTestAtrr(wrapper,'utility_encryption_data_inp').length).toBe(1)

        // Assert that the encrypted data field is renders in middle screen
        expect(findByTestAtrr(wrapper,'utility_encrypted_data_inp').length).toBe(1)

    })
	
	it('Should render the buttons along with correct name when dropdown is selected',(done)=>{
        wrapper=ondropDownorinputChange(wrapper,'utility_screen_selection_sel',dropdownOptions[0]) 
        setTimeout(()=>{
            wrapper.update();

            //Assert if the correct button is rendered as per encryption type->
            expect(findByTestAtrr(wrapper,'encryption_options_btn').text()).toBe("Encrypt")
            //Assert if reset button is rendered->
            expect(findByTestAtrr(wrapper,'encryption_reset_btn').text()).toBe("Reset")        
            done();
        })
        
    })
    it('Should render the buttons along with correct name when dropdown is selected',(done)=>{
        wrapper=ondropDownorinputChange(wrapper,'utility_screen_selection_sel',dropdownOptions[1]) 
        setTimeout(()=>{
            wrapper.update();

            ////Assert if the correct button is rendered as per encryption type->->
            expect(findByTestAtrr(wrapper,'encryption_options_btn').text()).toBe("Generate")
            ////Assert if reset button is rendered->->
            expect(findByTestAtrr(wrapper,'encryption_reset_btn').text()).toBe("Reset")        
            done();
        })
        
    })
    it('Should render the buttons along with correct name when dropdown is selected',(done)=>{
        wrapper=ondropDownorinputChange(wrapper,'utility_screen_selection_sel',dropdownOptions[2]) 
        setTimeout(()=>{
            wrapper.update();
            //Assert if the correct button is rendered as per encryption type->
            expect(findByTestAtrr(wrapper,'encryption_options_btn').text()).toBe("Encode")
            //Assert if reset button is rendered->
            expect(findByTestAtrr(wrapper,'encryption_reset_btn').text()).toBe("Reset")        
            done();
        })
        
    })
    
    it('Should render the encrypted data when encryption files is changes and encode btn is clicked', async(done)=>{
        const dropdown=findByTestAtrr(wrapper,'utility_screen_selection_sel');
        dropdown.simulate('change',{
            target:dropdownOptions[0]
        })
        wrapper.update()
        const btn=findByTestAtrr(wrapper,'encryption_options_btn');
        const inp=findByTestAtrr(wrapper,"utility_encryption_data_inp");
        inp.simulate('change',{
            target:"helloThereTestmishra"
        })
        btn.simulate('click')
        wrapper.update()
        setTimeout(()=>{
            wrapper.update();
            //Assert if the encrypted data field if rendered and if the value rendered is correct->
            expect(findByTestAtrr(wrapper,'utility_encrypted_data_inp').text()).toBe("ObJ0YfDpLIxece6to+fWSDO3q6eZKbIcb5gwNrTdGx8=")
            done();
        })
    })
})


// True Negative Scene  
// 1. If encryption data field is empty and usewr clicks on encrypt/encode/generate button nothing should be printed in encrypted data field 
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
