import * as React from 'react';
import {mount}from 'enzyme';
import * as  reactRedux from 'react-redux'
import {findByTestAtrr} from '../../../setupTests';
import ScrapeObjectList from '../containers/ScrapeObjectList';
import dummyData from './dummyData'
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';
import ScreenWrapper from '../containers/ScreenWrapper';

// Positive Scenarios
describe('<ScrapeObjectList/> Positive Scenarios',()=>{
    let mockDispatch,store,contextValues,wrapper;
    beforeEach(()=>{
        mockDispatch=jest.fn();
        store={
            plugin:{CT:dummyData.CT},
            login:{userinfo:dummyData.userinfo}
        }
        contextValues={
            setShowObjModal:jest.fn(), 
            fetchScrapeData:jest.fn(), 
            saved:false, 
            setSaved:jest.fn(), 
            newScrapedDat:[], 
            setNewScrapedData:jest.fn(), 
            setShowPop:jest.fn(), 
            setShowConfirmPop:jest.fn(),
            mainScrapedData:{},
            scrapeItems:dummyData.scrapeItems, 
            setScrapeItems:jest.fn()
        }
        const mockStore=createStore(reducer,store)
        jest.spyOn(reactRedux,'useDispatch').mockImplementation(()=>{return mockDispatch});
        jest.spyOn(React,'useContext').mockImplementation(()=>{return contextValues});
        wrapper=mount(<Provider store={mockStore}><ScrapeObjectList/></Provider>);
    })
    afterEach(()=>{
        jest.resetAllMocks();
    })
    it('should render the contents of the component',()=>{
        // Assert that screenwrapper compoenent is used and rendered
        expect(wrapper.find(ScreenWrapper).length).toBe(1)
        // Assert that selectall is rendered
        expect(findByTestAtrr(wrapper,'selectalllabel').length).toBe(1);
        // Assert that save button is rendered
        expect(findByTestAtrr(wrapper,'save').length).toBe(1);
        // Assert that edit button is rendered
        expect(findByTestAtrr(wrapper,'edit').length).toBe(1);
        // Assert that  delete button is rendered
        expect(findByTestAtrr(wrapper,'delete').length).toBe(1);  
        // Assert that search button is rendered
        expect(findByTestAtrr(wrapper,'search').length).toBe(1);
        // Assert that scrape list container is rendered
        expect(findByTestAtrr(wrapper,'scrapeObjectContainer').length).toBe(1);
        // Assert that length of scrape object list is same as number of scrape object list
        expect(findByTestAtrr(wrapper,'scrapeObjectContainer').children().length).toBe(4);
    });
    it('Should provide the search input when clicked on search',()=>{
        expect(findByTestAtrr(wrapper,'searchbox').length).toBe(0)
        findByTestAtrr(wrapper,'search').simulate('click');
        wrapper.update();
        expect(findByTestAtrr(wrapper,'searchbox').length).toBe(1)
    });
    // Skipping the operations on the delete,and edit as it is using useEffect and the states are not being updated from enzyme as expected.
})