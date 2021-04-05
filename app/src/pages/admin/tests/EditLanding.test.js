import React from 'react';
import { mount } from 'enzyme';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import EditLanding from '../components/EditLanding';
import DummyData from './dummyData'
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';
import * as reactRedux from 'react-redux';

const setUp=()=>{
    let store;
    let wrapper;
    const d=jest.fn();
    store = {
        admin:{ userConf:DummyData.userConf }   
    }
    const props= DummyData.EditLandingProps;
    const mockStore=createStore(reducer,store);
    jest.spyOn(reactRedux,'useDispatch').mockReturnValue(d)
    wrapper=mount(<Provider store={mockStore} ><EditLanding {...props} /></Provider>);
    
    return wrapper
}


// True Positive Scene 
// 1.   Check for the props that are being passed to the component
// 2.   Check for page render with basic heading, buttons( delete, update ), input fields( firstname, lastname, password, confirm password, email Id), Search User dropdown and primary role label and Dropdown

describe('<EditLanding/> props Check',()=>{
    it('Should contain required and expected props',()=>{
        const expectedProps = DummyData.EditLandingProps;
        const propsError = checkProps(EditLanding, expectedProps);
        expect(propsError).toBeUndefined();
    })
})

describe('<EditLanding/> positive scenario test',()=>{
	let wrapper;
    beforeEach(()=>{
        wrapper=setUp();
    });

    afterEach(()=>{
        jest.resetAllMocks();
    })
    
    it('Should render basic heading, buttons( delete, update ), input fields( firstname, lastname, password, confirm password, email Id), Search User dropdown and primary role label and Dropdown',()=>{
        expect(findByTestAtrr(wrapper,'updateButton').length).toBe(1)
        expect(findByTestAtrr(wrapper,'deleteButton').length).toBe(1)
        expect(findByTestAtrr(wrapper,'firstName-input__edit').length).toBe(1)
        expect(findByTestAtrr(wrapper,'lastName-input__edit').length).toBe(1)
        expect(findByTestAtrr(wrapper,'userListInputEdit').length).toBe(1)
    })
})  


// True Negative Scene  
// 1. If first name and last name values are empty and update button is clicked then the error border should appear

describe('<CreateUser/> negative scenario test ',()=>{

    let wrapper;
    beforeEach(()=>{
        wrapper=setUp();
    });

    afterEach(()=>{
        jest.resetAllMocks();
    })
    
    it('Should render firstName with error border for having empty value on click of update button', ()=>{
        findByTestAtrr(wrapper,'firstName-input__edit').simulate('change',{target:{value:''}})
        findByTestAtrr(wrapper,'updateButton').simulate('click');
        expect(findByTestAtrr(wrapper,'firstName-input__edit').prop('className')).toBe("middle__input__border-edit form-control__conv-edit form-control-custom-edit  inputErrorBorder");  
    })

    it('Should render lastName with error border for having empty value on click of update button', ()=>{
        findByTestAtrr(wrapper,'lastName-input__edit').simulate('change',{target:{value:''}})
        findByTestAtrr(wrapper,'updateButton').simulate('click');
        expect(findByTestAtrr(wrapper,'lastName-input__edit').prop('className')).toBe("middle__input__border-edit form-control__conv-edit form-control-custom-edit inputErrorBorder");  
    })
})