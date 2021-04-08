
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
    const dateRef = useRef()
    const setDate = props.setDate
    const disabled = props.disabled
    var dateFormat = useSelector(state=>state.login.dateformat);
    dateFormat = dateFormat.replaceAll("-","/")
    var dateVal = props.date;
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
        setDate(event.format("DD-MM-YYYY"))
    }
    const formatDate = (date) => {
        if (!(date.includes("/") || date.includes("-"))) return date;
        if (date.includes("/")) date = date.replaceAll("/","-");
        let splitDate = date.split("-");
        let d = new Date(splitDate[2], splitDate[1], splitDate[0]),
            month = '' + (d.getMonth()),
            day = '' + d.getDate(),
            year = d.getFullYear();
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;

        let map = {"MM":month,"YYYY": year, "DD": day};
        let def = [day,month,year];
        let format = dateFormat.split("/");
        let arr = []
        let used = {}
        for (let index in format){
            if (!(format[index] in map) || format[index] in used){
                return def.join('-');
            }
            arr.push(map[format[index]]) 
            used[format[index]] = 1
        }
        return arr.join('-');
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
                dateFormat="DD/MM/YYYY"
                inputProps={inputProps!==undefined?inputProps:inputPropsDefault} 
                timeFormat={false} 
                id="data-token"
                renderInput={(props) => {
                    return <input data-test='calendar-input' {...props} value={ formatDate(dateVal) ? formatDate(props.value) : ''} className={(inputProps!==undefined ? inputProps.className:" fc-datePicker ")+(error ? " inputError":"")} />
                }}
            />
            <img onClick={openDate} className={"datepickerIconToken"+(disabled?" disabled":"")} src={"static/imgs/ic-datepicker.png"} alt="datepicker" />
        </span>
    )
}

export default CalendarComp