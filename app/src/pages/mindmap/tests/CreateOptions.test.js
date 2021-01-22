import React from 'react';
import {mount} from 'enzyme';
import CreateOptions from '../components/CreateOptions';
import {findByTestAtrr} from '../../../setupTests';
import { Provider } from 'react-redux';
import reducer from '../state/reducer';
import {createStore} from 'redux';

const setUp = (props={setOptions:()=>{}}) => {
    const mockStore = createStore(reducer, {count: 0});
    const component =
    mount(
        <Provider store={mockStore}>
          <CreateOptions {...props} />
        </Provider>
      );
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