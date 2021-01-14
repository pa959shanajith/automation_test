import React ,  { Fragment, useEffect, useState} from 'react';
import ClickAwayListener from 'react-click-away-listener';
import { ScrollBar } from '../../global';
import '../styles/FormComp.scss'

/*Component FormInput
  use: renders input box and label in a form
  props: name: label , placeholder : placeholder text , inpref = ref
*/
    
const FormInput = (props) => {
    const name = props.label
    const type = props.type
    const placeholder = props.placeholder
    const inpRef = props.inpRef
    return(
        <Fragment>
            <div className='col-xs-9 form-group input-label'>
                <label>{name}</label>
                <input type={type} ref={inpRef} className={'middle__input__border form-control__conv-project form-control-custom left-opt'} placeholder={placeholder}></input>
            </div>
        </Fragment>
    )
}

/*Component FormSelect
  use: renders select box and label in a form
  props: name: label , option : [option1,option2] , inpRef : [ref1,ref2] , defValue : default value in options

*/
    
const FormSelect = (props) => {
    const name = props.label
    const defValue = props.defValue
    const option = props.option
    const inpRef = props.inpRef
    const onChangeFn = props.onChangeFn
    return(
        <Fragment>
            <div className='col-xs-9 form-group input-label'>
                <label>{name}</label>
                <select onChange={onChangeFn} ref={inpRef} defaultValue={'def-opt'} className={"adminSelect-project-assign form-control__conv-project left-opt"}>
                    <option key={'def-opt'} value={'def-opt'} disabled={true}>{defValue}</option>
                    {option.map((e,i)=><option key={i+'_def'} value={e}>{e}</option>)}
                </select>            
            </div>
        </Fragment>
    )
}

/*Component FormRadio
  use: renders radio button and label in a form
  props: name: label , option : [option1,option2] , inpRef : [ref1,ref2]
*/

const FormRadio = (props) => {
    const name = props.label
    const option = props.option
    const inpRef = props.inpRef
    return(
        <Fragment>
            <div className='col-xs-9 form-group input-label'>
                <label>{name}</label>
                <div className='conf-radio left-opt'>
                    {Object.keys(inpRef).map((e,i)=>(
                    <span key={"rad_"+name+i}>
                        <input id={name+i} name={name} value={e} ref={inpRef[e]} type="radio"></input>
                        <label htmlFor={name+i}>{option[i]}</label>
                    </span>)
                    )}
                </div>
            </div>
        </Fragment>
    )
}

/*Component FormInpDropDown
  use: renders searchable pool dropdown
*/

const FormInpDropDown = ({data,setFilter,clickInp,inpRef}) => {
    const inputRef = inpRef
    const [list,setList] =  useState([])
    const [dropDown,setDropDown] = useState(false)
    useEffect(()=>{
        setList([...data])
    },[data])
    const inputFilter = () =>{
        var val = inputRef.current.value
        var items = [...data].filter((e)=>e[1].poolname.toUpperCase().indexOf(val.toUpperCase())!==-1)
        setList(items)
    }
    const resetField = () => {
        inputRef.current.value = ""
        setList([...data])
        setDropDown(true)
        if(clickInp)clickInp()
    }
    const selectOption = (e) =>{
        var text = e.currentTarget.innerText
        inputRef.current.value = text
        setDropDown(false)
        setFilter(e)
    }
    return(
        <Fragment>
            <ClickAwayListener onClickAway={()=>setDropDown(false)}>
            <div>
                <input type={'hidden'} autoComplete={"off"} ref={inputRef} className="btn-users dropdown-toggle-edit edit-user-dropdown-edit" onChange={inputFilter} onClick = {resetField} type="text"  id="userIdName" placeholder="Search ICE Pool.."/>
                <div className="form-inp-dropdown" role="menu" aria-labelledby="userIdName" style={{display: (dropDown?"block":"none")}}>
                    <ScrollBar thumbColor="#929397" >
                    {list.map((e) => (  
                        <option key={e[0]} onClick={selectOption} value={e[0]}> {e[1].poolname}</option> 
                    ))}
                    </ScrollBar>
                </div>
            </div>
            </ClickAwayListener>
        </Fragment>
    )
}
export {FormInput,FormSelect,FormRadio,FormInpDropDown};

