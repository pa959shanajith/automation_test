import React from 'react';
import { mount } from 'enzyme';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import { Provider } from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';
import QTest  from '../containers/QTest.js';
import {act} from 'react-dom/test-utils'
import * as api from '../api'
const setUp=()=>{
    const store = {
        integration:{
                    mappedScreenType:'',
                    screenType : 'qTest'
                },
        login:{
            userinfo:{
                "user_id": "602bc1d31503f0cba29ca959"
            }
        }        
    }
    const mockStore=createStore(reducer,store)
    jest.spyOn(api,'loginToQTest_ICE').mockImplementation(()=>{return Promise.resolve(loginResponse)});
    jest.spyOn(api,'qtestProjectDetails_ICE').mockImplementation(()=>{return Promise.resolve(projectList)});
    jest.spyOn(api,'qtestFolderDetails_ICE').mockImplementation(()=>{return Promise.resolve(release_response)});
    const wrapper= mount(<Provider store={mockStore}><QTest/></Provider >);
    return wrapper

    
}
const loginResponse=[{"id":101762,"name":"qConnect - Sample Project"}]
const projectList= {"avoassure_projects":[{"project_id":"602bc4b21503f0cba29ca95b","project_name":"NewProj","scenario_details":[{"_id":"602bd28a1503f0cba29ca960","name":"Scenario_1"},{"_id":"602bd28a1503f0cba29ca963","name":"Scenario_2"},{"_id":"602bd28a1503f0cba29ca964","name":"Scenario_3"},{"_id":"602bd28a1503f0cba29ca965","name":"Scenario_4"}]},{"project_id":"602e4c5c5d4f94feacaf0453","project_name":"test_project34","scenario_details":[{"_id":"602e4ce25d4f94feacaf0455","name":"Scenario_34"},{"_id":"602e4ce25d4f94feacaf0458","name":"Scenario_2"}]}],
                    "qc_projects":[{"id":577115,"name":"Release 1"},
                    {"id":577116,"name":"Release 2"},
                    {"id":577117,"name":"Release 3"},
                    {"id":609326,"name":"1"},
                    {"id":630381,"name":"EGG_20.5"},
                    {"id":630382,"name":"BG_20.5"},
                    {"id":637881,"name":"Release Check 2"},
                    {"id":648424,"name":"DemoRelease"},
                    {"id":648444,"name":"DemoRelease"},
                    {"id":669231,"name":"Tested"},
                    {"id":701448,"name":"test release"},
                    {"id":703440,"name":"qTest_Training_Plan"},
                    {"id":710252,"name":"AM 40"},
                    {"id":720017,"name":"Release created via API"},
                    {"id":720028,"name":"Release API"}]}
const release_response=[{"cycle":"Cycle 1.2","testsuites":[{"id":5967020,"name":"Functional test suite 2","testruns":[{"id":197219318,"name":"Video section"},{"id":197219320,"name":"What's New section"},{"id":197219322,"name":"Our Solutions section"},{"id":197219325,"name":"Header menu"},{"id":197219327,"name":"Subscribe to newsletter"},{"id":197219328,"name":"Footer menu"},{"id":197219331,"name":"Get Free Trial"},{"id":197219332,"name":"Request demo"}]}]}]
const callSucessfulLogin=(url , uName, passwd)=>{
    let wrapper=setUp('center')
    let urlInp= findByTestAtrr(wrapper,'intg_url_inp');
    let usernameInp = findByTestAtrr(wrapper,"intg_username_inp")
    let passwordInp = findByTestAtrr(wrapper,'intg_password_inp')
    //let titlebox =findByTestAtrr(wrapper,"modal_title_head")
    //let submitbtn =findByTestAtrr(wrapper,'intg_qtest_log_submit_btn')
    urlInp.simulate('change',{
        target:{
                value:url
        }
    })
    usernameInp.simulate('change',{
        target:{
            value:uName
        }
    })
    passwordInp.simulate('change',{
        target:{
            value:passwd
        }
    })
    wrapper.update()
    return wrapper
}


// True Positive Scene 
// 1.   Check for the Login Popup is present of not including(3 inputs , title , submit button)
// 2.   Check for the Landing page render with basic 3 fields (encrypt type select filed , Encryption Data input Field,Encrypted Data input Field)
// 3.1  Click operation on the arrow button of the username
// 3.2  Able to render the password components (password input field, password icon and  the login button)
// 4.   Upon changing the username while logging in, the password field should be disappeared

describe('<qTest/> positive scenario test',()=>{
    let wrapper;
    let urlInp ;
    let usernameInp;
    let passwordInp ;
    let titlebox;
    let submitbtn;
    beforeEach(async()=>{
        wrapper=setUp()
        await act(async()=>{
            await new Promise(r=>setTimeout(r))
            wrapper.update()
            urlInp= findByTestAtrr(wrapper,'intg_url_inp');
            usernameInp = findByTestAtrr(wrapper,"intg_username_inp")
            passwordInp = findByTestAtrr(wrapper,'intg_password_inp')
            titlebox =findByTestAtrr(wrapper,"modal_title_head")
            submitbtn =findByTestAtrr(wrapper,'intg_log_submit_btn')
        })
		// jest.spyOn(api,'loginToQTest_ICE').mockImplementationOnce(()=>{return Promise.resolve(loginResponse)})
        //                                 .mockImplementation(()=>{return Promise.resolve("unavailableLocalServer")})
    })
	afterEach(()=>{
        jest.restoreAllMocks()
    })

	it('Should Render the qTest Login Popup when clicked on qTest Icon in leftbar',()=>{
         //Assert that all 3 input fields  are present
            expect(urlInp.length).toBe(1)
            expect(usernameInp.length).toBe(1)
            expect(passwordInp.length).toBe(1)
            expect(titlebox.text()).toBe("qTest Login")
            expect(submitbtn.length).toBe(1)
           
        
    })
    // it('Should Remove the Loginpopup and render the middle screen when credentials are correct',(done)=>{ 
    //     jest.spyOn(api,'loginToQTest_ICE').mockImplementation(()=>{return Promise.resolve(loginResponse)})
    //     //jest.spyOn(React,'useRef').mockReturnValueOnce({current: {value:"https://apitryout.qtestnet.com"}})
    //     const props={
    //             urlRef="https://apitryout.qtestnet.com",
    //             usernameRef="api-test@qasymphony.com",
    //             passwordRef="admin123",
    //             error='',
    //             screenType='qTest',
    //             login=jest.fn(),
    //     }
    //     let wrapper= shallow(<LoginModal {...props}/>)
    //     console.log(wrapper.debug())
    //     //let wrapper1 = callSucessfulLogin("https://apitryout.qtestnet.com","api-test@qasymphony.com","admin123")
    //     let wrapper1=setUp('center')
    //     const submitbtn1= findByTestAtrr(wrapper1,'intg_log_submit_btn')
    //     submitbtn1.simulate('click')
    //     wrapper1.update()
    //     setTimeout(() => {
    //         wrapper1.update()
    //         //Assert that the QTest Middle screen is rendered properly
    //         expect(findByTestAtrr(wrapper1,"intg_main_title_name").text()).toBe("qTest Integration")
    //         // Assert that Popup window goes in case of correct credentials
    //         expect(findByTestAtrr(wrapper1,'intg_url_inp').length).toBe(0)
    //         done();
    //     });

    //     })
    // it('Should render the Proper Error When All of the fileds is kept empty',(done)=>{
    //     submitbtn.simulate('click')
    //     wrapper.update()
    //     setTimeout(()=>{
    //         wrapper.update();
    //         //Assert if the correct Error Message is printed when nothing is printed ->
    //         expect(findByTestAtrr(wrapper,'intg_log_error_span').text()).toBe("Please Enter URL")
    //         done();
    //     })
        
    // })
    // it('Should render the Proper Error When one of the fileds is kept empty',(done)=>{
    //     let wrapper2= callSucessfulLogin("https://apitryout.qtestnet.com",'',"admin123")
    //     const submitbtn2= findByTestAtrr(wrapper2,'intg_log_submit_btn')
    //     submitbtn2.simulate('click')
    //     wrapper.update()
    //     setTimeout(()=>{
    //         wrapper.update();
    //         //Assert if the correct Error Message is printed when nothing is printed ->
    //         expect(findByTestAtrr(wrapper2,'intg_log_error_span').text()).toBe("Please Enter Username")
    //         done();
    //     })
    // })
    // it('Should render the Error Response When Ice is not available',(done)=>{
    //     jest.spyOn(api,'loginToQTest_ICE').mockImplementation(()=>{
    //         return Promise.resolve("unavailableLocalServer")
    //     });
    //     let wrapper3 = callSucessfulLogin('https://apitryout.qtestnet.com',"api-test@qasymphony.com","admin123")
    //     wrapper3.update()
    //     const submitbtn= findByTestAtrr(wrapper3,'intg_log_submit_btn')
    //     submitbtn.simulate('click')
    //     setTimeout(()=>{
    //         wrapper.update();
    //         //Assert that correct message is rendered when ICe is available 
    //         expect(findByTestAtrr(wrapper3,'intg_log_error_span').text()).toBe("ICE Engine is not available, Please run the batch file and connect to the Server.")
    //         done();
    //     })
        
    // })
    // it('Should render the Error Response When Ice is not available',(done)=>{
    //     jest.spyOn(api,'loginToQTest_ICE').mockImplementation(()=>{
    //         return Promise.resolve("invalidcredentials")
    //     });
    //     let wrapper4 = callSucessfulLogin('dfdf',"dfdds","adsasd")
    //     wrapper4.update()
    //     const submitbtn= findByTestAtrr(wrapper4,'intg_log_submit_btn')
    //     submitbtn.simulate('click')
    //     setTimeout(()=>{
    //         wrapper.update();
    //         //Assert that correct message is rendered when ICe is available 
    //         expect(findByTestAtrr(wrapper4,'intg_log_error_span').text()).toBe("Invalid Credentials , Retry Login")
    //         done();
    //     })
    // })
    it('should be able to populate projects dropdown after sucessful login',async()=>{
        const submitbtn= findByTestAtrr(wrapper,'intg_log_submit_btn')
        submitbtn.simulate('click')
        await act(async()=>{
            await new Promise(r=>setTimeout(r))
            wrapper.update()
        })
            let projectdrpdn = findByTestAtrr(wrapper,'intg_qTest_project_dropdwn')
            //Assert that the dropdown is rendered
            expect(projectdrpdn.length).toBe(1)
            //Assert that the dropdown is populating
            expect(projectdrpdn.find("option").length).toBe(2)
        })
    it('should populate the scenarios project dropdown and release dropdown when projects are changed in qTest Dropdown',async()=>{
        const submitbtn= findByTestAtrr(wrapper,'intg_log_submit_btn')
        submitbtn.simulate('click')
        let projectdrpdn = findByTestAtrr(wrapper,'intg_qTest_project_dropdwn')
            projectdrpdn.simulate('change',{
                target:{
                    value:105180
                    }})
        await act(async()=>{
            await new Promise(r=>setTimeout(r))
                wrapper.update()
            })
        
                let rel_drpdwn =findByTestAtrr(wrapper,'intg_qTest_release_drpdwn');
                let project_scenario_drpdwn = findByTestAtrr(wrapper,'intg_qTest_Project_scenarios_drpdwn')
                //Assert that dropwodn is rendered 
                expect(rel_drpdwn.length).toBe(1);
                //Assert that the scenarios dropdown is populating 
                expect(rel_drpdwn.find('option').length).toBe(16)
                //Assert that the release dropdown is populating 
                expect(project_scenario_drpdwn.find('option').length).toBe(3)
    })
    it('should populate the testcases list when the option is changed in release Dropdown',async()=>{
        const submitbtn= findByTestAtrr(wrapper,'intg_log_submit_btn')
        submitbtn.simulate('click')
        let projectdrpdn = findByTestAtrr(wrapper,'intg_qTest_project_dropdwn')
            projectdrpdn.simulate('change',{
                target:{
                    value: 105180
                    }})
        let releasedrpdwn = findByTestAtrr(wrapper,'intg_qTest_release_drpdwn')
            releasedrpdwn.simulate('change',{
                target:{
                    value: 690456
                }
            })
        await act(async()=>{
            await new Promise(r=>setTimeout(r))
            wrapper.update()
        })
        let testList= findByTestAtrr(wrapper,'intg_qTest_test_list')
        //Assert that the testcase list is rendered as per changes release 
        expect(testList.find('img').length).toBe(2)
    })
    it('should populate populate the avo assure scenarios list as per project Dropdown change',async()=>{
        
        const submitbtn= findByTestAtrr(wrapper,'intg_log_submit_btn')
        submitbtn.simulate('click')
        await act(async()=>{
            await new Promise(r=>setTimeout(r))
            wrapper.update()
        })
        let projectdrpdn = findByTestAtrr(wrapper,'intg_qTest_project_dropdwn')
            projectdrpdn.simulate('change',{
                target:{
                    value: 105180
                    }})
                    await act(async()=>{
                        await new Promise(r=>setTimeout(r))
                        wrapper.update()
                    })
        let scenarios_project_drpdwn = findByTestAtrr(wrapper,'intg_qTest_Project_scenarios_drpdwn')
            scenarios_project_drpdwn.simulate('change',{
                target :{
                    value:'NewProj',
                    childNodes : [{getAttribute: jest.fn().mockReturnValueOnce(0)}],
                    selectedIndex: 0
                }
                })
        await act(async()=>{
            await new Promise(r=>setTimeout(r))
            wrapper.update()
        })
                    let testList= findByTestAtrr(wrapper,'intg_scenarios_list_div')
                    //Assert that the list of scenarios is rendered when scenario name is changed
                    expect(testList.find('div').length).toBe(6)
            })
    
})



// True Negative Scene  
// 1. If encryption data field is empty and usewr clicks on encrypt/encode/generate button nothing should be printed in encrypted data field 
// 2. If no password is provided and the Login button is clicked then the error message(Please enter the password) should be displayed
// 3. If invalid credentials then corresponding error message should be diaplayed.
