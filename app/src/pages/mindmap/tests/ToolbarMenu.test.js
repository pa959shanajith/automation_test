import * as React from 'react';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import {mount}from 'enzyme';
import * as reactRedux from 'react-redux'
import ToolbarMenu from '../components/ToolbarMenu';
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';
import * as dummyData from './dummyData'
const props={
    setPopup:jest.fn(),
    setBlockui:jest.fn(),
    displayError:jest.fn()
}
const state={
    mindmap:{
        selectBoxState:false,
        selectNodes:{"nodes":[],"links":[]},
        copyNodes:{"nodes":[],"links":[]},
        projectList:dummyData.projectList,
        selectedProj:"5fb4fc98f4da702833d7e0a0",
        moduleList:[
            {"_id":"5fb4ffc5f4da702833d7e0a1","name":"Module_login","type":"basic"},
            {"_id":"5fbbf896f4da702833d7e0e1","name":"Module_0","type":"basic"},
            {"_id":"5fecc7e4d2ce8ecfe96896a1","name":"Module_test31","type":"basic"},
            {"_id":"605873b0b4e87f2ff0b0cb3d","name":"Module_789","type":"basic"}]
}}
const dataTestList=['projectLabel','projectSelect','headerMenu','searchBox','createNew']
// positive
describe('<ToolbarMenu/> Positive scenarios',()=>{
    it('Shoudld contain the requied and expected props',()=>{ 
        const expectedProps= {
            setPopup:()=>{},
            setBlockui:()=>{},
            displayError:()=>{}
    }
        const propsError=checkProps(ToolbarMenu,expectedProps)
        expect(propsError).toBeUndefined()
    });
});
describe('<ToolbarMenu/> Positive Scenarios',()=>{
    let wrapper;
    beforeEach(()=>{
        const mockStore=createStore(reducer,state)
        const mockDispatch=jest.fn()
        jest.spyOn(reactRedux,'useDispatch').mockReturnValue(mockDispatch)
        wrapper=mount(<Provider store={mockStore}><ToolbarMenu {...props}/></Provider>);
    })
    it('Should render the required components',()=>{
        for(let i=0;i<dataTestList.length;i++){
            expect(findByTestAtrr(wrapper,dataTestList[i]).length).toBe(1);
        }
        // Assert that the project dropdown is populated
        expect(findByTestAtrr(wrapper,'projectSelect').children().length).toBe(2)
        // Assert that {add a rectangle, copy image, paste image} present in headers 
        expect(findByTestAtrr(wrapper,'headerMenu').children().length).toBe(3)
    })
})