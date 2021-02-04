import React from 'react';
import { shallow,mount } from 'enzyme';
import PluginBox from '../components/PluginBox';
import {findByTestAtrr, checkProps} from '../../../setupTests';
import {userInfo,dummyPlugin} from './dummyData'


const setUp=()=>{
    let props={plugin:dummyPlugin}
    let wrapper=shallow(<PluginBox {...props}/>)
    return wrapper
}

const sampleObject={test:'test'}

// True Positive
// 1. All the expected and required props should be available
// 2. Render of the single plugin box correctly
describe('<PluginBox/> Positive  Scenarios',()=>{
    let wrapper;
    it('Should contain the required and expected props',()=>{

        const expectedProps={
            plugin:sampleObject
        }
        const propsError=checkProps(PluginBox,expectedProps)
        expect(propsError).toBeUndefined()

    })
})
describe('<PluginBox/> Positive  Scenarios',()=>{
    let wrapper;
    beforeEach(()=>{
        
        wrapper=setUp()
    })
    it('Should render the single plugin box correctly',()=>{
        // console.log(wrapper.debug())
        // Assert that full plugins section is being rendered
        expect(findByTestAtrr(wrapper,'plugin-blocks').length).toBe(1)
        // Assert that plugin image is being rendered
        expect(findByTestAtrr(wrapper,'plugin-image').length).toBe(1)
        // Assert that plugin name is being rendered
        expect(findByTestAtrr(wrapper,'plugin-name').length).toBe(1)
        // Assert that plugin name is correct
        expect(findByTestAtrr(wrapper,'plugin-name').text()).toBe(dummyPlugin.pluginName)
        
    })
    it('Should change the redirectTo when clicked on a particular plugin',()=>{
      
        findByTestAtrr(wrapper,'plugin-blocks').simulate('click')
        expect(findByTestAtrr(wrapper.update(),'redirectTo').length).toBe(1)
        console.log(wrapper.update().debug())
        
    })
})

