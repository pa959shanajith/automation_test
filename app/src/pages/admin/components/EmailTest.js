import React ,  { Fragment, useRef, useState} from 'react';
import { ModalContainer } from '../../global';
import {testNotificationChannels} from '../api'

/*Component FormInput
  use: renders input box and label in a form
  props: name: label , placeholder : placeholder text , inpref = ref
*/
    
const EmailTest = ({setEmailTest,confObj}) => {
    const emailRef =  useRef()
    return(
        <ModalContainer 
        modalClass = 'modal-sm modal-mmd'
        title='Test Email'
        close={()=>setEmailTest(false)}
        footer={<Footer confObj={confObj} emailRef={emailRef}/>}
        content={<Container emailRef={emailRef}/>}
        />
    )
}

//container for select project popup
const Container = ({emailRef}) => {
    return(
        <div style={{width:'100%',margin:'20px 0px'}}>
            <label>Recipient Email ID</label>
            <input ref={emailRef} style={{width:'60%',marginLeft:'24px'}} placeholder="Enter Recipient Email ID"></input>
        </div>
    )
  }
  
  //footer for select project popup
  const Footer = ({emailRef,confObj}) =>{
      const [errMsg,setErrMsg] = useState('')
      const submit = async() => {
            // eslint-disable-next-line
            const emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (emailRef.current.value.length === 0 || !emailRegEx.test(emailRef.current.value)) {
                setErrMsg("Recipient address is invalid!");
                emailRef.current.style.outline = 'red';
                return false;
            }
            emailRef.current.style.outline = ''
            setErrMsg('Sending...')
            const arg = {channel:confObj.channel, provider:confObj.provider, recipient:emailRef.current.value, conf:confObj}
            var data = await testNotificationChannels(arg)
            if(data.error){setErrMsg(data.error.CONTENT);return;}
            else setErrMsg(data.CONTENT);
      }
      return(
          <Fragment>
              <div className='mnode__buttons'>
                  <label className='err-message'>{errMsg}</label>
                  <button onClick={submit}>TEST</button>
              </div>
          </Fragment>
      )
  }

export default EmailTest;