import * as React from 'react';
import {shallow}from 'enzyme';
import * as dummyData from './dummyData'
import {findByTestAtrr} from '../../../setupTests';
import CompareBox from '../containers/CompareBox';
import ScrollBar from '../../global/components/ScrollBar'

// Positive
describe('<CompareBox/> Positive Scenarios',()=>{
    it('Should render the required components',()=>{
        const props={
            objList:dummyData.scrapeItems,
            checkedList:false,
            hideCheckbox:false,
            header:"Compare Object"
        }
        const wrapper=shallow(<CompareBox {...props}/>);
        expect(findByTestAtrr(wrapper,'header').length).toBe(1);
        expect(findByTestAtrr(wrapper,'compareList').length).toBe(1);
        expect(wrapper.find(ScrollBar).length).toBe(1)
    })
})