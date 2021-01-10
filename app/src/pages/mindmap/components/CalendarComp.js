
import React, { useRef } from 'react';
import Datetime from "react-datetime";
import moment from "moment";
import '../styles/CalendarComp.scss'


/*Component CalendarComp
  use: returns Calendar component
*/

const CalendarComp = (props) => {
    const dateRef = useRef()
    const setDate = props.setDate
    const dateVal = props.date
    const disabled = props.disabled
    const valid = (current) =>{
        const yesterday = moment().subtract(1, "day");
        return current.isAfter(yesterday);
    }
    const inputProps = {
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
        <span className="date-container" >
            <Datetime
                closeOnClickOutside={true}
                ref={dateRef} 
                closeOnSelect={true}
                isValidDate={valid}
                value={dateVal} 
                onChange={submit}
                dateFormat="DD/MM/YYYY"
                inputProps={inputProps} timeFormat={false} id="data-token"
            />
            <img onClick={openDate} className={"datepickerIconToken"+(disabled?" disabled":"")} src={"static/imgs/ic-datepicker.png"} alt="datepicker" />
        </span>
    )
}

export default CalendarComp