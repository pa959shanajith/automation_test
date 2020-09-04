import React from 'react';
import { shallow } from 'enzyme';
import {findByTestAtrr} from '../../../setupTests';
import SearchBox from '../components/SearchBox';


const setUp = (props={setOptions:()=>{}}) => {
    const component = shallow(<SearchBox {...props} />);
    return component;
};

describe('Create SerachBox', () => {
    let wrapper;
    beforeEach(() => {
        wrapper = setUp();
    });
    it('Should render search without errors', () => {
        const component = findByTestAtrr(wrapper, 'SearchCanvas');
        expect(component.length).toBe(1);
    });
});