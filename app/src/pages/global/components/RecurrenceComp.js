import React, { useRef, useState, useEffect } from "react";
import ClickAwayListener from "react-click-away-listener";
import {Messages as MSG, VARIANT, setMsg} from '../../global'
import "../styles/RecurrenceComp.scss";

const RecurrenceComp = (props) => {
    const [showRecurrence, setShowRecurrence] = useState(false);
    const [recurrenceType, setRecurrenceType] = useState("");
    const [dailyRecurrenceType, setDailyRecurrenceType] = useState("");
    const [dailyRecurrenceValue, setDailyRecurrenceValue] = useState("");
    const [weeklyRecurrenceWeek, setWeeklyRecurrenceWeek] = useState("");
    const [monthlyRecurrenceType, setMonthlyRecurrenceType] = useState("");
    const [monthlyRecurrenceDayValue, setMonthlyRecurrenceDayValue] = useState("");
    const [monthlyRecurrenceMonthValue, setMonthlyRecurrenceMonthValue] = useState("");
    const [monthlyRecurrenceWeekValue, setMonthlyRecurrenceWeekValue] = useState("Sunday");
    const [monthlyRecurrenceMonthValue_1, setMonthlyRecurrenceMonthValue_1] = useState("");
    const [dailyRecurrenceInputDisable, setDailyRecurrenceInputDisable] = useState(true);
    const [monthlyRecurrenceDayInputDisable, setMonthlyRecurrenceDayInputDisable] = useState(true);
    const [monthlyRecurrenceMonthInputDisable, setMonthlyRecurrenceMonthInputDisable] = useState(true);
    const [monthlyRecurrenceMonthInputDisable_1, setMonthlyRecurrenceMonthInputDisable_1] = useState(true);

    const classTimer = props.classTimer;
    const setRecurringString = props.setRecurringString;
    const setRecurringStringOnHover = props.setRecurringStringOnHover;
    const setRecurringValue = props.setRecurringValue;
    const recur = props.recur;
    const placeholder = props.placeholder;
    const classname = props.classname;
    const readonly = props.readonly;
    const disabled = props.disabled;
    const title = props.title;
    const closeCal = props.closeCal
    const setCloseCal = props.setCloseCal

    useEffect(()=>{
        if(closeCal)setShowRecurrence(false)
    },[closeCal])

    // To open the recurrence screen
    const openRecurrenceScreen = () => {
        if(disabled)return;
        setShowRecurrence(true);
        setCloseCal && setCloseCal(false);
        setRecurrenceType("One Time");	
        setRecurringString("One Time");	
        setRecurringValue("One Time");	
        setRecurringStringOnHover("One Time");
    };

    // Display error message on invalid input
    const displayError = (error) =>{
        setMsg(MSG.CUSTOM(error, VARIANT.ERROR));
        setRecurringValue("")
        setRecurringStringOnHover("");
    }

    // Get the recurring type Daily, Weekly, Monthly
    const getRecurrenceType = (event) => {
        setRecurrenceType(event.target.value);
        if (event.target.value == "One Time") {
            setRecurringString("One Time");
            setRecurringValue("One Time");
            setRecurringStringOnHover("One Time");
        }
        else if (event.target.value == "Daily") {
            setRecurringString("Every Day");
        }
        else if (event.target.value == "Weekly") {
            setRecurringString("Every Week");
        }
        else if (event.target.value == "Monthly") {
            setRecurringString("Every Month");
        }
    };

    // Handle input change for daily recurrence
    const handleInputChange = (event) => {
        setDailyRecurrenceValue(event.target.value);

        if (parseInt(event.target.value) > 30 || parseInt(event.target.value) < 1) {
            displayError("Invalid input (should be between 1-30)");
            return;
        }

        if (dailyRecurrenceType === "days") {
            if (event.target.value == 1) {
                setRecurringValue("0 0 * * *");
                setRecurringStringOnHover("Occurs every day");
            } else {
                if (event.target.value != "") {
                    setRecurringValue("0 0 */" + event.target.value + " * *")
                    setRecurringStringOnHover("Occurs every " + event.target.value + " days");
                }
            }
        }
    };

    // Get the Daily recurring value i.e everyday, every weekday
    const getDailyRecurrenceType = (event) => {
        setDailyRecurrenceType(event.target.value);

        if (event.target.value === "weekday") {
            setRecurringValue("0 0 * * 1-5")
            setRecurringStringOnHover("Occurs every weekday");
            setDailyRecurrenceValue("")
            setDailyRecurrenceInputDisable(true)
        }
        else if (event.target.value === "days") {
            setDailyRecurrenceInputDisable(false)
        }
    };

    // Get Weekly recurrence value
    // const getWeeklyRecurrenceValue = (event) => {
    //     setWeeklyRecurrenceValue(event.target.value);
    // }

    // Get Weekly recurrence value
    const getWeeklyRecurrenceWeek = (event) => {
        setWeeklyRecurrenceWeek(event.target.value);

        if (event.target.value == "sunday") {
            setRecurringValue("0 0 * * 0")
        }
        else if (event.target.value == "monday") {
            setRecurringValue("0 0 * * 1")
        }
        else if (event.target.value == "tuesday") {
            setRecurringValue("0 0 * * 2")
        }
        else if (event.target.value == "wednesday") {
            setRecurringValue("0 0 * * 3")
        }
        else if (event.target.value == "thursday") {
            setRecurringValue("0 0 * * 4")
        }
        else if (event.target.value == "friday") {
            setRecurringValue("0 0 * * 5")
        }
        else if (event.target.value == "saturday") {
            setRecurringValue("0 0 * * 6")
        }
        setRecurringStringOnHover("Occurs every " + event.target.value);	
    }

    const getMonthlyRecurrenceType = (event) => {
        setMonthlyRecurrenceType(event.target.value);

        if (event.target.value === "days") {
            setMonthlyRecurrenceDayInputDisable(false);
            setMonthlyRecurrenceMonthValue_1("");
            setMonthlyRecurrenceMonthInputDisable_1(true);
        }
        else if (event.target.value === "weeks") {
            setMonthlyRecurrenceMonthInputDisable_1(false);
            setMonthlyRecurrenceDayValue("");
            setMonthlyRecurrenceMonthValue("");
            setMonthlyRecurrenceDayInputDisable(true);
            setMonthlyRecurrenceMonthInputDisable(true);
        }
    }

    const handleDayInputChange = (event) => {
        setMonthlyRecurrenceDayValue(event.target.value)
        setMonthlyRecurrenceMonthInputDisable(false);

        if (parseInt(event.target.value) > 30 || parseInt(event.target.value) < 1) {
            displayError("Invalid input (should be between 1-30)");
            return;
        }
    }

    const handleMonthInputChange = (event) => {
        setMonthlyRecurrenceMonthValue(event.target.value)

        if (parseInt(monthlyRecurrenceDayValue) > 30 || parseInt(monthlyRecurrenceDayValue) < 1) {
            displayError("Invalid input (should be between 1-30)");
            return;
        }
        
        if (parseInt(event.target.value) > 12 || parseInt(event.target.value) < 1) {
            displayError("Invalid input (should be between 1-12)");
            return;
        }

        if (monthlyRecurrenceType === "days") {
            if (monthlyRecurrenceDayValue != "") {		
                setRecurringValue("0 0 " + monthlyRecurrenceDayValue + " */" + event.target.value + " *");	
                if (monthlyRecurrenceDayValue == 1) {	
                    setRecurringStringOnHover("Occurs on " + monthlyRecurrenceDayValue + "st day of every " + event.target.value + " month");	
                } 
                else if (monthlyRecurrenceDayValue == 2) {	
                    setRecurringStringOnHover("Occurs on " +	monthlyRecurrenceDayValue +	"nd day of every " + event.target.value + " month");	
                } 
                else if (monthlyRecurrenceDayValue == 3) {	
                    setRecurringStringOnHover("Occurs on " +	monthlyRecurrenceDayValue +	"rd day of every " + event.target.value + " month");	
                } 
                else {	
                    setRecurringStringOnHover("Occurs on " +	monthlyRecurrenceDayValue +	"th day of every " + event.target.value + " month");	
                }	
            }	
        }
    }

    const handleWeekInputChange = (event) => {
        setMonthlyRecurrenceWeekValue(event.target.value)
    }

    const handleMonthInputChange_1 = (event) => {
        setMonthlyRecurrenceMonthValue_1(event.target.value)

        if (parseInt(event.target.value) > 12 || parseInt(event.target.value) < 1) {
            displayError("Invalid input (should be between 1-12)");
            return;
        }

        if (monthlyRecurrenceType === "weeks") {
            if (event.target.value != "") {
                if (monthlyRecurrenceWeekValue == "Sunday") {
                    setRecurringValue("0 0 * */" + event.target.value + " 0")
                    setRecurringStringOnHover("Occurs on every sunday of every " + event.target.value +	" month");
                }
                else if (monthlyRecurrenceWeekValue == "Monday") {
                    setRecurringValue("0 0 * */" + event.target.value + " 1")
                    setRecurringStringOnHover("Occurs on every monday of every " + event.target.value +	" month");
                }
                else if (monthlyRecurrenceWeekValue == "Tuesday") {
                    setRecurringValue("0 0 * */" + event.target.value + " 2")
                    setRecurringStringOnHover("Occurs on every tuesday of every " + event.target.value +	" month");
                }
                else if (monthlyRecurrenceWeekValue == "Wednesday") {
                    setRecurringValue("0 0 * */" + event.target.value + " 3")
                    setRecurringStringOnHover("Occurs on every wednesday of every " + event.target.value +	" month");
                }
                else if (monthlyRecurrenceWeekValue == "Thursday") {
                    setRecurringValue("0 0 * */" + event.target.value + " 4")
                    setRecurringStringOnHover("Occurs on every thursday of every " + event.target.value +	" month");
                }
                else if (monthlyRecurrenceWeekValue == "Friday") {
                    setRecurringValue("0 0 * */" + event.target.value + " 5")
                    setRecurringStringOnHover("Occurs on every friday of every " + event.target.value +	" month");
                }
                else if (monthlyRecurrenceWeekValue == "Saturday") {
                    setRecurringValue("0 0 * */" + event.target.value + " 6")
                    setRecurringStringOnHover("Occurs on every saturday of every " + event.target.value +	" month");
                }
            }
        }
    }

    return (
        <ClickAwayListener className={"recurrence-time-container " +(classTimer ? " " + classTimer : "")} onClickAway={() => {setShowRecurrence(false); setRecurrenceType(""); setDailyRecurrenceType(""); setDailyRecurrenceValue(""); setWeeklyRecurrenceWeek(""); setMonthlyRecurrenceType(""); setMonthlyRecurrenceDayValue(""); setMonthlyRecurrenceMonthValue(""); setMonthlyRecurrenceMonthValue_1(""); setMonthlyRecurrenceWeekValue("Sunday"); setDailyRecurrenceInputDisable(true); setMonthlyRecurrenceDayInputDisable(true); setMonthlyRecurrenceMonthInputDisable(true); setMonthlyRecurrenceMonthInputDisable_1(true);}} as="span" >
            <div className="rdt rdtOpen">
                <input type="text" className={classname} placeholder={placeholder} readOnly={readonly} disabled={disabled} title={title ? title : "Select Frequency"} value={recur} />
                {showRecurrence && ( 
                    <div className="main-container rdtPicker">
                        <strong>Recurrence Pattern:</strong>
                        <div className="recurrence-container">
                            <div className="recurrence-list">
                                <lable>
                                    <input type="radio" value="One Time" checked={recurrenceType === "One Time"} onChange={getRecurrenceType} />
                                    <span> One Time</span>
                                </lable>

                                <lable>
                                    <input type="radio" value="Daily" checked={recurrenceType === "Daily"} onChange={getRecurrenceType} />
                                    <span> Daily</span>
                                </lable>

                                <lable>
                                    <input type="radio" value="Weekly" checked={recurrenceType === "Weekly"} onChange={getRecurrenceType} />
                                    <span> Weekly</span>
                                </lable>

                                <lable>
                                    <input type="radio" value="Monthly" checked={recurrenceType === "Monthly"} onChange={getRecurrenceType} />
                                    <span> Monthly</span>
                                </lable>
                            </div>
                            { recurrenceType && recurrenceType != "One Time" && 
                                <div className="recurrence-content">
                                    {recurrenceType === "Daily" && ( 
                                        <div className="daily-recurrence-list">
                                            <lable>
                                                <input type="radio" value="days" checked={ dailyRecurrenceType === "days" } onChange={getDailyRecurrenceType} />
                                                <span>
                                                    &nbsp;&nbsp;&nbsp;&nbsp;Every
                                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                                    <input className={"recur-textbox " + ((parseInt(dailyRecurrenceValue) > 30 || parseInt(dailyRecurrenceValue) < 1) ? "s__err-Border" : "")} type="text" size="1" disabled = {(dailyRecurrenceInputDisable)? "disabled" : ""} value={dailyRecurrenceValue} onInput={handleInputChange} />
                                                    &nbsp;&nbsp;&nbsp;&nbsp;day(s). 
                                                </span>
                                            </lable>

                                            <lable>
                                                <input type="radio" value="weekday" checked={ dailyRecurrenceType === "weekday" } onChange={getDailyRecurrenceType} />
                                                <span>&nbsp;&nbsp;&nbsp;&nbsp;Every weekday.</span>
                                            </lable>
                                        </div>
                                    )}
                                    {recurrenceType === "Weekly" && (
                                        <div className="weekly-recurrence-list">
                                            <span>
                                                {/* Recur every&nbsp;&nbsp;&nbsp;&nbsp; */}
                                                {/* <input className="recur-textbox" type="text" size="1" value={weeklyRecurrenceValue} onInput={getWeeklyRecurrenceValue}/> */}
                                                {/* &nbsp;&nbsp;&nbsp;&nbsp;week(s) on: */}
                                                Recur every week on:
                                            </span>
                                            <div className="weeks">
                                                <div className="weeks-child">
                                                    <lable>
                                                        <input type="checkbox" value="sunday" checked={weeklyRecurrenceWeek === "sunday"} onChange={getWeeklyRecurrenceWeek} />
                                                        <span> Sunday</span>
                                                    </lable>
                                                </div>
                                                <div className="weeks-child">
                                                    <lable>
                                                        <input type="checkbox" value="monday" checked={weeklyRecurrenceWeek === "monday"} onChange={getWeeklyRecurrenceWeek} />
                                                        <span> Monday</span>
                                                    </lable>
                                                </div>
                                                <div className="weeks-child">
                                                    <lable>
                                                        <input type="checkbox" value="tuesday" checked={weeklyRecurrenceWeek === "tuesday"} onChange={getWeeklyRecurrenceWeek} />
                                                        <span> Tuesday</span>
                                                    </lable>
                                                </div>
                                                <div className="weeks-child">
                                                    <lable>
                                                        <input type="checkbox" value="wednesday" checked={weeklyRecurrenceWeek === "wednesday"} onChange={getWeeklyRecurrenceWeek}  />
                                                        <span> Wednesday</span>
                                                    </lable>
                                                </div>
                                                <div className="weeks-child">
                                                    <lable>
                                                        <input type="checkbox" value="thursday" checked={weeklyRecurrenceWeek === "thursday"} onChange={getWeeklyRecurrenceWeek} />
                                                        <span> Thursday</span>
                                                    </lable>
                                                </div>
                                                <div className="weeks-child">
                                                    <lable>
                                                        <input type="checkbox" value="friday" checked={weeklyRecurrenceWeek === "friday"} onChange={getWeeklyRecurrenceWeek} />
                                                        <span> Friday</span>
                                                    </lable>
                                                </div>
                                                <div className="weeks-child">
                                                    <lable>
                                                        <input type="checkbox" value="saturday" checked={weeklyRecurrenceWeek === "saturday"} onChange={getWeeklyRecurrenceWeek} />
                                                        <span> Saturday</span>
                                                    </lable>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {recurrenceType === "Monthly" && (
                                        <div className="monthly-recurrence-list">
                                            <lable>
                                                <input type="radio" value="days" checked={monthlyRecurrenceType === "days"} onChange={getMonthlyRecurrenceType} />
                                                <span>
                                                    &nbsp;&nbsp;&nbsp;&nbsp;Day
                                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                                    <input className={"recur-textbox " + ((parseInt(monthlyRecurrenceDayValue) > 30 || parseInt(monthlyRecurrenceDayValue) < 1) ? "s__err-Border" : "")} type="text" size="1" disabled = {(monthlyRecurrenceDayInputDisable)? "disabled" : ""} value={monthlyRecurrenceDayValue} onInput={handleDayInputChange} />
                                                    &nbsp;&nbsp;&nbsp;&nbsp;of every
                                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                                    <input className={"recur-textbox " + ((parseInt(monthlyRecurrenceMonthValue) > 12 || parseInt(monthlyRecurrenceMonthValue) < 1) ? "s__err-Border" : "")} type="text" size="1" disabled = {(monthlyRecurrenceMonthInputDisable)? "disabled" : ""} value={monthlyRecurrenceMonthValue} onInput={handleMonthInputChange} />
                                                    &nbsp;&nbsp;&nbsp;&nbsp;month(s). 
                                                </span>
                                            </lable>
                                            <lable>
                                                <input type="radio" value="weeks" checked={monthlyRecurrenceType === "weeks"} onChange={getMonthlyRecurrenceType} />
                                                <span>
                                                    &nbsp;&nbsp;&nbsp;&nbsp;The
                                                    {/* <select name="month_day" id="month_day">
                                                        <option value="first">
                                                            First
                                                        </option>
                                                        <option value="second">
                                                            Second
                                                        </option>
                                                        <option value="third">
                                                            Third
                                                        </option>
                                                        <option value="fourth">
                                                            Fourth
                                                        </option>
                                                    </select> */}
                                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                                    <select id="month_week" name="month_week" value={monthlyRecurrenceWeekValue} onChange={handleWeekInputChange}>
                                                        <option value="Sunday">
                                                            Sunday
                                                        </option>
                                                        <option value="Monday">
                                                            Monday
                                                        </option>
                                                        <option value="Tuesday">
                                                            Tuesday
                                                        </option>
                                                        <option value="Wednesday">
                                                            Wednesday
                                                        </option>
                                                        <option value="Thursday">
                                                            Thursday
                                                        </option>
                                                        <option value="Friday">
                                                            Friday
                                                        </option>
                                                        <option value="Saturday">
                                                            Saturday
                                                        </option>
                                                    </select>
                                                    &nbsp;&nbsp;&nbsp;&nbsp;of every
                                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                                    <input className={"recur-textbox " + ((parseInt(monthlyRecurrenceMonthValue_1) > 12 || parseInt(monthlyRecurrenceMonthValue_1) < 1) ? "s__err-Border" : "")} type="text" size="1" disabled = {(monthlyRecurrenceMonthInputDisable_1)? "disabled" : ""} value={monthlyRecurrenceMonthValue_1} onInput={handleMonthInputChange_1} />
                                                    &nbsp;&nbsp;&nbsp;&nbsp;month(s).
                                                </span>
                                            </lable>
                                        </div>
                                    )}
                                </div>
                            }
                        </div>
                    </div>
                )}
                <img className={"timepickerIconToken"+(disabled?" disabled":"")} src={"static/imgs/ic-timepicker.png"} alt="timepicker" onClick={openRecurrenceScreen} />
            </div>
        </ClickAwayListener>
    );
};

export default RecurrenceComp;