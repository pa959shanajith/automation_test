
import React, { useRef, useState, useEffect } from 'react';
import Datetime from "react-datetime";
import ClickAwayListener from 'react-click-away-listener';
import {useSelector} from 'react-redux';
import moment from "moment";
import '../styles/CalendarComp.scss'


/*Component CalendarComp
  use: returns Calendar component
  props : {setDate:state,date:datevalue,disbled:boolean,classCalender:string,error:boolean,closeCal:boolean,setCloseCal:bool,idx:int(optional),screen:string(optional)}
*/

const CalendarComp = (props) => {
    const [showCal,setShowCal] = useState(false)
    const dateRef = useRef()
    const setDate = props.setDate
    const disabled = props.disabled
    var dateFormat = useSelector(state=>state.login.dateformat);
    dateFormat = dateFormat.replace(/-/g,"/")
    var dateVal = props.date;
    const classCalender = props.classCalender
    const error = props.error
    const closeCal = props.closeCal
    const setCloseCal = props.setCloseCal

    const inputProps = props.inputProps
    useEffect(()=>{
        if(closeCal)setShowCal(false)
    },[closeCal])
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
        title:"Select Date",
        disabled:disabled
    };
    const openDate = ()=> {
        if(disabled)return;
        setShowCal(true);
        setCloseCal && setCloseCal(false);
        // (props.dateRef || dateRef).current._onInputClick()
        if (props.screen === "scheduleSuiteTop"){
            let suiteHeader = document.getElementById(`ss-id${props.idx}`);
            if (suiteHeader) {
                const picker = suiteHeader.getElementsByClassName("rdtPicker");
                if (picker.length === 2){
                    let offset = `${suiteHeader.getBoundingClientRect().y + suiteHeader.getBoundingClientRect().height}px`
                    picker[1].style.top = offset;
                }
            }
        }
    }
    const submit = (event) => {
        setDate(event.format("DD-MM-YYYY"))
        setShowCal(false);
    }
    const formatDate = (date) => {
        if (!(date.includes("/") || date.includes("-"))) return date;
        if (date.includes("/")) date = date.replaceAll("/","-");
        let splitDate = date.split("-");
        let d = new Date(splitDate[2], splitDate[1] - 1, splitDate[0]),
            month = '' + (d.getMonth() + 1),
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
        <ClickAwayListener onClickAway={()=> setShowCal(false)} data-test='calendar-comp' className={"date-container " + (classCalender? " "+classCalender:"")} as="span">
            <Datetime
                ref={dateRef} 
                closeOnSelect={true}
                isValidDate={valid}
                value={dateVal} 
                open={showCal}
                onChange={submit}
                dateFormat="DD-MM-YYYY"
                inputProps={inputProps!==undefined?inputProps:inputPropsDefault} 
                timeFormat={false} 
                id="data-token"
                onOpen={openDate}
                renderInput={(props) => {
                    return <input {...props}value={ formatDate(dateVal) ? formatDate(props.value) : ''} className={(inputProps!==undefined ? inputProps.className:" fc-datePicker ")+(error ? " inputError":"")} />
                }}
            />
            <img data-test="datePickerIcon" onClick={openDate} className={"datepickerIconToken"+(disabled?" disabled":"")} src={"static/imgs/ic-datepicker.png"} alt="datepicker" />
        </ClickAwayListener>
    )
}

export default CalendarComp