import React from 'react'

/*Component Header
  use: renders div tag for settings heading
  props: heading
*/
const Header = (props)=>{
    return (
        <div id="page-taskName"><span>{props.heading}</span></div>
    );
}

/*Component FormInput
  use: renders input box and label in a form
  props: name: label , placeholder : placeholder text, type, value, onChange
*/
    
const FormInput = (props) => {
    return(
        <>
                <input disabled={props.disabled} type={props.type} className={props.className} placeholder={props.placeholder} value = {props.value} onChange = {props.onChange}/>
        </>
    )
}

export {Header, FormInput};