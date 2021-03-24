import React from 'react';
import { mount } from 'enzyme';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import ToolbarMenu from '../components/ToolbarMenu';
import {reportData} from './dummyData';
import {act} from 'react-dom/test-utils'
import * as api from '../api'
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';


const setUp=(FnReport)=>{
    const expectedProps={
        displayError:jest.fn(),
        setBlockui:jest.fn(),
        setModDrop:jest.fn(),
        FnReport:FnReport
    }
    const store = {
        plugin:{
            tasksJson: {},
            FD: {},
            CT: {},
            RD: {
                'cycleid': undefined,
                'releaseid': undefined,
                'testsuiteid': undefined,
                'projectid': undefined,
                'testsuitename': undefined
            }
        },
        moduleList : [],
        suiteDetails : [],
        suiteSelected : {_id:undefined,name:""}
    }
    const mockStore=createStore(reducer,store) 
    jest.spyOn(api,'getAllSuites_ICE').mockImplementation(()=>{
        return Promise.resolve(reportData)
    });
    jest.spyOn(api, 'getReportsData_ICE').mockImplementation(()=>{
        return Promise.resolve({rows:[]})
    });
    var wrapper=mount(<Provider store={mockStore} ><ToolbarMenu {...expectedProps} /></Provider>);
    return wrapper
}

describe('<ToolbarMenu/> Positive Scenarios',()=>{
    let wrapper
    let projDrop
    let relDrop
    let cyclDrop
    it('Should contain the expected and required props',()=>{
        const expectedProps={
            displayError:jest.fn(),
            setBlockui:jest.fn(),
            setModDrop:jest.fn(),
            FnReport:true
        }
        const propsError=checkProps(ToolbarMenu,expectedProps)
        expect(propsError).toBeUndefined()
    })
    it('Should render 4 project options',async()=>{
        wrapper=setUp(true)
        await act(()=>Promise.resolve())
        wrapper.update()
        projDrop=findByTestAtrr(wrapper,'rp_toolbar-proj');
        expect(projDrop.find('option').length).toBe(5)  
    })
    it('Select a project populate release',async()=>{
        relDrop=findByTestAtrr(wrapper,'rp_toolbar-rel');
        projDrop.at(0).simulate('change',{
            target:{selectedIndex:1}
        })
        wrapper.update()
        expect(relDrop.find('option').length).toBe(2) 
    })
    it('Select a release populate cycle',async()=>{
        relDrop.at(0).simulate('change',{
            target:{selectedIndex:1}
        })
        cyclDrop=findByTestAtrr(wrapper,'rp_toolbar-cycl');
        wrapper.update()
        expect(cyclDrop.find('option').length).toBe(2) 
    })
});

describe('<ToolbarMenu/> Negative Scenarios',()=>{
    let wrapper
    let projDrop
    let relDrop
    let cyclDrop
    it('change in project resets release list and empty cycle list',async()=>{
        wrapper=setUp(true)
        await act(async()=>{
            await new Promise(r=>setTimeout(r))
            wrapper.update()
        })
        relDrop=findByTestAtrr(wrapper,'rp_toolbar-rel');
        cyclDrop=findByTestAtrr(wrapper,'rp_toolbar-cycl');
        expect(relDrop.find('option').length).toBe(2)
        expect(cyclDrop.find('option').length).toBe(1)
        //select release
        relDrop.at(0).simulate('change',{
            target:{selectedIndex:1}
        })
        await act(async()=>{
            await new Promise(r=>setTimeout(r))
            wrapper.update()
        })
        cyclDrop=findByTestAtrr(wrapper,'rp_toolbar-cycl');
        expect(cyclDrop.find('option').length).toBe(2) 
        projDrop=findByTestAtrr(wrapper,'rp_toolbar-proj');
        //change project which should reset release and cycle
        projDrop.at(0).simulate('change',{
            target:{selectedIndex:4}
        })
        await act(async()=>{
            await new Promise(r=>setTimeout(r))
            wrapper.update()
        })
        relDrop=findByTestAtrr(wrapper,'rp_toolbar-rel'); 
        cyclDrop=findByTestAtrr(wrapper,'rp_toolbar-cycl');
        expect(relDrop.find('option').length).toBe(3)
        expect(cyclDrop.find('option').length).toBe(1)
    })
    it('search should be disabled before selecting cycle',async()=>{
        var searchBox = findByTestAtrr(wrapper,'rp_toolbar-search');
        expect(searchBox.getDOMNode().disabled).toBe(true)
    })
    it('search should be enabled after selecting cycle',async()=>{
        cyclDrop.at(0).simulate('change',{
            target:{selectedIndex:2}
        })
        await act(async()=>{
            await new Promise(r=>setTimeout(r))
            wrapper.update()
        })
        var searchBox = findByTestAtrr(wrapper,'rp_toolbar-search');
        expect(searchBox.getDOMNode().disabled).toBe(false)
    })
});