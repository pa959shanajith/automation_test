import * as React from 'react';
import DataTable from '../components/DataTable';
import * as reactRedux  from 'react-redux';
import { Provider }  from 'react-redux';
import { createStore } from 'redux';
import { mount } from 'enzyme';
import { findByTestAtrr } from '../../../setupTests';
import { BrowserRouter } from 'react-router-dom';
import reducer from '../state/reducer';
import { act } from 'react-dom/test-utils';

jest.mock('react', ()=>{
    const originReact = jest.requireActual('react');
    const mUseRef = jest.fn();
    return {
        ...originReact,
        useRef: mUseRef,
    }
})

describe('Data Table Positive Scenarios', () => {
    
    let wrapper;
    let mockDispatch;
    let state = {
        utility: {
            copiedCells: {
                type: "",
                cells: [],
            }
        }
    }

    const mockStore = createStore(reducer, state);

    beforeEach(async() => {
        mockDispatch = jest.fn();

        jest.spyOn(reactRedux,'useDispatch')
            .mockImplementation( ()=> mockDispatch );

        jest.spyOn(document, 'getElementById')
            .mockImplementation( ()=>Promise.resolve({indeterminate: true}))

        let scrollIntoViewMock = jest.fn();
        window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

        wrapper = mount(
            <Provider store={mockStore}>
                <BrowserRouter>
                    <DataTable
                        currScreen={"Create"} 
                        setBlockui={jest.fn()} 
                        setPopup={jest.fn()}
                        setScreenType={jest.fn()}
                    />
                </BrowserRouter>
            </Provider>
        );

        await act(()=>Promise.resolve())
    });

    afterEach(()=> {
        jest.resetAllMocks()
    })
    
    it('Should Render Title', () => {
        const titleComponent = findByTestAtrr(wrapper, 'dt__pageTitle');
        expect(titleComponent.text()).toBe("Create Data Table");
    });

    it("Should Render Buttons", () => {
        const buttons = findByTestAtrr(wrapper, 'dt__tblActionBtns');

        expect(buttons.length).toBe(10);
    })

    it("Should Have All Headers", () => {
        // const headerLength = dummyData[0].dtheaders.length;
        const headerLength = 2;

        const headerCells = findByTestAtrr(wrapper, "dt__header_cell");
        expect(headerCells.length).toBe(headerLength);
    }) 

    it("Should Have All Cells", () => {
        // const numOfHeaders = dummyData[0].dtheaders.length;
        // const numOfRows = dummyData[0].datatable.length;
        const numOfHeaders = 2;
        const numOfRows = 1;
        const addRow = 1;
        const subHeaderRow = 1;
        const numOfCells = numOfHeaders * numOfRows;

        wrapper.update();

        const headerCells = findByTestAtrr(wrapper, "dt__header_cell");
        const bodyCells = findByTestAtrr(wrapper, "dt__data_cell");
        const rowsComponent = findByTestAtrr(wrapper, "dt__row");
        
        expect(headerCells.length).toBe(numOfHeaders);
        expect(bodyCells.length).toBe(numOfCells);
        expect(rowsComponent.length).toBe(numOfRows+addRow+subHeaderRow);
    }) 

    it('Should Retain Input Value', () => {
        const testValue = "TEST_VALUE";
        let secondRow = findByTestAtrr(wrapper, "dt__row").at(1);
        let secondCell = findByTestAtrr(secondRow, "dt__data_cell").at(1).find('textarea');

        secondCell.simulate('focus');
        secondCell.simulate('change', {
            target: {
                value: testValue
            }
        })

        secondCell.simulate('blur');
        
        expect(secondCell.instance().value).toBe(testValue);
    })

    it('Should append column on Add Column', () => {
        wrapper.update();

        const addColBtnT = findByTestAtrr(wrapper, 'dt__table_add_col');

        expect(addColBtnT.length).toBe(1);
        addColBtnT.simulate('click');

        const numOfHeaders = 3;
        const numOfRows = 1;
        const addRow = 1;
        const subHeaderRow = 1;
        const numOfCells = numOfHeaders * numOfRows;

        wrapper.update();

        const headerCells = findByTestAtrr(wrapper, "dt__header_cell");
        const bodyCells = findByTestAtrr(wrapper, "dt__data_cell");
        const rowsComponent = findByTestAtrr(wrapper, "dt__row");
        
        expect(headerCells.length).toBe(numOfHeaders);
        expect(bodyCells.length).toBe(numOfCells);
        expect(rowsComponent.length).toBe(numOfRows+addRow+subHeaderRow);
    })

    it('Should append row on Add Row', ()=>{
        wrapper.update();

        const addRowBtnT = findByTestAtrr(wrapper, 'dt__table_add_row');

        expect(addRowBtnT.length).toBe(1);
        addRowBtnT.simulate('click');

        const numOfHeaders = 2;
        const numOfRows = 2;
        const addRow = 1;
        const subHeaderRow = 1;
        const numOfCells = numOfHeaders * numOfRows;

        wrapper.update();

        const headerCells = findByTestAtrr(wrapper, "dt__header_cell");
        const bodyCells = findByTestAtrr(wrapper, "dt__data_cell");
        const rowsComponent = findByTestAtrr(wrapper, "dt__row");
        
        expect(headerCells.length).toBe(numOfHeaders);
        expect(bodyCells.length).toBe(numOfCells);
        expect(rowsComponent.length).toBe(numOfRows+addRow+subHeaderRow);
    })

    it('Should add row on Add Action Button (Row Selected) ', ()=>{
        const numCells = findByTestAtrr(wrapper, 'dt__number_cell');
        let rowsComponent = findByTestAtrr(wrapper, "dt__row");
    
        const subHeaderRow = 1;
        const addRow = 1;

        expect(numCells.length).toBe(rowsComponent.length - addRow);

        const numCell = numCells.at(1);
        numCell.simulate('click');

        const addActionButton = findByTestAtrr(wrapper, 'dt__tblActionBtns').at(0);
        addActionButton.simulate('click');

        const numOfHeaders = 2;
        const numOfRows = 2;
        const numOfCells = numOfHeaders * numOfRows;

        wrapper.update();

        const headerCells = findByTestAtrr(wrapper, "dt__header_cell");
        const bodyCells = findByTestAtrr(wrapper, "dt__data_cell");
        rowsComponent = findByTestAtrr(wrapper, "dt__row");

        expect(headerCells.length).toBe(numOfHeaders);
        expect(bodyCells.length).toBe(numOfCells);
        expect(rowsComponent.length).toBe(numOfRows+addRow+subHeaderRow);
    })

    it('Should add col on Add Action Button (Column Selected) ', ()=>{
        let headerCells = findByTestAtrr(wrapper, 'dt__header_cell');
        let rowsComponent = findByTestAtrr(wrapper, "dt__row");
    
        const subHeaderRow = 1;
        const addRow = 1;
        const numOfHeaders = 2;

        expect(headerCells.length).toBe(numOfHeaders);

        const headerCell = headerCells.at(1);
        headerCell.simulate('click');

        const addActionButton = findByTestAtrr(wrapper, 'dt__tblActionBtns').at(0);
        addActionButton.simulate('click');

        const newNumOfHeaders = 3;
        const numOfRows = 1;
        const numOfCells = newNumOfHeaders * numOfRows;

        wrapper.update();

        headerCells = findByTestAtrr(wrapper, "dt__header_cell");
        const bodyCells = findByTestAtrr(wrapper, "dt__data_cell");
        rowsComponent = findByTestAtrr(wrapper, "dt__row");

        expect(headerCells.length).toBe(newNumOfHeaders);
        expect(bodyCells.length).toBe(numOfCells);
        expect(rowsComponent.length).toBe(numOfRows+addRow+subHeaderRow);
    })
});


describe('Data Table Negative Scenarios', () => {
    
    let wrapper;
    let mockDispatch;
    let state = {
        utility: {
            copiedCells: {
                type: "",
                cells: [],
            }
        }
    }

    let props = {
        currScreen: "Create",
        setBlockui: jest.fn(), 
        setPopup: jest.fn(),
        setScreenType: jest.fn(),
        setShowPop: jest.fn()
    }

    const mockStore = createStore(reducer, state);

    beforeEach(async() => {
        mockDispatch = jest.fn();

        jest.spyOn(reactRedux,'useDispatch')
            .mockImplementation( ()=> mockDispatch );

        jest.spyOn(document, 'getElementById')
            .mockImplementation( ()=>Promise.resolve({indeterminate: true}))

        let scrollIntoViewMock = jest.fn();
        window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

        wrapper = mount(
            <Provider store={mockStore}>
                <BrowserRouter>
                    <DataTable
                        { ...props }
                    />
                </BrowserRouter>
            </Provider>
        );

        await act(()=>Promise.resolve())
    });

    afterEach(()=> {
        jest.resetAllMocks()
    })
    
    it('Should Notify User on Add Action Button if None Selected ', ()=>{
        const numCells = findByTestAtrr(wrapper, 'dt__number_cell');
        let rowsComponent = findByTestAtrr(wrapper, "dt__row");
    
        const subHeaderRow = 1;
        const addRow = 1;

        expect(numCells.length).toBe(rowsComponent.length - addRow);

        const addActionButton = findByTestAtrr(wrapper, 'dt__tblActionBtns').at(0);
        addActionButton.simulate('click');

        const numOfHeaders = 2;
        const numOfRows = 1;
        const numOfCells = numOfHeaders * numOfRows;

        wrapper.update();

        const headerCells = findByTestAtrr(wrapper, "dt__header_cell");
        const bodyCells = findByTestAtrr(wrapper, "dt__data_cell");
        rowsComponent = findByTestAtrr(wrapper, "dt__row");

        expect(headerCells.length).toBe(numOfHeaders);
        expect(bodyCells.length).toBe(numOfCells);
        expect(rowsComponent.length).toBe(numOfRows+addRow+subHeaderRow);
    })

    it('Should Notify User on Add Action Button if None Selected ', ()=>{
        let headerCells = findByTestAtrr(wrapper, 'dt__header_cell');
        let rowsComponent = findByTestAtrr(wrapper, "dt__row");
    
        const subHeaderRow = 1;
        const addRow = 1;
        const numOfHeaders = 2;

        expect(headerCells.length).toBe(numOfHeaders);

        const addActionButton = findByTestAtrr(wrapper, 'dt__tblActionBtns').at(0);
        addActionButton.simulate('click');

        const newNumOfHeaders = numOfHeaders;
        const numOfRows = 1;
        const numOfCells = newNumOfHeaders * numOfRows;

        wrapper.update();

        headerCells = findByTestAtrr(wrapper, "dt__header_cell");
        const bodyCells = findByTestAtrr(wrapper, "dt__data_cell");
        rowsComponent = findByTestAtrr(wrapper, "dt__row");

        expect(headerCells.length).toBe(newNumOfHeaders);
        expect(bodyCells.length).toBe(numOfCells);
        expect(rowsComponent.length).toBe(numOfRows+addRow+subHeaderRow);
    })
});