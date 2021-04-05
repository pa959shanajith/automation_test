import React from 'react';
import { mount } from 'enzyme';
import {findByTestAtrr} from '../../../setupTests';
import { Provider } from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';
import Zephyr  from '../containers/Zephyr.js';
import * as api from '../api'
import {act} from 'react-dom/test-utils'
const setUp=()=>{
    const store = {
        integration:{
                    mappedScreenType:'',
                    screenType : 'Zephyr',
                    selectedScenarioIds :[]
                },
        login:{
            userinfo:{
                "user_id": "602bc1d31503f0cba29ca959"
            }
        }        
         
  }
    const mockStore=createStore(reducer,store)
    jest.spyOn(api,'loginToZephyr_ICE').mockImplementation(()=>{return Promise.resolve(loginResponse)});
    jest.spyOn(api,'zephyrProjectDetails_ICE').mockImplementation(()=>{return Promise.resolve(FolderList)});
    jest.spyOn(api,'zephyrCyclePhase_ICE').mockImplementation(()=>{return Promise.resolve(release_response)});
    const wrapper= mount(<Provider store={mockStore}><Zephyr/></Provider >);
    return wrapper
    
}

const loginResponse=[{"id":1,"name":"Sample Project"}]
const FolderList =[{"id":1,"name":"Release 1.0"}]
const release_response = {"avoassure_projects":[{"project_id":"602bc4b21503f0cba29ca95b","project_name":"NewProj","scenario_details":[{"_id":"602bd28a1503f0cba29ca960","name":"Scenario_1"},{"_id":"602bd28a1503f0cba29ca963","name":"Scenario_2"},{"_id":"602bd28a1503f0cba29ca964","name":"Scenario_3"},{"_id":"602bd28a1503f0cba29ca965","name":"Scenario_4"}]},{"project_id":"602e4c5c5d4f94feacaf0453","project_name":"test_project34","scenario_details":[{"_id":"602e4ce25d4f94feacaf0455","name":"Scenario_34"},{"_id":"602e4ce25d4f94feacaf0458","name":"Scenario_2"}]}],"project_dets":{"Avo Assure Cycle":[{"2":"Avo Assure Tests"},{"3":"New phase"}]}}
// True Positive Scene 
// 1.   Check for the Login Popup is present of not including(3 inputs , title , submit button)
// 2.   Check for the Landing page render with basic 3 fields (encrypt type select filed , Encryption Data input Field,Encrypted Data input Field)
// 3.1  Click operation on the arrow button of the username
// 3.2  Able to render the password components (password input field, password icon and  the login button)
// 4.   Upon changing the username while logging in, the password field should be disappeared

describe('<Zephyr/> positive scenario test',()=>{
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

	it('Should Render the ALM Login Popup when clicked on Zephyr Icon in leftbar',()=>{
            //Assert that all 3 input fields  are present
            expect(urlInp.length).toBe(1)
            expect(usernameInp.length).toBe(1)
            expect(passwordInp.length).toBe(1)
            expect(titlebox.text()).toBe("Zephyr Login")
            expect(submitbtn.length).toBe(1)
          
    })
    // it('Should Remove the Loginpopup and render the middle screen when credentials are correct',(done)=>{ 
    //     jest.spyOn(api,'loginQCServer_ICE').mockImplementation(()=>{return Promise.resolve(loginResponse)})
    //     let wrapper1 = callSucessfulLogin("http://srv03wap121:8080/qcbin","nupoor","nupoor")
    //     const submitbtn1= findByTestAtrr(wrapper1,'intg_alm_log_submit_btn')
    //     submitbtn1.simulate('click')
    //     wrapper1.update()
    //     setTimeout(() => {
    //         wrapper1.update()
    //         console.log(wrapper.debug())
    //         //Assert that the QTest Middle screen is rendered properly
    //         expect(findByTestAtrr(wrapper1,"intg_main_title_name").text()).toBe("ALM Integration")
    //         // Assert that Popup window goes in case of correct credentials
    //         expect(findByTestAtrr(wrapper1,'intg_alm_url_inp').length).toBe(0)
    //         done();
    //     });
//    })
    // it('Should render the Proper Error When All of the fileds is kept empty',(done)=>{
    //     submitbtn.simulate('click')
    //     wrapper.update()
    //     setTimeout(()=>{
    //         wrapper.update();
    //         //Assert if the correct Error Message is printed when nothing is printed ->
    //         expect(findByTestAtrr(wrapper,'intg_qtest_log_error_span').text()).toBe("Please Enter URL")
    //         done();
    //     })
        
    // })
    // it('Should render the Proper Error When one of the fileds is kept empty',(done)=>{
    //     let wrapper2= callSucessfulLogin("https://apitryout.qtestnet.com",'',"admin123")
    //     const submitbtn2= findByTestAtrr(wrapper2,'intg_qtest_log_submit_btn')
    //     submitbtn2.simulate('click')
    //     wrapper.update()
    //     setTimeout(()=>{
    //         wrapper.update();
    //         //Assert if the correct Error Message is printed when nothing is printed ->
    //         expect(findByTestAtrr(wrapper2,'intg_qtest_log_error_span').text()).toBe("Please Enter Username")
    //         done();
    //     })
    // })
    // it('Should render the Error Response When Ice is not available',(done)=>{
    //     jest.spyOn(api,'loginToQTest_ICE').mockImplementation(()=>{
    //         return Promise.resolve("unavailableLocalServer")
    //     });
    //     let wrapper3 = callSucessfulLogin('https://apitryout.qtestnet.com',"api-test@qasymphony.com","admin123")
    //     wrapper3.update()
    //     const submitbtn= findByTestAtrr(wrapper3,'intg_qtest_log_submit_btn')
    //     submitbtn.simulate('click')
    //     setTimeout(()=>{
    //         wrapper.update();
    //         //Assert that correct message is rendered when ICe is available 
    //         expect(findByTestAtrr(wrapper3,'intg_qtest_log_error_span').text()).toBe("ICE Engine is not available, Please run the batch file and connect to the Server.")
    //         done();
    //     })
        
    // })
    // it('Should render the Error Response When Ice is not available',(done)=>{
    //     jest.spyOn(api,'loginToQTest_ICE').mockImplementation(()=>{
    //         return Promise.resolve("invalidcredentials")
    //     });
    //     let wrapper4 = callSucessfulLogin('dfdf',"dfdds","adsasd")
    //     wrapper4.update()
    //     const submitbtn= findByTestAtrr(wrapper4,'intg_qtest_log_submit_btn')
    //     submitbtn.simulate('click')
    //     setTimeout(()=>{
    //         wrapper.update();
    //         //Assert that correct message is rendered when ICe is available 
    //         expect(findByTestAtrr(wrapper4,'intg_qtest_log_error_span').text()).toBe("Invalid Credentials , Retry Login")
    //         done();
    //     })
    // })
    // it('should be able to populate projects dropdown after sucessful login',(done)=>{
    //     jest.spyOn(api,'loginToQTest_ICE').mockImplementation(()=>{
    //         return Promise.resolve(loginResponse)
    //     });
    //     let wrapper5 = callSucessfulLogin('https://apitryout.qtestnet.com',"api-test@qasymphony.com","admin123")
    //     wrapper5.update()
    //     const submitbtn= findByTestAtrr(wrapper5,'intg_qtest_log_submit_btn')
    //     submitbtn.simulate('click')
    //     wrapper5.update()
    //     setTimeout(()=>{
    //         wrapper5.update()
    //         let projectdrpdn = findByTestAtrr(wrapper5,'intg_qTest_project_dropdwn')
    //         expect(projectdrpdn.length).toBe(1)
    //         expect(projectdrpdn.find("option").length).toBe(3)
    //          done()
    //     })
    // })
    // it('should populate the scenarios project dropdown when projects are changed in qTest Dropdown',(done)=>{
    //     jest.spyOn(api,'loginToQTest_ICE').mockImplementation(()=>{return Promise.resolve(loginResponse)});
    //     jest.spyOn(api,'qtestProjectDetails_ICE').mockImplementation(()=>{return Promise.resolve(projectList)})
    //     let wrapper6 = callSucessfulLogin('https://apitryout.qtestnet.com',"api-test@qasymphony.com","admin123")
    //     wrapper6.update()
    //     const submitbtn= findByTestAtrr(wrapper6,'intg_qtest_log_submit_btn')
    //     submitbtn.simulate('click')
    //     wrapper6.update()
    //     setTimeout(()=>{
    //         wrapper6.update()
    //         console.log(wrapper6.debug())
    //         let projectdrpdn = findByTestAtrr(wrapper6,'intg_qTest_project_dropdwn')
    //         projectdrpdn.simulate('change',{
    //             target:{
    //                 value:loginResponse[0].name
    //                 }})
    //             wrapper6.update()
    //             setTimeout(() => {
    //                 wrapper6.update
    //                 let rel_drpdwn =findByTestAtrr(wrapper6,'intg_qTest_Project_scenarios_drpdwn');
    //                 expect(rel_drpdwn.length).toBe(1);
    //                 expect(rel_drpdwn.find('option').length).toBe(3)
    //             });
    //         })
    // })
    it('should be able to populate projects dropdown after sucessful login',async()=>{
        const submitbtn= findByTestAtrr(wrapper,'intg_log_submit_btn')
        submitbtn.simulate('click')
        await act(async()=>{
            await new Promise(r=>setTimeout(r))
            wrapper.update()
        })
        let projectdrpdn = findByTestAtrr(wrapper,'intg_Zephyr_project_drpdwn')
        //Assert that the dropdown is rendered
        expect(projectdrpdn.length).toBe(1)
        //Assert that the dropdown is populating
        expect(projectdrpdn.find("option").length).toBe(2)
        
    })
    it('should populate the scenarios project dropdown when projects are changed in Zephyr Dropdown',async()=>{
        const submitbtn= findByTestAtrr(wrapper,'intg_log_submit_btn')
        submitbtn.simulate('click')
        await act(async()=>{
            await new Promise(r=>setTimeout(r))
            wrapper.update()
        })
        let projectdrpdn = findByTestAtrr(wrapper,'intg_Zephyr_project_drpdwn')
            projectdrpdn.simulate('change',{
                target:{
                    value:1
                    }})
        await act(async()=>{
            await new Promise(r=>setTimeout(r))
            wrapper.update()
        })
        let rel_drpdwn =findByTestAtrr(wrapper,'intg_zephyr_release_drpdwn');
        //Assert that dropwodn is rendered 
        expect(rel_drpdwn.length).toBe(1);
        //Assert that the release dropdown is populating 
        expect(rel_drpdwn.find('option').length).toBe(2)              
    })
    it('should populate test list and Avo scnarios dropdown if any option changed in release Dropdown',async()=>{
        const submitbtn= findByTestAtrr(wrapper,'intg_log_submit_btn')
        submitbtn.simulate('click')
        await act(async()=>{
            await new Promise(r=>setTimeout(r))
            wrapper.update()
        })
        let projectdrpdn = findByTestAtrr(wrapper,'intg_Zephyr_project_drpdwn')
            projectdrpdn.simulate('change',{
                target:{
                    value: 1
                    }
            })
        await act(async()=>{
            await new Promise(r=>setTimeout(r))
            wrapper.update()
        })        
        let releasedrpdwn = findByTestAtrr(wrapper,'intg_zephyr_release_drpdwn')
            releasedrpdwn.simulate('change',{
                target:{
                    value: 1
                }
            })
        await act(async()=>{
            await new Promise(r=>setTimeout(r))
            wrapper.update()
        })        
        let testList= findByTestAtrr(wrapper,'intg_zephyr_test_list')
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
        let projectdrpdn = findByTestAtrr(wrapper,'intg_Zephyr_project_drpdwn')
        projectdrpdn.simulate('change',{
            target:{
                value: 1
                }})
        await act(async()=>{
            await new Promise(r=>setTimeout(r))
            wrapper.update()
        })
        let releasedrpdwn = findByTestAtrr(wrapper,'intg_zephyr_release_drpdwn')
            releasedrpdwn.simulate('change',{
                target:{
                    value: 1
                }
            })
        await act(async()=>{
            await new Promise(r=>setTimeout(r))
            wrapper.update()
        })   
        let scenarios_project_drpdwn = findByTestAtrr(wrapper,'intg_zephyr_scenario_dwpdwn')
            scenarios_project_drpdwn.simulate('change',{
                target :{
                    value: 0,
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
