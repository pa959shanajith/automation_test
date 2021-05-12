import * as React from 'react';
import { mount } from 'enzyme';
import { findByTestAtrr } from '../../../setupTests';
import DataTable from '../components/DataTable';
import {tableData} from '../components/dummydata';

const setUp=()=>{
    // const props = { pairwiseClicked: false ,
    //                 setPairwiseClicked: jest.fn(), 
    //                 screenType: "datatable",
    //                 setScreenType: jest.fn(),
    //             }
    const wrapper = mount(<DataTable  />);
    return wrapper;
}

describe('Data Table', () => {
    let wrapper;
    beforeEach(() => {
        wrapper = setUp();
    });
    
    it('Should Render Title', () => {
        const titleComponent = findByTestAtrr(wrapper, 'dt__pageTitle');
        expect(titleComponent.text()).toBe("Create Data Table");
    });

    it("Should Render Buttons", () => {
        const buttons = findByTestAtrr(wrapper, 'dt__tblActionBtns');

        expect(buttons.length).toBe(5);
    })

    it("Should Have All Headers", () => {
        const headerLength = Object.keys(tableData[0]).length;

        const headerCells = findByTestAtrr(wrapper, "dt__header_cell");
        expect(headerCells.length).toBe(headerLength);
    }) 

    it("Should Have All Cells", () => {
        const numOfHeaders = Object.keys(tableData[0]).length;
        const numOfRows = tableData.length;
        const numOfCells = numOfHeaders * numOfRows;

        wrapper.update();

        const headerCells = findByTestAtrr(wrapper, "dt__header_cell");
        const bodyCells = findByTestAtrr(wrapper, "dt__body_cell");
        const rowsComponent = findByTestAtrr(wrapper, "dt__row");
        
        expect(headerCells.length).toBe(numOfHeaders);
        expect(bodyCells.length).toBe(numOfCells);
        expect(rowsComponent.length).toBe(numOfRows);
    }) 

    it('Should Retain Input Value', () => {
        const testValue = "TEST_VALUE";
        let secondRow = findByTestAtrr(wrapper, "dt__row").at(1);
        let secondCell = findByTestAtrr(secondRow, "dt__body_cell").at(1).find('input');

        secondCell.simulate('focus');
        secondCell.simulate('change', {
            target: {
                value: testValue
            }
        })

        secondCell.simulate('blur');
        
        expect(secondCell.instance().value).toBe(testValue);
    })
});