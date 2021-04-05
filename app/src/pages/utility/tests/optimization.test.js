import React from 'react';
import { shallow,mount, } from 'enzyme';
import {findByTestAtrr,checkProps} from '../../../setupTests';
import UtilityCenter  from '../containers/UtilityCenter.js';
const setUp=()=>{
        const props={   pairwiseClicked:"pairwiseClicked" ,
                        setPairwiseClicked:jest.fn(), 
                        screenType:"optimization",
                        setScreenType:jest.fn(),
                    }
    const wrapper=mount(<UtilityCenter {...props} />);
    return wrapper
}


// True Positive Scene 
// 1.   Check for the props that are being passed to the component
// 2.   Check for the Landing page render with basic 3 fields (Correct Screen Name,Pairwise Logo Icon ,Orthogonal Logo Icon)
// 3.1  Check for the paiwise landing page when pairwise icon is clicked
// 3.2  Check that nothing changes when the orthogonal Array Icon is clicked
// 4.   Upon changing the username while logging in, the password field should be disappeared

describe('<Pairwise/> props Check',()=>{
    it('Should contain required and expected props',()=>{
        const expectedProps = { pairwiseClicked:"pairwiseClicked" ,
                                setPairwiseClicked:jest.fn(), 
                                screenType:"encryption",
                                setScreenType:jest.fn(),
                            };
        const propsError = checkProps(UtilityCenter, expectedProps);

        // Assert that expected props have been passed to the component
        expect(propsError).toBeUndefined();
    })
})
describe('<Pairwise/> Positive Scenario test',()=>{
    const wrapper =setUp()
    it('should render all the 3 basic elements ',()=>{
            // Assert that screenName is rendered correct
            expect(findByTestAtrr(wrapper,'utl_optimization_scr_name').text()).toBe('Optimization')
            //Assert that the Pairwise logo is there and rendered correctly
            expect(findByTestAtrr(wrapper,'utl_optimization_pairwise_logo').prop('src')).toBe("static/imgs/ic-pairwise.png")
            //Assert that the Orthogonal logo is there and rendered correctly
            expect(findByTestAtrr(wrapper,'utl_optimization_orthogonal_logo').prop('src')).toBe("static/imgs/ic-orthogonal-array.png")
    })
    
    it('should render Pairwise Screen when click on Icon',(done)=>{
        const wrapper =setUp()
        let btn = findByTestAtrr(wrapper,'utl_optimization_pairwise_div')
        btn.simulate('click')
         setTimeout(()=>{
            wrapper.update()
            //Assert that the ScreenName is correctly rendered 
            expect(findByTestAtrr(wrapper,'utl_pairwise_scr_name').text()).toBe("Pairwise");
            //Assert that the factor input text area is rendered 
            expect(findByTestAtrr(wrapper,'utl_pairwise_factor_inp').length).toBe(1);
            //Assert that the level input text area is rendered 
            expect(findByTestAtrr(wrapper,'utl_pairwise_level_inp').length).toBe(1);
            //Assert thgat the create button is rendered
            expect(findByTestAtrr(wrapper,'utl_pairwise_create_btn').length).toBe(1);
            //Aseert that the Generate button is rendered
            expect(findByTestAtrr(wrapper,'utl_pairwise_generate_btn').length).toBe(1);
             done()
         })
    })

    it('should not render anything new when orthogonal array icon is clicked',(done)=>{
        const wrapper =setUp()
        const oldWrapper=wrapper;
        let btn = findByTestAtrr(wrapper, 'utl_optimization_orthogonal_div')
        btn.simulate('click')
         setTimeout(() => {
            wrapper.update();
            let newwrapper=wrapper
             // Assert that screenName is still Optimization
             expect(findByTestAtrr(wrapper,'utl_optimization_scr_name').text()).toBe('Optimization')
             //Assert that the Pairwise logo is there and rendered correctly
             expect(findByTestAtrr(wrapper,'utl_optimization_pairwise_logo').prop('src')).toBe("static/imgs/ic-pairwise.png")
             //Assert that the Orthogonal logo is there and rendered correctly
             expect(findByTestAtrr(wrapper,'utl_optimization_orthogonal_logo').prop('src')).toBe("static/imgs/ic-orthogonal-array.png")
            done()
            expect(oldWrapper).toBe(newwrapper)
         });
    })
})  

 // True Negative Scene  
 // 1. If Input Field is my filled with anything and create is cliked ,that particular field should be highlighted
 // 2. If no password is provided and the Login button is clicked then the error message(Please enter the password) should be displayed
 // 3. If invalid credentials then corresponding error message should be diaplayed.

describe('<Utility Center/> negative scenario test ',()=>{
    it('should highlight input boxes(if empty) (that particular field) and create btn is clicked ', (done)=>{
        const wrapper=setUp()
        let btnlOGO = findByTestAtrr(wrapper,'utl_optimization_pairwise_div')
        btnlOGO.simulate('click');
        wrapper.update()
        const btnCreate=findByTestAtrr(wrapper,'utl_pairwise_create_btn');
        btnCreate.simulate('click')
        wrapper.update()
        setTimeout(()=>{
            wrapper.update();
            //Assert if the nothing is changed in anyfileds factor field is highlighted->
            expect(findByTestAtrr(wrapper,'utl_pairwise_factor_inp').prop("id")).toBe("EmptyCall")
            //Assert if level field is still same->
            expect(findByTestAtrr(wrapper,'utl_pairwise_level_inp').prop('id')).toBe('');
            done();
        })})
        it('should highlight level input box if factor field is changed,level field is unchanged create btn is clicked ', (done)=>{
            const wrapper=setUp()
            let btnlOGO = findByTestAtrr(wrapper,'utl_optimization_pairwise_div')
            btnlOGO.simulate('click');
            wrapper.update()
            const btnCreate=findByTestAtrr(wrapper,'utl_pairwise_create_btn');
            const factInp = findByTestAtrr(wrapper,'utl_pairwise_factor_inp');
            factInp.simulate('focus')
            factInp.simulate('change',{
                target:{
                    value:2
                }
                });
            wrapper.update()
            console.log(wrapper.debug())
            btnCreate.simulate('click')
            wrapper.update()
            console.log(wrapper.debug())
            // setTimeout(()=>{
                wrapper.update();
                //Assert if the nothing is changed in anyfileds factor field is highlighted->
                expect(findByTestAtrr(wrapper,'utl_pairwise_level_inp').prop("id")).toBe("EmptyCall")
                //Assert if level field is still same->
                expect(findByTestAtrr(wrapper,'utl_pairwise_factor_inp').prop('id')).toBe('');
                //Assert that value is updated or not
                expect(findByTestAtrr(wrapper,'utl_pairwise_factor_inp').text()).toBe(20);
            //     done();
            // })
    })
    
    // it('user should not be able to change anything in encrypted data field ', ()=>{
    //     let inp=findByTestAtrr(wrapper,"utility_encrypted_data_inp")
    //     inp.simulate('change',{
    //         target:{
    //             value:"hellotryingtochangeyou"
    //         }
    //     })
    //     wrapper.update()
    //     setTimeout(()=>{
    //         wrapper.update();
    //         //Assert if the encrypted data field is empty after the API call->
    //         expect(findByTestAtrr(wrapper,'utility_encrypted_data_inp').text().length).toBe(0)
    //         done();
    //     })
    // })
})
