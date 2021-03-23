import * as React from 'react';
import {findByTestAtrr} from '../../../setupTests';
import {shallow} from 'enzyme';
import SearchBox from '../components/SearchBox';

// Positive
describe('<SearchBox/> Positive Scenarios',()=>{
    it('Should render the fields of the components',()=>{
        const wrapper=shallow(<SearchBox/>);
        expect(findByTestAtrr(wrapper,'searchIcon').length).toBe(1);
        expect(findByTestAtrr(wrapper,'searchBox').length).toBe(1);
    })
})