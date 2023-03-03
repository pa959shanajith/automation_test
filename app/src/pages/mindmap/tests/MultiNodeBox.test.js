import * as React from 'react';
import {findByTestAtrr, checkProps} from '../../../setupTests';
import {mount}from 'enzyme';
import MultiNodeBox from '../components/MultiNodeBox'
import {PopupMsg} from '../../global';
document.body.innerHTML =
'<g id="node_0"  class="ct-node node-highlight" data-nodetype="modules" transform="translate(121.32000000000001,199.60000000000002)">'+
'<image class="ct-nodeIcon" xlink:href="static/imgs/node-modules.png" style="height: 40px; width: 40px; opacity: 0.5;"></image>'+    
'<text class="ct-nodeLabel" text-anchor="middle" x="20" title="Module_0" y="50">Module_test</text>' +
'<title val="0" class="ct-node-title">Module_test</title>'+
'<circle class="ct-modules ct-cRight ct-nodeBubble" cx="44" cy="20" r="4"></circle>'+
'</g>';
const props={
    "count": {
      "modules": 1,
      "scenarios": 0,
      "screens": 0,
      "testcases": 0
    },
    "node": "0",
    "setMultipleNode": jest.fn(),
    "createMultipleNode": jest.fn()
}
// Positive 
describe('<MultiNodeBox/> Positive Scenarios',()=>{
    it('Should contain the required and expected props',()=>{
        const expectedProps={
            "count":{"a":1},
            "node":"abcd",
            "setMultipleNode":jest.fn(),
            "createMultipleNode":jest.fn()
        }
        const propsError=checkProps(MultiNodeBox,expectedProps)
        expect(propsError).toBeUndefined()
    })
})
describe('<MultiNodeBox/> Positive Scenarios',()=>{
    let wrapper;
    beforeEach(()=>{
        wrapper=mount(<MultiNodeBox {...props}/>);
    })
    it('Should render the required components',()=>{
        expect(findByTestAtrr(wrapper,'addButtonDiv').length).toBe(1);
        expect(findByTestAtrr(wrapper,'addButtonDiv').children().length).toBe(2);
        expect(findByTestAtrr(wrapper,'index').length).toBe(2);
        expect(findByTestAtrr(wrapper,'scenarioName').length).toBe(2);
        expect(findByTestAtrr(wrapper,'deleteButton').length).toBe(2);
        expect(findByTestAtrr(wrapper,'errorMessageLabel').length).toBe(1);
        expect(findByTestAtrr(wrapper,'reset').length).toBe(1);
        expect(findByTestAtrr(wrapper,'submit').length).toBe(1);
    });
    it('Should add extra scenario fields',async ()=>{
        findByTestAtrr(wrapper,'addButtonDiv').simulate('click');
        // Assert that the new scenarios field has been added
        expect(findByTestAtrr(wrapper,'scenarioName').length).toBe(3);
    });
    it('Should delete the added scenarios',()=>{
        findByTestAtrr(wrapper,'deleteButton').at(0).find('img').simulate('click');
        // assert that only one scenario name is remaining
        expect(findByTestAtrr(wrapper,'scenarioName').length).toBe(1);
    });
    it('Should submit multiple scenarios',()=>{
        findByTestAtrr(wrapper,'submit').simulate('click');
        expect(props.createMultipleNode).toHaveBeenCalledWith("0",['Scenario_1','Scenario_2']);
    })
});

// Negative
describe('<MultiNodeBox/> Negative Scenarios',()=>{
    let wrapper;
    beforeEach(()=>{
        wrapper=mount(<MultiNodeBox {...props}/>);
    })
    it('Should raise the required popup when more than 10 multiple nodes are entered',()=>{
        for(let i=0;i<10;i++){
            findByTestAtrr(wrapper,'addButtonDiv').simulate('click');
        }
        findByTestAtrr(wrapper,'submit').simulate('click');
        // Assert that the popup component is being rendered
        expect(wrapper.find(PopupMsg).length).toBe(1)
    });
    it('Should display the error message if node name is not valid',()=>{
        findByTestAtrr(wrapper,'scenarioName').at(0).find('input').simulate('change',{target:{id:"mnode_0",value:"Scene1"}});
        findByTestAtrr(wrapper,'submit').simulate('click');
        // Assert that the error message is being rendered if the node name is not valid
        expect(findByTestAtrr(wrapper,'errorMessageLabel').text().length).toBeGreaterThan(0)
    })
})
