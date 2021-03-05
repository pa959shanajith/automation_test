import * as React from 'react';
import {findByTestAtrr, checkProps} from '../../../setupTests';
import { mount}from 'enzyme';
import CertificateModal from '../components/CertificateModal';
import * as reactRedux from 'react-redux';
import {Provider}  from 'react-redux';
import {createStore} from 'redux';
import reducer from '../state/reducer';
import { SET_CERT } from '../state/action';


describe('<CertificateModal/> Positive Scenarios',()=>{
    let wrapper;
    const props={
        setShowPop:jest.fn(),
        setShow:jest.fn()
    };
    const store={
        scrape:{cert:{
            certsDetails:" ", 
            authDetails:" "
        }}
    }
    const mockDispatch=jest.fn();
    beforeEach(()=>{
        jest.spyOn(reactRedux,'useDispatch').mockReturnValue(mockDispatch);
        const mockStore=createStore(reducer,store);
        wrapper=mount(<Provider store={mockStore}><CertificateModal {...props}/></Provider>);
    })
    it('Should render all the components',()=>{
        expect(findByTestAtrr(wrapper,'certPath').length).toBe(1);
        expect(findByTestAtrr(wrapper,'certPass').length).toBe(1);
        expect(findByTestAtrr(wrapper,'authUserName').length).toBe(1);
        expect(findByTestAtrr(wrapper,'authPass').length).toBe(1);
        expect(findByTestAtrr(wrapper,'reset').length).toBe(1);
        expect(findByTestAtrr(wrapper,'submit').length).toBe(1);
        // console.log(wrapper.debug());
    });
    it('Should submit',()=>{
        findByTestAtrr(wrapper,'certPath').simulate('change',{target:{value:'C:\\Users'}});
        findByTestAtrr(wrapper,'certPass').simulate('change',{target:{value:'dummyCertPWD'}});
        findByTestAtrr(wrapper,'authUserName').simulate('change',{target:{value:'dummyUser'}});
        findByTestAtrr(wrapper,'authPass').simulate('change',{target:{value:'dummyAuthPwd'}});

        findByTestAtrr(wrapper,'submit').simulate('click');
        let certObj ={
            certsDetails: `C:\\Users;;dummyCertPWD`,
            authDetails: `dummyUser;dummyAuthPwd`
        }
        expect(mockDispatch).toHaveBeenNthCalledWith(1,{type: SET_CERT, payload: certObj});
        expect(props.setShowPop).toHaveBeenNthCalledWith(1,{title: "Certificate", content: "Certificate Saved successfully"});
        expect(props.setShow).toHaveBeenNthCalledWith(1,false)
    });
    it('SHould rest the fields',()=>{
        findByTestAtrr(wrapper,'certPath').simulate('change',{target:{value:'C:\\Users'}});

        findByTestAtrr(wrapper,'certPass').simulate('change',{target:{value:'dummyCertPWD'}});
        findByTestAtrr(wrapper,'certPath').simulate('change',{target:{value:'C:\\Users'}});
        findByTestAtrr(wrapper,'reset').simulate('click');
        // Assert that the value of the fields have been reset
        expect(findByTestAtrr(wrapper,'certPath').prop('value')).toBe("");
        expect(findByTestAtrr(wrapper,'certPath').prop('value')).toBe("");
        
    })
}) 

// Negative
// describe('<CertificateModal/> Negative Scenarios',()=>{
//     let wrapper;
//     const props={
//         setShowPop:jest.fn(),
//         setShow:jest.fn()
//     };
//     const store={
//         scrape:{
//                 cert:{
//                         certsDetails:" ", 
//                         authDetails:" "
//                     }
//     }}
//     const mockDispatch=jest.fn();
//     beforeEach(()=>{
//         jest.spyOn(reactRedux,'useDispatch').mockReturnValue(mockDispatch);
//         const mockStore=createStore(reducer,store);
//         wrapper=mount(<Provider store={mockStore}><CertificateModal {...props}/></Provider>);
//     })
//     it('Should give error',()=>{
//         console.log(findByTestAtrr(wrapper,'certPath').props())
//         findByTestAtrr(wrapper,'certPath').simulate('change',{target:{value:''}});
//         findByTestAtrr(wrapper,'submit').simulate('click');
//         wrapper.update()
//         console.log(findByTestAtrr(wrapper,'certPath').props())
//     })
// })
