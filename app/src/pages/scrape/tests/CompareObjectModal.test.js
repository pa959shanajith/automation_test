import React from 'react';
import {mount}from 'enzyme';
import {findByTestAtrr, checkProps} from '../../../setupTests';
import CompareObjectModal from '../components/CompareObjectModal';


const webMacLen=6;
const webWinLen=5;
const props={
    startScrape:jest.fn(),
    setShow:jest.fn()
}
// POsitive
describe('<CompareObjectModal/> Positive Scenarios',()=>{
    it('Should contain the expected and required props',()=>{
        const expectedProps={
            startScrape:jest.fn(),
            setShow:jest.fn()
        }
        const propsError=checkProps(CompareObjectModal,expectedProps)
        expect(propsError).toBeUndefined()
    });
});
describe("<CompareObjectModal/> Positve Scenarios",()=>{
    let winSpy;
    beforeEach(()=>{
        winSpy= jest.spyOn(window.navigator,'appVersion','get')
        winSpy.mockReturnValueOnce("Windows").mockReturnValue("Mac")
    })
    afterEach(()=>{
        jest.resetAllMocks()
    })
    it('should render the corresponding number of browser buttons',()=>{
        let wrapper=mount(<CompareObjectModal {...props} />);
        // Assert that if not MAC then 5 browsers button displayed
        expect(findByTestAtrr(wrapper,'compareObjectButtons').children().length).toBe(webWinLen);
        expect(findByTestAtrr(wrapper,'compareObjectButtons').find('button').length).toBe(5);
        expect(findByTestAtrr(wrapper,'compareObjectButtons').find('img').length).toBe(5);
        wrapper=mount(<CompareObjectModal {...props} />);
        // Assert that if its MAC then should be 6 browser button in ModalContainer
        expect(findByTestAtrr(wrapper,'compareObjectButtons').children().length).toBe(webMacLen);
        expect(findByTestAtrr(wrapper,'compareObjectButtons').find('button').length).toBe(6);
        expect(findByTestAtrr(wrapper,'compareObjectButtons').find('img').length).toBe(6);
    });
    it('Should call startScrape with expected arguments (browser_name,"comapare"',()=>{
        let wrapper=mount(<CompareObjectModal {...props} />);
        let objectButtons=findByTestAtrr(wrapper,'compareObjectButtons').find('button')  
        // IE
        objectButtons.at(0).simulate('click')
        expect(props.startScrape).toHaveBeenNthCalledWith(1,'ie', 'compare')
        // Chrome
        objectButtons.at(1).simulate('click')
        expect(props.startScrape).toHaveBeenNthCalledWith(2,'chrome', 'compare')
        // FireFox
        objectButtons.at(2).simulate('click')
        expect(props.startScrape).toHaveBeenNthCalledWith(3,'mozilla', 'compare')
        // Edge
        objectButtons.at(3).simulate('click')
        expect(props.startScrape).toHaveBeenNthCalledWith(4,'edge', 'compare')
        // Chromium
        objectButtons.at(4).simulate('click')
        expect(props.startScrape).toHaveBeenNthCalledWith(5,'chromium', 'compare')

        // MAC
        wrapper=mount(<CompareObjectModal {...props} />);
        objectButtons=findByTestAtrr(wrapper,'compareObjectButtons').find('button')
        objectButtons.at(2).simulate('click')
        expect(props.startScrape).toHaveBeenNthCalledWith(6,'safari', 'compare')
    })
    it('Should close the modal',()=>{
        let wrapper=mount(<CompareObjectModal {...props} />);
        findByTestAtrr(wrapper,'cancelButton').simulate('click');
        expect(props.setShow).toHaveBeenCalledWith(false)

    })
})


