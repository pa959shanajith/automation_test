import * as React from 'react';
import {findByTestAtrr, checkProps} from '../../../setupTests';
import {mount}from 'enzyme';
import Controlbox from '../components/Controlbox';
document.body.innerHTML =
'<g id="node_8" class="ct-node" data-nodetype="scenarios" transform="translate(171.19,270)">'+
'<image class="ct-nodeIcon" xlink:href="static/imgs/node-scenarios.png" style="height: 45px; width: 45px; opacity: 1;"></image>'+
'<text class="ct-nodeLabel" text-anchor="middle" x="20" title="Slk_bank_Reg_Scenario_Customer_Service" y="50">Slk_bank_Reg_Sc...</text>'+
'<title val="8" class="ct-node-title">Slk_bank_Reg_Scenario_Customer_Service</title>'+
'<circle class="ct-scenarios ct-cRight ct-nodeBubble" cx="44" cy="20" r="4"></circle>'+
'<circle cx="-3" cy="20" class="ct-scenarios ct-nodeBubble" r="4"></circle>'+
'</g>'
const props={
    "nid": "node_8",
    "setMultipleNode": jest.fn(),
    "clickAddNode": jest.fn(),
    "clickDeleteNode": jest.fn(),
    "setCtrlBox": jest.fn(),
    "setInpBox":jest.fn(),
    "ctScale": {
      "x": 248.07905835536639,
      "y": 4.289567128792243,
      "k": 0.8705505632961241
    }
}

const itemList=['add','addMultiple','edit','delete']
// Positive
describe('<Controlbox/> Positive scenarios',()=>{
    it('Shoudld contain the requied and expected props',()=>{ 
        const expectedProps= {
        "nid": "node",
        "setMultipleNode": ()=>{},
        "clickAddNode": ()=>{},
        "clickDeleteNode": ()=>{},
        "setCtrlBox": ()=>{},
        "setInpBox":()=>{},
        "ctScale": {"x": 1,"y": 2,"k": 3}
    }
        const propsError=checkProps(Controlbox,expectedProps)
        expect(propsError).toBeUndefined()
    });
});
describe('<Controlbox/> Positive scenarios',()=>{
    let wrapper;
    beforeEach(()=>{wrapper=mount(<Controlbox {...props}/>);})
    it('Shoudld render the components',()=>{ 
        for(let i=0;i<4;i++){
            expect(findByTestAtrr(wrapper,itemList[i]).length).toBe(1)
        }       
    });
    it('Should have onClick props ',()=>{
        const wrapper=mount(<Controlbox {...props}/>)
        for(let i=0;i<4;i++){
            expect(findByTestAtrr(wrapper,itemList[i]).prop('onClick')).toBeTruthy()
        }
    });
})



