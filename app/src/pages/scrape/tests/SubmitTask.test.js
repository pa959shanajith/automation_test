import * as React from 'react';
import {findByTestAtrr, checkProps} from '../../../setupTests';
import {mount}from 'enzyme';
import SubmitTask from '../components/SubmitTask';
import dummyData from './dummyData'
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';

// Positive
describe('<SubmitTask/> Positive Scenarios',()=>{

    it('Should render the required components when under review',async ()=>{
        const contextValues={
            isUnderReview:true,
            hideSubmit:true, 
            setShowConfirmPop:jest.fn(), 
            setShowPop:jest.fn()
        }
        const store = {plugin:{CT:dummyData.CT}}
        const mockStore=createStore(reducer,store) 
        // jest.spyOn(globalapi,'reviewTask').mockImplementation(()=>{return Promise.resolve("underReview")})
        jest.spyOn(React,'useContext').mockImplementation(()=>{return contextValues})
        let wrapper=mount(<Provider store={mockStore}><SubmitTask/></Provider>)
        // console.log(wrapper.debug())
        // Assert that the if underReview then reassign and approve button is only rendered and submit button is not rendered
        expect(findByTestAtrr(wrapper,'reassignButton').length).toBe(1);
        expect(findByTestAtrr(wrapper,'approveButton').length).toBe(1);
        expect(findByTestAtrr(wrapper,'submitButton').length).toBe(0);
    });
    it('Should render submit button when not under review',()=>{
      const contextValues={
          isUnderReview:false,
          hideSubmit:false, 
          setShowConfirmPop:jest.fn(), 
          setShowPop:jest.fn()
      }
      const store = {plugin:{CT:dummyData.CT}}
      const mockStore=createStore(reducer,store) 
      jest.spyOn(React,'useContext').mockImplementation(()=>{return contextValues});
      let wrapper=mount(<Provider store={mockStore}><SubmitTask/></Provider>);
      expect(findByTestAtrr(wrapper,'submitButton').length).toBe(1);
      expect(findByTestAtrr(wrapper,'reassignButton').length).toBe(0);
      expect(findByTestAtrr(wrapper,'approveButton').length).toBe(0);
    });
    it('Should call the confirmation popup when clicked on the button',async ()=>{
      const contextValues={
        isUnderReview:false,
        hideSubmit:false, 
        setShowConfirmPop:jest.fn(), 
        setShowPop:jest.fn()
      }
      const store = {plugin:{CT:dummyData.CT}}
      const mockStore=createStore(reducer,store) 
      jest.spyOn(React,'useContext').mockImplementation(()=>{return contextValues});
      let wrapper=mount(<Provider store={mockStore}><SubmitTask/></Provider>);
      findByTestAtrr(wrapper,'submitButton').simulate('click');
      // console.log(contextValues.setShowConfirmPop.mock.calls);
      const submitTask=jest.fn()
      expect(contextValues.setShowConfirmPop).toHaveBeenCalled();
    })
})

