import React from 'react';
import { shallow,mount } from 'enzyme';
import PluginSection from '../components/PluginSection';
import {findByTestAtrr, checkProps} from '../../../setupTests';
import {userInfo} from './dummyData';

const setUp=()=>{
    const props={userInfo:userInfo}
    let wrapper=mount(<PluginSection {...props}/>)
    return wrapper
}
const sampleObject={test:'test'}

// True Positive
// 1. Expected and Required Props are present
// 2. Should render only the available plugins to the user
describe('<PluginSection/> Positive Scenarios',()=>{
    it('Should contain the required and expected props',()=>{
        const expectedProps={
            userInfo: sampleObject
        }
        const propsError=checkProps(PluginSection,expectedProps)
        expect(propsError).toBeUndefined()
    })
})

describe('<PluginSection/> Positive Scenarios',()=>{
    let wrapper
    beforeEach(()=>{
        wrapper=setUp();
    })

    it('Should render the required plugins section',()=>{
        wrapper=setUp();

        // Assert that the complete section is being rendred
        expect(wrapper.length).toBe(1)

        // Assert that the headings are being rendered
        expect(findByTestAtrr(wrapper,'available-plugins-title').length).toBe(1)

        const availablePlugins = userInfo.pluginsInfo;
        let count=0
        // (availablePlugins)
        let pluginsLength = availablePlugins.length;
        for(let i=0 ; i < pluginsLength ; i++){
            if(availablePlugins[i].pluginValue == true)  count++;
            
        }
        const pluginsAll=findByTestAtrr(wrapper,'plugins-blocks')
        // Assert that plugins sections contains all the plugins which are available to the user
        expect(pluginsAll.children().length).toBe(count)
        
    })
})
