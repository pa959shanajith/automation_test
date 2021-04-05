import React from 'react';
import { mount } from 'enzyme';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import CreateUser from '../containers/CreateUser';
import DummyData from './dummyData'
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';
import * as reactRedux from 'react-redux';
import * as api from '../api'

const setUp=()=>{
    let store;
    let wrapper;
    const d=jest.fn();
    store = {
        admin:{ userConf:DummyData.userConf }   
    }
    const props={resetMiddleScreen : jest.fn(),
        showEditUser : false,
        setShowEditUser : jest.fn(),
        setMiddleScreen : jest.fn(),
        middleScreen : "createUser"
    }
    const mockStore=createStore(reducer,store);
    jest.spyOn(reactRedux,'useDispatch').mockReturnValue(d)
    wrapper=mount(<Provider store={mockStore} ><CreateUser {...props} /></Provider>);
    
    return wrapper
}

// True Positive Scene 
// 1.   Check for the props that are being passed to the component
// 2.   Check for the Landing page render with basic heading, buttons( clear, create, edit), User Type Label and Dropdown, input fields( username, firstname, lastname, password, confirm password, email Id) and primary role label and Dropdown
// 3.   Click operation on the clear button
// 4.1  Change user type to SAML - render basic inputs and select server dropdown
// 4.2  Change user type to OpenID - render basic inputs and select server dropdown
// 4.3  Change user type to LDAP - render basic inputs, select server dropdown, user radio buttons, user domain name input and fetch button    
// 5.   Change server when user type is LDAP -  user radio buttons and Fetch Button should not be disabled
// 5.1  Change server when user type is LDAP and click on import radio button

describe('<CreateUser/> props Check',()=>{
    it('Should contain required and expected props',()=>{
        const expectedProps = {
            resetMiddleScreen : jest.fn(),
            showEditUser : false,
            setShowEditUser : jest.fn(),
            setMiddleScreen : jest.fn(),
            middleScreen : "createUser"
        };
        const propsError = checkProps(CreateUser, expectedProps);
        expect(propsError).toBeUndefined();
    })
})

describe('<CreateUser/> positive scenario test',()=>{
    let wrapper;
    beforeEach(()=>{
        wrapper=setUp();
    });

    afterEach(()=>{
        jest.resetAllMocks();
    })
    
    it('Should render Landing Page heading, buttons( clear, create, edit), User Type Label and Dropdown, input fields( username, firstname, lastname, password, confirm password, email Id) and primary role label and Dropdown',()=>{
        expect(findByTestAtrr(wrapper,'create__container').length).toBe(1)
        expect(findByTestAtrr(wrapper,'heading').length).toBe(1)
        expect(findByTestAtrr(wrapper,'editButton').length).toBe(1)
        expect(findByTestAtrr(wrapper,'createButton').length).toBe(1)
        expect(findByTestAtrr(wrapper,'clearButton').length).toBe(1)
        expect(findByTestAtrr(wrapper,'userTypeLabel').length).toBe(1)
        expect(findByTestAtrr(wrapper,'userTypeDropdown').length).toBe(1)
        expect(findByTestAtrr(wrapper,'userName-input__create').length).toBe(1)
        expect(findByTestAtrr(wrapper,'firstName-input__create').length).toBe(1)
        expect(findByTestAtrr(wrapper,'lastName-input__create').length).toBe(1)
        expect(findByTestAtrr(wrapper,'password').length).toBe(1)
        expect(findByTestAtrr(wrapper,'confirmPassword').length).toBe(1)
        expect(findByTestAtrr(wrapper,'email').length).toBe(1)
        expect(findByTestAtrr(wrapper,'primaryRoleLabel').length).toBe(1)
        expect(findByTestAtrr(wrapper,'primaryRoleDropdown').length).toBe(1)
        jest.spyOn(api,'getUserRoles').mockImplementation(()=>{return Promise.resolve(DummyData.getUserRolesApiResponse)});  
    })

    it('Should reset screen to Landing Page on click of clear button',()=>{
        findByTestAtrr(wrapper,'clearButton').simulate('click');
        wrapper.update();
        expect(findByTestAtrr(wrapper,'create__container').length).toBe(1)
        expect(findByTestAtrr(wrapper,'heading').length).toBe(1)
        expect(findByTestAtrr(wrapper,'editButton').length).toBe(1)
        expect(findByTestAtrr(wrapper,'createButton').length).toBe(1)
        expect(findByTestAtrr(wrapper,'clearButton').length).toBe(1)
        expect(findByTestAtrr(wrapper,'userTypeLabel').length).toBe(1)
        expect(findByTestAtrr(wrapper,'userTypeDropdown').length).toBe(1)
        expect(findByTestAtrr(wrapper,'userName-input__create').length).toBe(1)
        expect(findByTestAtrr(wrapper,'firstName-input__create').length).toBe(1)
        expect(findByTestAtrr(wrapper,'lastName-input__create').length).toBe(1)
        expect(findByTestAtrr(wrapper,'password').length).toBe(1)
        expect(findByTestAtrr(wrapper,'confirmPassword').length).toBe(1)
        expect(findByTestAtrr(wrapper,'email').length).toBe(1)
        expect(findByTestAtrr(wrapper,'primaryRoleLabel').length).toBe(1)
        expect(findByTestAtrr(wrapper,'primaryRoleDropdown').length).toBe(1)    
        jest.spyOn(api,'getUserRoles').mockImplementation(()=>{return Promise.resolve(DummyData.getUserRolesApiResponse)});  
    })

    it('Should reset screen to Landing Page (no input red error boundaries) on click of clear button ',()=>{
        findByTestAtrr(wrapper,'clearButton').simulate('click');
        wrapper.update();
        expect(findByTestAtrr(wrapper,'create__container').length).toBe(1)
        expect(findByTestAtrr(wrapper,'heading').length).toBe(1)
        expect(findByTestAtrr(wrapper,'editButton').length).toBe(1)
        expect(findByTestAtrr(wrapper,'createButton').length).toBe(1)
        expect(findByTestAtrr(wrapper,'clearButton').length).toBe(1)
        expect(findByTestAtrr(wrapper,'userTypeLabel').length).toBe(1)
        expect(findByTestAtrr(wrapper,'userTypeDropdown').length).toBe(1)
        expect(findByTestAtrr(wrapper,'userName-input__create').prop('value')).toBe("");
        expect(findByTestAtrr(wrapper,'userName-input__create').prop('className')).not.toBe('inputErrorBorder');
        expect(findByTestAtrr(wrapper,'firstName-input__create').prop('value')).toBe("");
        expect(findByTestAtrr(wrapper,'firstName-input__create').prop('className')).not.toBe('inputErrorBorder');
        expect(findByTestAtrr(wrapper,'lastName-input__create').prop('value')).toBe("");
        expect(findByTestAtrr(wrapper,'lastName-input__create').prop('className')).not.toBe('inputErrorBorder');
        expect(findByTestAtrr(wrapper,'password').prop('value')).toBe("");
        expect(findByTestAtrr(wrapper,'password').prop('className')).not.toBe('inputErrorBorder');
        expect(findByTestAtrr(wrapper,'confirmPassword').prop('value')).toBe("");
        expect(findByTestAtrr(wrapper,'confirmPassword').prop('className')).not.toBe('inputErrorBorder');
        expect(findByTestAtrr(wrapper,'email').prop('value')).toBe("");
        expect(findByTestAtrr(wrapper,'email').prop('className')).not.toBe('inputErrorBorder');
        expect(findByTestAtrr(wrapper,'primaryRoleLabel').length).toBe(1)
        expect(findByTestAtrr(wrapper,'primaryRoleDropdown').length).toBe(1)
        jest.spyOn(api,'getUserRoles').mockImplementation(()=>{return Promise.resolve(DummyData.getUserRolesApiResponse)});  
    })

    it('Should render SAML user inputs when usertype changes to SAML - should not render (password, confirm password) - should render select server dropdown ',()=>{
        findByTestAtrr(wrapper,'userTypeDropdown').simulate('change',{target:{value:'saml'}})
        setTimeout(()=>{
            wrapper.update();
            expect(findByTestAtrr(wrapper,'create__container').length).toBe(1)
            expect(findByTestAtrr(wrapper,'heading').length).toBe(1)
            expect(findByTestAtrr(wrapper,'editButton').length).toBe(1)
            expect(findByTestAtrr(wrapper,'createButton').length).toBe(1)
            expect(findByTestAtrr(wrapper,'clearButton').length).toBe(1)
            expect(findByTestAtrr(wrapper,'userTypeLabel').length).toBe(1)
            expect(findByTestAtrr(wrapper,'userTypeDropdown').length).toBe(1)
            expect(findByTestAtrr(wrapper,'confServer').length).toBe(1)
            expect(findByTestAtrr(wrapper,'userName-input__create').length).toBe(1)
            expect(findByTestAtrr(wrapper,'firstName-input__create').length).toBe(1)
            expect(findByTestAtrr(wrapper,'lastName-input__create').length).toBe(1)
            expect(findByTestAtrr(wrapper,'password').length).toBe(0)
            expect(findByTestAtrr(wrapper,'confirmPassword').length).toBe(0)
            expect(findByTestAtrr(wrapper,'email').length).toBe(1)
            expect(findByTestAtrr(wrapper,'primaryRoleLabel').length).toBe(1)
            expect(findByTestAtrr(wrapper,'primaryRoleDropdown').length).toBe(1)
            jest.spyOn(api,'getUserRoles').mockImplementation(()=>{return Promise.resolve(DummyData.getUserRolesApiResponse)});  
            jest.spyOn(api,'getSAMLConfig').mockImplementation(()=>{return Promise.resolve(DummyData.getSAMLConfigResponse)});
            done(); 
        }) 
    })

    it('Should render OpenID user inputs when usertype changes to OpenID - should not render (password, confirm password) - should render select server dropdown ',()=>{
        findByTestAtrr(wrapper,'userTypeDropdown').simulate('change',{target:{value:'oidc'}})
        setTimeout(()=>{
            wrapper.update();
            expect(findByTestAtrr(wrapper,'create__container').length).toBe(1)
            expect(findByTestAtrr(wrapper,'heading').length).toBe(1)
            expect(findByTestAtrr(wrapper,'editButton').length).toBe(1)
            expect(findByTestAtrr(wrapper,'createButton').length).toBe(1)
            expect(findByTestAtrr(wrapper,'clearButton').length).toBe(1)
            expect(findByTestAtrr(wrapper,'userTypeLabel').length).toBe(1)
            expect(findByTestAtrr(wrapper,'userTypeDropdown').length).toBe(1)
            expect(findByTestAtrr(wrapper,'confServer').length).toBe(1)
            expect(findByTestAtrr(wrapper,'userName-input__create').length).toBe(1)
            expect(findByTestAtrr(wrapper,'firstName-input__create').length).toBe(1)
            expect(findByTestAtrr(wrapper,'lastName-input__create').length).toBe(1)
            expect(findByTestAtrr(wrapper,'password').length).toBe(0)
            expect(findByTestAtrr(wrapper,'confirmPassword').length).toBe(0)
            expect(findByTestAtrr(wrapper,'email').length).toBe(1)
            expect(findByTestAtrr(wrapper,'primaryRoleLabel').length).toBe(1)
            expect(findByTestAtrr(wrapper,'primaryRoleDropdown').length).toBe(1)
            jest.spyOn(api,'getUserRoles').mockImplementation(()=>{return Promise.resolve(DummyData.getUserRolesApiResponse)});  
            jest.spyOn(api,'getOIDCConfig').mockImplementation(()=>{return Promise.resolve(DummyData.getOIDCConfigResponse)});
            done(); 
        }) 
    })

    it('Should render LDAP user inputs when usertype changes to LDAP - should not render (password, confirm password) - should render select server dropdown, user radio buttons, user domain name input and fetch button',()=>{
        findByTestAtrr(wrapper,'userTypeDropdown').simulate('change',{target:{value:'ldap'}})
        setTimeout(()=>{
            wrapper.update();
            expect(findByTestAtrr(wrapper,'create__container').length).toBe(1)
            expect(findByTestAtrr(wrapper,'heading').length).toBe(1)
            expect(findByTestAtrr(wrapper,'editButton').length).toBe(1)
            expect(findByTestAtrr(wrapper,'createButton').length).toBe(1)
            expect(findByTestAtrr(wrapper,'clearButton').length).toBe(1)
            expect(findByTestAtrr(wrapper,'userTypeLabel').length).toBe(1)
            expect(findByTestAtrr(wrapper,'userTypeDropdown').length).toBe(1)
            expect(findByTestAtrr(wrapper,'confServer').length).toBe(1)
            expect(findByTestAtrr(wrapper,'userLDAPFetch').length).toBe(1)
            expect(findByTestAtrr(wrapper,'ldapRadioMap').length).toBe(1)
            expect(findByTestAtrr(wrapper,'ldapRadioImport').length).toBe(1)
            expect(findByTestAtrr(wrapper,'fetchButtonLdap').length).toBe(1)

            // Assert that ldap radio buttons and fetch button is disabled when first rendered
            expect(findByTestAtrr(wrapper,'userLDAPFetch').prop('disabled')).toBeTruthy()  
            expect(findByTestAtrr(wrapper,'ldapRadioImport').prop('disabled')).toBeTruthy()  
            expect(findByTestAtrr(wrapper,'ldapRadioMap').prop('disabled')).toBeTruthy()  

            expect(findByTestAtrr(wrapper,'userDomainName').length).toBe(1)
            expect(findByTestAtrr(wrapper,'userName-input__create').length).toBe(1)
            expect(findByTestAtrr(wrapper,'firstName-input__create').length).toBe(1)
            expect(findByTestAtrr(wrapper,'lastName-input__create').length).toBe(1)
            expect(findByTestAtrr(wrapper,'password').length).toBe(0)
            expect(findByTestAtrr(wrapper,'confirmPassword').length).toBe(0)
            expect(findByTestAtrr(wrapper,'email').length).toBe(1)
            expect(findByTestAtrr(wrapper,'primaryRoleLabel').length).toBe(1)
            expect(findByTestAtrr(wrapper,'primaryRoleDropdown').length).toBe(1)
            jest.spyOn(api,'getUserRoles').mockImplementation(()=>{return Promise.resolve(DummyData.getUserRolesApiResponse)});  
            jest.spyOn(api,'getLDAPConfig').mockImplementation(()=>{return Promise.resolve(DummyData.getLDAPConfigResponse)});
            done(); 
        }) 
    })

    it('Should change disabled state of input and radio when ldap server is selected from dropdown',()=>{
        findByTestAtrr(wrapper,'userTypeDropdown').simulate('change',{target:{value:'ldap'}})
        setTimeout(()=>{
            wrapper.update();
            findByTestAtrr(wrapper,'confServer').simulate('change',{target:{value:'ldapServerName'}})
            
            setTimeout(()=>{
                wrapper.update();
                // Assert that ldap radio buttons and fetch button is not disabled
                expect(findByTestAtrr(wrapper,'userLDAPFetch').prop('disabled')).tobefalsy()  
                expect(findByTestAtrr(wrapper,'ldapRadioImport').prop('disabled')).tobefalsy()  
                expect(findByTestAtrr(wrapper,'ldapRadioMap').prop('disabled')).tobefalsy()  
                done(); 
            }) 
        })
    })

    it('Should render User List dropdown on click of import user radio - usertype: LDAP',()=>{
        findByTestAtrr(wrapper,'userTypeDropdown').simulate('change',{target:{value:'ldap'}})
        setTimeout(()=>{
            wrapper.update();
            findByTestAtrr(wrapper,'confServer').simulate('change',{target:{value:'ldapServerName'}})
            setTimeout(()=>{
                wrapper.update();
                findByTestAtrr(wrapper,'ldapRadioImport').simulate('change', {target: {checked: true}})
                
                setTimeout(()=>{
                    wrapper.update();
                    expect(findByTestAtrr(wrapper,'userListInput').length).toBe(1)
                    expect(findByTestAtrr(wrapper,'fetchButtonLdap').length).toBe(0)
                    expect(findByTestAtrr(wrapper,'userDomainName').length).toBe(0)
                    done(); 
                }) 
            })
        })
    })
})  





// True Negative Scene  
// 1. If 1.username 2.first name 3.last name 4. password 5. confirm password 6. email 7.primary role value is empty and create button is clicked then the error border should appear

describe('<CreateUser/> negative scenario test ',()=>{
    let wrapper;
    beforeEach(()=>{
        wrapper=setUp();
    });

    afterEach(()=>{
        jest.resetAllMocks();
    })

    it('Should render username with error border for blank username input on click of create button', ()=>{
        findByTestAtrr(wrapper,'userName-input__create').simulate('change',{target:{value:''}})
        findByTestAtrr(wrapper,'createButton').simulate('click');
        expect(findByTestAtrr(wrapper,'userName-input__create').prop('className')).toBe("middle__input__border-create form-control-custom-create form-control__conv-create username-cust inputErrorBorder");  
    })

    it('Should render firstName with error border for blank firstName input on click of create button', ()=>{
        findByTestAtrr(wrapper,'firstName-input__create').simulate('change',{target:{value:''}})
        findByTestAtrr(wrapper,'createButton').simulate('click');
        expect(findByTestAtrr(wrapper,'firstName-input__create').prop('className')).toBe("middle__input__border-create form-control__conv-create form-control-custom-create inputErrorBorder");  
    })

    it('Should render lastName with error border for blank lastName input on click of create button', ()=>{
        findByTestAtrr(wrapper,'lastName-input__create').simulate('change',{target:{value:''}})
        findByTestAtrr(wrapper,'createButton').simulate('click');
        expect(findByTestAtrr(wrapper,'lastName-input__create').prop('className')).toBe("middle__input__border-create form-control__conv-create form-control-custom-create inputErrorBorder");  
    })

    it('Should render password with error border for blank password input on click of create button', ()=>{
        findByTestAtrr(wrapper,'password').simulate('change',{target:{value:''}})
        findByTestAtrr(wrapper,'createButton').simulate('click');
        expect(findByTestAtrr(wrapper,'password').prop('className')).toBe("middle__input__border form-control__conv form-control-custom inputErrorBorder");  
    })

    it('Should render confirmPassword with error border for blank confirmPassword input on click of create button', ()=>{
        findByTestAtrr(wrapper,'confirmPassword').simulate('change',{target:{value:''}})
        findByTestAtrr(wrapper,'createButton').simulate('click');
        expect(findByTestAtrr(wrapper,'confirmPassword').prop('className')).toBe("middle__input__border form-control__conv form-control-custom inputErrorBorder");  
    })

    it('Should render email with error border for blank email input on click of create button', ()=>{
        findByTestAtrr(wrapper,'email').simulate('change',{target:{value:''}})
        findByTestAtrr(wrapper,'createButton').simulate('click');
        expect(findByTestAtrr(wrapper,'email').prop('className')).toBe("middle__input__border form-control__conv form-control-custom inputErrorBorder");  
    })

    it('Should render primary Role Dropdown with error border for having default value on click of create button', ()=>{
        findByTestAtrr(wrapper,'primaryRoleDropdown').simulate('change',{target:{value:''}})
        findByTestAtrr(wrapper,'createButton').simulate('click');
        expect(findByTestAtrr(wrapper,'primaryRoleDropdown').prop('className')).toBe('adminSelect form-control__conv selectErrorBorder');  
    })
})