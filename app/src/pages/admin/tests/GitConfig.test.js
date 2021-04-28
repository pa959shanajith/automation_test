import React from 'react';
import { mount } from 'enzyme';
import GitConfig from '../containers/GitConfig';
import {findByTestAtrr} from '../../../setupTests';
import DummyData from './dummyData';
import { act } from 'react-dom/test-utils';
import * as api from '../api'


const expectedProps={
    resetMiddleScreen : jest.fn(),
    middleScreen : "gitConfigure"
}

const setUp=()=>{
    jest.spyOn(api,'getUserDetails').mockImplementation(()=>{
        return Promise.resolve(DummyData.getUserDetailsApi)
    });
    let wrapper = mount(<GitConfig {...expectedProps} />);
    return wrapper
}

const updateWrapper = async(wrapper) => {
    await act(async()=>{
        await new Promise(r=>setTimeout(r))
        wrapper.update()
    })
}

describe('<GitConfig/> positive scenario test',()=>{
    let wrapper;
    let userDrop;
    let domainDrop;
    let projectDrop;
    beforeEach(async ()=>{
        wrapper=setUp()
        await updateWrapper(wrapper)    
    });

    afterEach(()=>{
        jest.resetAllMocks();
    })
    
    it('Should render input and select fields',() => {
        expect(findByTestAtrr(wrapper,'user_git').length).toBe(1)
        expect(findByTestAtrr(wrapper,'domain_git').length).toBe(1)
        expect(findByTestAtrr(wrapper,'project_git').length).toBe(1)
        expect(findByTestAtrr(wrapper,'token_git').length).toBe(1)
        expect(findByTestAtrr(wrapper,'url_git').length).toBe(1)
    }) 

    it('Should fill user list in user select field',() => {
        userDrop = findByTestAtrr(wrapper,'user_git')
        expect(findByTestAtrr(userDrop,'select_comp').children().length).toBe(4);
    }) 

    it('Should fill domain list after user is selected',async() => {
        domainDrop=findByTestAtrr(wrapper,'domain_git');
        userDrop.simulate('change',{
            target:{selectedIndex:1}
        })
        await updateWrapper(wrapper)
        jest.spyOn(api,'getDomains_ICE').mockImplementation(()=>{
            return Promise.resolve(DummyData.domainList)
        });
        await updateWrapper(wrapper)
        expect(findByTestAtrr(domainDrop,'select_comp').children().length).toBe(4);
    }) 

    it('Should disable update and delete button when clicked on edit button',() => {
        findByTestAtrr(wrapper,'git_edit').simulate('change')
        var updateBtn = findByTestAtrr(wrapper,'git_update');
        expect(updateBtn.getDOMNode().disabled).toBe(true);
        var deleteBtn = findByTestAtrr(wrapper,'git_delete');
        expect(deleteBtn.getDOMNode().disabled).toBe(true)
    }) 

})