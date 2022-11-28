
import React, { useRef, useState, useEffect } from 'react';
import Datetime from "react-datetime";
import ClickAwayListener from 'react-click-away-listener';
import '../styles/TimeComp.scss'


/*Component TimeComp
  use: returns Time component
  props : {setTime:state,time:datevalue,disaled:boolean,classTimer:string,error:boolean}
*/

const TimeComp = (props) => {

    const [showTime, setShowTime] = useState(false);

    const timeRef = useRef()
    const setTime = props.setTime
    const timeVal = props.time
    const classTimer = props.classTimer
    const inputProps = props.inputProps
    const disabled = props.disabled
    const setCloseCal = props.setCloseCal
    const closeCal = props.closeCal
    const inputPropsDefault = {
		placeholder: "Select Time",
		readOnly:"readonly" ,
        className:"fc-timePicker"
    };

    useEffect(()=>{
        if(closeCal)setShowTime(false)
    },[closeCal])

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

    const onOpen = ()=> {
        if(disabled)return;
        setShowTime(true);
        setCloseCal && setCloseCal(false);
        
        if (props.screen === "scheduleSuiteTop"){
            let suiteHeader = document.getElementById(`ss-id${props.idx}`);
            if (suiteHeader) {
                const picker = suiteHeader.getElementsByClassName("rdtPicker");
                if (picker.length === 2){
                    let offset = `${suiteHeader.getBoundingClientRect().y + suiteHeader.getBoundingClientRect().height}px`
                    picker[0].style.top = offset;
                }
            }
        }
    }

    return(
        <ClickAwayListener onClickAway={()=> setShowTime(false)} className={"time-container " + (classTimer? " "+classTimer:"")} as="span">
            <Datetime
                value={timeVal} 
                onChange={submit}
                open={showTime}
                inputProps={inputProps!==undefined?inputProps:inputPropsDefault} 
                id="time-token"
                ref={timeRef} 
                dateFormat={false} 
                timeFormat="HH:mm" 
                onOpen={onOpen}
            />
            <img onClick={onOpen} className={"timepickerIconToken"+(disabled?" disabled":"")} src={"static/imgs/ic-timepicker.png"} alt="timepicker" />
        </ClickAwayListener>
    )
}

export default TimeComp