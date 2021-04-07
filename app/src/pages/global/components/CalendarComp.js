
import React, { useRef } from 'react';
import Datetime from "react-datetime";
import {useSelector} from 'react-redux';
import moment from "moment";
import '../styles/CalendarComp.scss'


/*Component CalendarComp
  use: returns Calendar component
  props : {setDate:state,date:datevalue,disbled:boolean,classCalender:string,error:boolean}
*/

const CalendarComp = (props) => {
    console.log(props)
    const dateRef = useRef()
    const setDate = props.setDate
    var dateVal = props.date
    const disabled = props.disabled
    const dateFormat = useSelector(state=>state.login.dateformat);
    const classCalender = props.classCalender
    const error = props.error
    const inputProps = props.inputProps
    const valid = (current) =>{
        const yesterday = moment().subtract(1, "day");
        return current.isAfter(yesterday);
    }
    const inputPropsDefault = {
		placeholder: "Select Date",
		readOnly:"readonly" ,
        className:"fc-datePicker",
        disabled:disabled
    };
    const openDate = ()=> {
        if(disabled)return;
        dateRef.current._onInputClick()
    }
    const submit = (event) => {
        setDate(event.format("DD/MM/YYYY"))
    }
    return(
        <span data-test='calendar-comp' className={"date-container " + (classCalender? " "+classCalender:"")} >
            <Datetime
                closeOnClickOutside={true}
                ref={dateRef} 
                closeOnSelect={true}
                isValidDate={valid}
                value={dateVal} 
                onChange={submit}
                dateFormat={dateFormat}
                inputProps={inputProps!==undefined?inputProps:inputPropsDefault} 
                timeFormat={false} 
                id="data-token"
                renderInput={(props) => {
                    return <input data-test='calendar-input' {...props} value={ dateVal ? props.value : ''} className={(inputProps!==undefined ? inputProps.className:" fc-datePicker ")+(error ? " inputError":"")} />
                }}
            />
            <img onClick={openDate} className={"datepickerIconToken"+(disabled?" disabled":"")} src={"static/imgs/ic-datepicker.png"} alt="datepicker" />
        </span>
    )
}

export default CalendarComp