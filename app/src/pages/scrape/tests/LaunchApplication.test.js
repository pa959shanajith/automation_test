import * as React from 'react';
import {findByTestAtrr, checkProps} from '../../../setupTests';
import { shallow,mount}from 'enzyme';
import LaunchApplication from '../components/LaunchApplication';


describe('<LaunchApplication/> Positive Scenarios (DESKTOP)',()=>{
    // Props for desktop application
    const props={
        appPop:{
            startScrape:jest.fn(),
            appType:"Desktop"
        },
        setShow:jest.fn()
    };
    let wrapper;
    beforeEach(()=>{
        wrapper=mount(<LaunchApplication {...props}/>)
    })
    it('Should render the component',()=>{
        // Desktop
        expect(findByTestAtrr(wrapper,'windowName').length).toBe(1)
        expect(findByTestAtrr(wrapper,'processID').length).toBe(1)
        expect(findByTestAtrr(wrapper,'methodA').length).toBe(1)
        expect(findByTestAtrr(wrapper,'methodB').length).toBe(1)
        expect(findByTestAtrr(wrapper,'desktopLaunch').length).toBe(1)
        // console.log(wrapper.debug())
    });
    it('Should Launch the desktop application',async ()=>{
        findByTestAtrr(wrapper,'windowName').simulate('change',{target:{value:'sampleWindow'}});
        findByTestAtrr(wrapper,'processID').simulate('change',{target:{value:'007'}});
        wrapper.update();
        findByTestAtrr(wrapper,'desktopLaunch').simulate('click')
        await Promise.resolve();
        wrapper.update();
        // Assert that startScrape has been called  with appropriate window name and process ID
        expect(props.appPop.startScrape).toHaveBeenCalledWith({
            appPath: 'sampleWindow',
            processID: '007',
            method: 'A'
        })
    })
});
describe('<LaunchApplication/> Positive Scenarios (SAP)',()=>{
    // Props for SAP application
    const props={
        appPop:{
            startScrape:jest.fn(),
            appType:"SAP"
        },
        setShow:jest.fn()
    };
    let wrapper;
    beforeEach(()=>{
        wrapper=mount(<LaunchApplication {...props}/>)
    })
    it('Should render the component',()=>{
        // SAP
        expect(findByTestAtrr(wrapper,'exePath').length).toBe(1)
        expect(findByTestAtrr(wrapper,'sapLaunch').length).toBe(1)
    });
    it('Should Launch the SAP application',async ()=>{
        findByTestAtrr(wrapper,'exePath').simulate('change',{target:{value:"C:\\Users"}});
        wrapper.update();
        findByTestAtrr(wrapper,'sapLaunch').simulate('click');
        await Promise.resolve();
        wrapper.update();
        // Assert that the SAP scrape has been started
        expect(props.appPop.startScrape).toHaveBeenCalledWith({'appName' : "C:\\Users"});
    })
});
describe('<LaunchApplication/> Positive Scenarios (MobileApp)',()=>{
    // Props for SAP application
    const props={
        appPop:{
            startScrape:jest.fn(),
            appType:"MobileApp"
        },
        setShow:jest.fn()
    };
    let wrapper;
    beforeEach(()=>{
        wrapper=mount(<LaunchApplication {...props}/>)
    })
    it('Should render the component depending on the OS',()=>{
        // SAP
        findByTestAtrr(wrapper,'chooseAndriod').simulate('click');
        // Assert that the andriod fields are being rendered and ios fields are not when Andriod OS is clicked
        expect(findByTestAtrr(wrapper,'andriodAppPath').length).toBe(1);
        expect(findByTestAtrr(wrapper,'andriodSerialNumber').length).toBe(1);
        expect(findByTestAtrr(wrapper,'iosApppath').length).toBe(0);

        findByTestAtrr(wrapper,'chooseIOS').simulate('click');
        expect(findByTestAtrr(wrapper,'iosApppath').length).toBe(1);
        expect(findByTestAtrr(wrapper,'iosVersionNumber').length).toBe(1);
        expect(findByTestAtrr(wrapper,'iosDeviceName').length).toBe(1);
        expect(findByTestAtrr(wrapper,'iosUDID').length).toBe(1);
        expect(findByTestAtrr(wrapper,'andriodAppPath').length).toBe(0);

        expect(findByTestAtrr(wrapper,'mobileAppLaunch').length).toBe(1);
    });
    it('Should Launch the Andriod Mobile app ',async ()=>{
        findByTestAtrr(wrapper,'chooseAndriod').simulate('click');
        findByTestAtrr(wrapper,'andriodAppPath').simulate('change',{target:{value:"/storage/emulated/0/Andriod"}});
        findByTestAtrr(wrapper,'andriodSerialNumber').simulate('change',{target:{value:"dummySerialNumber"}});
        wrapper.update();
        findByTestAtrr(wrapper,'mobileAppLaunch').simulate('click');
        await Promise.resolve();
        wrapper.update();
        
        // Assert that the SAP scrape has been started
        // console.log(props.appPop.startScrape.mock.calls)
        expect(props.appPop.startScrape).toHaveBeenCalledWith({
            'appPath': "/storage/emulated/0/Andriod",
            'sNum': "dummySerialNumber",
            'appPath2': "",
            'verNum':"",
            'deviceName': "",
            'uuid': ""
        });
    });
    it('Should Launch the IOS mobile app',async ()=>{
        findByTestAtrr(wrapper,'chooseIOS').simulate('click');
        findByTestAtrr(wrapper,'iosApppath').simulate('change',{target:{value:'iosPath'}})
        findByTestAtrr(wrapper,'iosVersionNumber').simulate('change',{target:{value:'iosVersionNumber'}})
        findByTestAtrr(wrapper,'iosDeviceName').simulate('change',{target:{value:'iosDevName'}})
        findByTestAtrr(wrapper,'iosUDID').simulate('change',{target:{value:'iosUDID'}});
        wrapper.update();
        findByTestAtrr(wrapper,'mobileAppLaunch').simulate('click');
        await Promise.resolve();
        wrapper.update();
        expect(props.appPop.startScrape).toHaveBeenCalledWith({
            'appPath': "",
            'sNum': "",
            'appPath2': "iosPath",
            'verNum':"iosVersionNumber",
            'deviceName': "iosDevName",
            'uuid': "iosUDID"
        });
    })
});
describe('<LaunchApplication/> Positive Scenarios (OEBS)',()=>{
    // Props for SAP application
    const props={
        appPop:{
            startScrape:jest.fn(),
            appType:"OEBS"
        },
        setShow:jest.fn()
    };
    let wrapper;
    beforeEach(()=>{
        wrapper=mount(<LaunchApplication {...props}/>)
    })
    it('Should render the component',()=>{
        // SAP
        expect(findByTestAtrr(wrapper,'oebsWinName').length).toBe(1);
        expect(findByTestAtrr(wrapper,'oebsLaunch').length).toBe(1);
    });
    it('Should Launch the OEBS application',async ()=>{
        findByTestAtrr(wrapper,'oebsWinName').simulate('change',{target:{value:"OEBSWindowName"}});
        wrapper.update();
        findByTestAtrr(wrapper,'oebsLaunch').simulate('click');
        await Promise.resolve();
        wrapper.update();
        // Assert that the SAP scrape has been started
        expect(props.appPop.startScrape).toHaveBeenCalledWith({'winName' : "OEBSWindowName"});
    })
});

describe('<LaunchApplication/> Positive Scenarios (MobileWeb)',()=>{
    // Props for SAP application
    const props={
        appPop:{
            startScrape:jest.fn(),
            appType:"MobileWeb"
        },
        setShow:jest.fn()
    };
    let wrapper;
    beforeEach(()=>{
        wrapper=mount(<LaunchApplication {...props}/>)
    })
    it('Should render the component',()=>{
        // SAP
        expect(findByTestAtrr(wrapper,'MWserdev').length).toBe(1);
        expect(findByTestAtrr(wrapper,'MWversion').length).toBe(1);
        expect(findByTestAtrr(wrapper,'MWLaunch').length).toBe(1);
    });
    it('Should Launch the MobileWeb application',async ()=>{
        findByTestAtrr(wrapper,'MWserdev').simulate('change',{target:{value:"MWSerialNumber"}});
        findByTestAtrr(wrapper,'MWversion').simulate('change',{target:{value:"10.0"}});
        wrapper.update();
        findByTestAtrr(wrapper,'MWLaunch').simulate('click');
        await Promise.resolve();
        wrapper.update();
        // Assert that the SAP scrape has been started
        expect(props.appPop.startScrape).toHaveBeenCalledWith({
            'slNum': 'MWSerialNumber',
            'vernNum': "10.0"
        });
    })
});