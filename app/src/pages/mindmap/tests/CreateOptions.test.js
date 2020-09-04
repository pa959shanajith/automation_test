import React from 'react';
import { shallow } from 'enzyme';
import CreateOptions from '../components/CreateOptions';
import {findByTestAtrr} from '../../../setupTests';


const setUp = (props={setOptions:()=>{}}) => {
    const component = shallow(<CreateOptions {...props} />);
    return component;
};

describe('Create Options', () => {
    let wrapper;
    beforeEach(() => {
        wrapper = setUp();
    });
    it('Should render 3 components without errors', () => {
        const component = findByTestAtrr(wrapper, 'OptionBox');
        expect(component.length).toBe(3);
    });
});