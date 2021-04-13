
import React, { useRef } from 'react';
import Datetime from "react-datetime";
import moment from "moment";
import '../styles/CalendarComp.scss'


/*Component CalendarComp
  use: returns Calendar component
  props : {setDate:state,date:datevalue,disbled:boolean,classCalender:string,error:boolean}
*/

const CalendarComp = (props) => {
    const dateRef = useRef()
    const setDate = props.setDate
    const dateVal = props.date
    const disabled = props.disabled
    const classCalender = props.classCalender
    const error = props.error
    const inputProps = props.inputProps
    const valid = (current) =>{
        var yesterday;
        if(props.execMetrics){
            yesterday = moment();
            return current.isBefore(yesterday);
        }
        else {
            const yesterday = moment().subtract(1, "day");
            return current.isAfter(yesterday);
        }
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
        <span data-test="dateContainer"  className={"date-container " + (classCalender? " "+classCalender:"")} >
            <Datetime
                closeOnClickOutside={true}
                ref={dateRef} 
                closeOnSelect={true}
                isValidDate={valid}
                value={dateVal} 
                onChange={submit}
                dateFormat="DD/MM/YYYY"
                inputProps={inputProps!==undefined?inputProps:inputPropsDefault} 
                timeFormat={false} 
                id="data-token"
                renderInput={(props) => {
                    return <input {...props} value={ dateVal ? props.value : ''} className={(inputProps!==undefined ? inputProps.className:" fc-datePicker ")+(error ? " inputError":"")} />
                }}
            />
            <img  data-test="datePickerIcon"onClick={openDate} className={"datepickerIconToken"+(disabled?" disabled":"")} src={"static/imgs/ic-datepicker.png"} alt="datepicker" />
        </span>
    )
}

export default CalendarComp