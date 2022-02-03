import React from 'react';
import {mount}from 'enzyme';
import {findByTestAtrr, checkProps} from '../../../setupTests';
import ReplaceObjectSelBrModal from '../components/ReplaceObjectSelBrModal';


const webMacLen=6;
const webWinLen=5;
const props={
    startScrape:jest.fn(),
    setShow:jest.fn()
}
// POsitive
describe('<ReplaceObjectSelBrModal/> Positive Scenarios',()=>{
    it('Should contain the expected and required props',()=>{
        const expectedProps={
            startScrape:jest.fn(),
            setShow:jest.fn()
        }
        const propsError=checkProps(ReplaceObjectSelBrModal,expectedProps)
        expect(propsError).toBeUndefined()
    });
});
describe("<ReplaceObjectSelBrModal/> Positve Scenarios",()=>{
    let winSpy;
    beforeEach(()=>{
        winSpy= jest.spyOn(window.navigator,'appVersion','get')
        winSpy.mockReturnValueOnce("Windows").mockReturnValue("Mac")
    })
    afterEach(()=>{
        jest.resetAllMocks()
    })
    it('should render the corresponding number of browser buttons',()=>{
        let wrapper=mount(<ReplaceObjectSelBrModal {...props} />);
        // Assert that if not MAC then 5 browsers button displayed
        expect(findByTestAtrr(wrapper,'sbReplaceObjectButtons').children().length).toBe(webWinLen);
        expect(findByTestAtrr(wrapper,'sbReplaceObjectButtons').find('button').length).toBe(5);
        expect(findByTestAtrr(wrapper,'sbReplaceObjectButtons').find('img').length).toBe(5);
        wrapper=mount(<ReplaceObjectSelBrModal {...props} />);
        // Assert that if its MAC then should be 6 browser button in ModalContainer
        expect(findByTestAtrr(wrapper,'sbReplaceObjectButtons').children().length).toBe(webMacLen);
        expect(findByTestAtrr(wrapper,'sbReplaceObjectButtons').find('button').length).toBe(6);
        expect(findByTestAtrr(wrapper,'sbReplaceObjectButtons').find('img').length).toBe(6);
    });
    it('Should call startScrape with expected arguments (browser_name,"","replace"',()=>{
        let wrapper=mount(<ReplaceObjectSelBrModal {...props} />);
        let objectButtons=findByTestAtrr(wrapper,'sbReplaceObjectButtons').find('button')  
        // IE
        objectButtons.at(0).simulate('click')
        expect(props.startScrape).toHaveBeenNthCalledWith(1,'ie', '', 'replace')
        // Chrome
        objectButtons.at(1).simulate('click')
        expect(props.startScrape).toHaveBeenNthCalledWith(2,'chrome', '', 'replace')
        // FireFox
        objectButtons.at(2).simulate('click')
        expect(props.startScrape).toHaveBeenNthCalledWith(3,'mozilla', '', 'replace')
        // Edge
        objectButtons.at(3).simulate('click')
        expect(props.startScrape).toHaveBeenNthCalledWith(4,'edge', '', 'replace')
        // Chromium
        objectButtons.at(4).simulate('click')
        expect(props.startScrape).toHaveBeenNthCalledWith(5,'chromium', '', 'replace')

        // MAC
        wrapper=mount(<ReplaceObjectSelBrModal {...props} />);
        objectButtons=findByTestAtrr(wrapper,'sbReplaceObjectButtons').find('button')
        objectButtons.at(2).simulate('click')
        expect(props.startScrape).toHaveBeenNthCalledWith(6,'safari', '', 'replace')
    })
    it('Should close the modal',()=>{
        let wrapper=mount(<ReplaceObjectSelBrModal {...props} />);
        findByTestAtrr(wrapper,'cancelButton').simulate('click');
        expect(props.setShow).toHaveBeenCalledWith(false)

    })
})


