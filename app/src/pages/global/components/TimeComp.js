
import React, { useRef } from 'react';
import Datetime from "react-datetime";
import '../styles/TimeComp.scss'


/*Component TimeComp
  use: returns Time component
  props : {setTime:state,time:datevalue,disaled:boolean,classTimer:string,error:boolean}
*/

const TimeComp = (props) => {
    const timeRef = useRef()
    const setTime = props.setTime
    const timeVal = props.time
    const classTimer = props.classTimer
    const inputProps = props.inputProps
    const disabled = props.disabled
    const inputPropsDefault = {
		placeholder: "Select Time",
		readOnly:"readonly" ,
        className:"fc-timePicker"
    };
    const openTime = ()=> {
        if(disabled)return;
        timeRef.current._onInputClick()
    }
    const submit = (event) => {
        var prevTime = event._i.split(":");
        var newTime = event.format("HH:mm").split(":");
        if(prevTime[1] === "00" && newTime[1] === "59") {
            if(newTime[0][0]==="0"){
                if(newTime[0][1]==="0") setTime("23:"+newTime[1]);
                else setTime("0"+JSON.stringify(JSON.parse(newTime[0][1])-1)+":"+newTime[1]);
            }
            else setTime(JSON.stringify(JSON.parse(newTime[0])-1)+":"+newTime[1]);
        } else if(prevTime[1] === "59" && newTime[1] === "00") {
            if(newTime[0][0]==="0"){
                if(newTime[0][1]==="9") setTime(JSON.stringify(JSON.parse(newTime[0][1])+1)+":"+newTime[1]);
                else setTime("0"+JSON.stringify(JSON.parse(newTime[0][1])+1)+":"+newTime[1]);
            }
            else if(newTime[0]==="23") setTime("00:"+newTime[1]);
            else setTime(JSON.stringify(JSON.parse(newTime[0])+1)+":"+newTime[1]);
        }
        else setTime(event.format("HH:mm"))
    }
    return(
        <span className={"time-container " + (classTimer? " "+classTimer:"")} >
            <Datetime
                value={timeVal} 
                onChange={submit}
                inputProps={inputProps!==undefined?inputProps:inputPropsDefault} 
                id="time-token"
                ref={timeRef} 
                dateFormat={false} 
                timeFormat="HH:mm" 
            />
            <img onClick={openTime} className="timepickerIconToken" src={"static/imgs/ic-timepicker.png"} alt="timepicker" />
        </span>
    )
}

export default TimeComp