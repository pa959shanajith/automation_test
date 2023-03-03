import React, { useRef, useState, useEffect } from "react";
import ClickAwayListener from "react-click-away-listener";
import { Messages as MSG, VARIANT, setMsg } from '../../global';
import "../styles/RecurrenceComp.scss";

const RecurrenceComp = (props) => {
    const [showRecurrence, setShowRecurrence] = useState(false);
    const [recurrenceType, setRecurrenceType] = useState("");
    const [dailyRecurrenceType, setDailyRecurrenceType] = useState("");
    const [dailyRecurrenceValue, setDailyRecurrenceValue] = useState("");
    const [monthlyRecurrenceType, setMonthlyRecurrenceType] = useState("");
    const [monthlyRecurrenceDayValue, setMonthlyRecurrenceDayValue] = useState("");
    const [monthlyRecurrenceMonthValue, setMonthlyRecurrenceMonthValue] = useState("");
    const [monthlyRecurrenceWeekValue, setMonthlyRecurrenceWeekValue] = useState("Sunday");
    const [monthlyRecurrenceFSTFLValue, setMonthlyRecurrenceFSTFLValue] = useState("1");
    const [monthlyRecurrenceMonthValue_1, setMonthlyRecurrenceMonthValue_1] = useState("");
    const [dailyRecurrenceInputDisable, setDailyRecurrenceInputDisable] = useState(true);
    const [monthlyRecurrenceDayInputDisable, setMonthlyRecurrenceDayInputDisable] = useState(true);
    const [monthlyRecurrenceMonthInputDisable, setMonthlyRecurrenceMonthInputDisable] = useState(true);
    const [monthlyRecurrenceMonthInputDisable_1, setMonthlyRecurrenceMonthInputDisable_1] = useState(true);
    const [isClicked, setIsClicked] = useState(false);

    const regEx = new RegExp('^[1-9][0-9]*$');

    const weekDays = [{ name: "Sunday" }, { name: "Monday" }, { name: "Tuesday" }, { name: "Wednesday" }, { name: "Thursday" }, { name: "Friday" }, { name: "Saturday" }, { name: "All" }];

    const [weeklyRecurrenceWeek, setWeeklyRecurrenceWeek] = useState(
        new Array(weekDays.length).fill(false)
    );

    const [selectedWeek, setSelectedWeek] = useState(
        new Array(weekDays.length).fill(false)
    );

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
    const closeCal = props.closeCal;
    const setCloseCal = props.setCloseCal;
    const clearScheduleData = props.clearScheduleData;

    useEffect(() => {
        if (closeCal) setShowRecurrence(false); 
    }, [closeCal]);

    // will be run on a successful schedule (to clear the data)
    useEffect(() => {
        if (clearScheduleData) { setRecurrenceType(""); setDailyRecurrenceType(""); setDailyRecurrenceValue(""); setWeeklyRecurrenceWeek(new Array(weekDays.length).fill(false)); setMonthlyRecurrenceType(""); setMonthlyRecurrenceDayValue(""); setMonthlyRecurrenceMonthValue(""); setMonthlyRecurrenceMonthValue_1(""); setMonthlyRecurrenceWeekValue("Sunday"); setDailyRecurrenceInputDisable(true); setMonthlyRecurrenceDayInputDisable(true); setMonthlyRecurrenceMonthInputDisable(true); setMonthlyRecurrenceMonthInputDisable_1(true); setSelectedWeek(new Array(weekDays.length).fill(false)); setMonthlyRecurrenceFSTFLValue("1"); setIsClicked(false); }
    }, [clearScheduleData]);


    // To open the recurrence screen
    const openRecurrenceScreen = () => {
        if (disabled) return;
        setShowRecurrence(true);
        setCloseCal && setCloseCal(false);
        if (!isClicked) {
            setRecurrenceType("One Time");
            setRecurringString("One Time");
            setRecurringValue("One Time");
            setRecurringStringOnHover("One Time");
            setIsClicked(true);
        }
    };

    // Display error message on invalid input
    const displayError = (error) => {
        setMsg(MSG.CUSTOM(error, VARIANT.ERROR));
        setRecurringValue("");
        setRecurringStringOnHover("");
    };

    // Get the recurring type Daily, Weekly, Monthly
    const getRecurrenceType = (event) => {
        setRecurrenceType(event.target.value);
        if (event.target.value == "One Time") {
            setRecurringString("One Time");
            setRecurringValue("One Time");
            setRecurringStringOnHover("One Time");
            setDailyRecurrenceType(""); setDailyRecurrenceValue(""); setDailyRecurrenceInputDisable(true); setWeeklyRecurrenceWeek(new Array(weekDays.length).fill(false)); setSelectedWeek(new Array(weekDays.length).fill(false)); setMonthlyRecurrenceType(""); setMonthlyRecurrenceDayValue(""); setMonthlyRecurrenceMonthValue(""); setMonthlyRecurrenceMonthValue_1(""); setMonthlyRecurrenceWeekValue("Sunday");setMonthlyRecurrenceDayInputDisable(true); setMonthlyRecurrenceMonthInputDisable(true); setMonthlyRecurrenceMonthInputDisable_1(true); setMonthlyRecurrenceFSTFLValue("1");
        }
        else if (event.target.value == "Daily") {
            setRecurringString("Every Day");
            setRecurringValue("");
            setRecurringStringOnHover("");
            setWeeklyRecurrenceWeek(new Array(weekDays.length).fill(false)); setSelectedWeek(new Array(weekDays.length).fill(false)); setMonthlyRecurrenceType(""); setMonthlyRecurrenceDayValue(""); setMonthlyRecurrenceMonthValue(""); setMonthlyRecurrenceMonthValue_1(""); setMonthlyRecurrenceWeekValue("Sunday");setMonthlyRecurrenceDayInputDisable(true); setMonthlyRecurrenceMonthInputDisable(true); setMonthlyRecurrenceMonthInputDisable_1(true); setMonthlyRecurrenceFSTFLValue("1");
        }
        else if (event.target.value == "Weekly") {
            setRecurringString("Every Week");
            setRecurringValue("");
            setRecurringStringOnHover("");
            setDailyRecurrenceType(""); setDailyRecurrenceValue(""); setDailyRecurrenceInputDisable(true); setMonthlyRecurrenceType(""); setMonthlyRecurrenceDayValue(""); setMonthlyRecurrenceMonthValue(""); setMonthlyRecurrenceMonthValue_1(""); setMonthlyRecurrenceWeekValue("Sunday");setMonthlyRecurrenceDayInputDisable(true); setMonthlyRecurrenceMonthInputDisable(true); setMonthlyRecurrenceMonthInputDisable_1(true); setMonthlyRecurrenceFSTFLValue("1");
        }
        else if (event.target.value == "Monthly") {
            setRecurringString("Every Month");
            setRecurringValue("");
            setRecurringStringOnHover("");
            setDailyRecurrenceType(""); setDailyRecurrenceValue(""); setDailyRecurrenceInputDisable(true); setWeeklyRecurrenceWeek(new Array(weekDays.length).fill(false)); setSelectedWeek(new Array(weekDays.length).fill(false)); 
        }
    };

    // Handle input change for daily recurrence
    const handleInputChange = (event) => {
        setDailyRecurrenceValue(event.target.value);

        if (regEx.test(event.target.value) === false) {
            displayError("Invalid input, Please enter a number");
            return;
        }

        if (parseInt(event.target.value) > 30 || parseInt(event.target.value) < 1) {
            displayError("Invalid input (should be between 1-30)");
            return;
        }

        if ((event.target.value).length == 0) {
            setRecurringValue("");
            setRecurringStringOnHover("");
            return;
        }

        if (dailyRecurrenceType === "days") {
            if (event.target.value == 1) {
                setRecurringValue("0 0 * * *");
                setRecurringStringOnHover("Occurs every day");
            } else {
                if (event.target.value != "") {
                    setRecurringValue("0 0 */" + event.target.value + " * *");
                    setRecurringStringOnHover("Occurs every " + event.target.value + " days");
                }
            }
        }
    };

    // Get the Daily recurring value i.e everyday, every weekday
    const getDailyRecurrenceType = (event) => {
        setDailyRecurrenceType(event.target.value);
        setRecurringValue("");
        setRecurringStringOnHover("");

        if (event.target.value === "weekday") {
            setRecurringValue("0 0 * * 1-5");
            setRecurringStringOnHover("Occurs every weekday");
            setDailyRecurrenceValue("");
            setDailyRecurrenceInputDisable(true);
        }
        else if (event.target.value === "days") {
            setDailyRecurrenceInputDisable(false);
        }
    };

    // Get Weekly recurrence values
    const getWeeklyRecurrenceWeeks = (position) => {
        const updatedCheckedState = weeklyRecurrenceWeek.map((item, index) =>
            index === position ? !item : item
        );

        setWeeklyRecurrenceWeek(updatedCheckedState);

        if (position === weekDays.length - 1) {
            const updatedDisableState = selectedWeek.map((item, index) =>
                (index === position && weekDays[index].name === "All") ? item : !item
            );
            setSelectedWeek(updatedDisableState);
        }
        else {
            const updatedDisableState = selectedWeek.map((item, index) =>
                (weekDays[index].name !== "All") ? item : true
            );
            setSelectedWeek(updatedDisableState);
        }

        let weekValuesString = "";
        let weekValuesOnHoverString = "";
        updatedCheckedState.map((item, index) => {
            if (item) {
                weekValuesString = weekValuesString + index.toString() + ",";
                weekValuesOnHoverString = weekValuesOnHoverString + weekDays[index].name + ",";
            }
        });

        if (weekValuesString != "") {
            weekValuesString = "0 0 * * " + weekValuesString.replace(/,\s*$/, "");
            weekValuesOnHoverString = "Occurs on every " + weekValuesOnHoverString.toLowerCase().replace(/,\s*$/, "");
            if (weekValuesOnHoverString.includes('all')) {
                weekValuesString = "0 0 * * 0,1,2,3,4,5,6";
                weekValuesOnHoverString = "Occurs every day";
            }
            setRecurringValue(weekValuesString);
            setRecurringStringOnHover(weekValuesOnHoverString);
        }
        else {
            setSelectedWeek(new Array(weekDays.length).fill(false));
            setRecurringValue(weekValuesString);
            setRecurringStringOnHover(weekValuesOnHoverString);
        }
    };

    const getMonthlyRecurrenceType = (event) => {
        setMonthlyRecurrenceType(event.target.value);
        setRecurringValue("");
        setRecurringStringOnHover("");

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
    };

    const handleDayInputChange = (event) => {
        setMonthlyRecurrenceDayValue(event.target.value);
        setMonthlyRecurrenceMonthInputDisable(false);

        if (regEx.test(event.target.value) === false) {
            displayError("Invalid input, Please enter a number");
            setMonthlyRecurrenceMonthValue("");
            setMonthlyRecurrenceMonthInputDisable(true);
            return;
        }

        if (parseInt(event.target.value) > 30 || parseInt(event.target.value) < 1) {
            displayError("Invalid input (should be between 1-30)");
            setMonthlyRecurrenceMonthValue("");
            setMonthlyRecurrenceMonthInputDisable(true);
            return;
        }

        if ((event.target.value).length == 0) {
            setRecurringValue("");
            setRecurringStringOnHover("");
            setMonthlyRecurrenceMonthValue("");
            setMonthlyRecurrenceMonthInputDisable(true);
            return;
        }
    };

    const handleMonthInputChange = (event) => {
        setMonthlyRecurrenceMonthValue(event.target.value);

        if (regEx.test(event.target.value) === false) {
            displayError("Invalid input, Please enter a number");
            return;
        }

        if (parseInt(monthlyRecurrenceDayValue) > 30 || parseInt(monthlyRecurrenceDayValue) < 1) {
            displayError("Invalid input (should be between 1-30)");
            return;
        }

        if (parseInt(event.target.value) > 12 || parseInt(event.target.value) < 1) {
            displayError("Invalid input (should be between 1-12)");
            return;
        }

        if ((monthlyRecurrenceDayValue).length == 0) {
            setRecurringValue("");
            setRecurringStringOnHover("");
            return;
        }

        if ((event.target.value).length == 0) {
            setRecurringValue("");
            setRecurringStringOnHover("");
            return;
        }

        if (monthlyRecurrenceType === "days") {
            if (monthlyRecurrenceDayValue != "") {
                setRecurringValue("0 0 " + monthlyRecurrenceDayValue + " */" + event.target.value + " *");
                if (monthlyRecurrenceDayValue == 1) {
                    setRecurringStringOnHover("Occurs on " + monthlyRecurrenceDayValue + "st day of every " + event.target.value + " month");
                }
                else if (monthlyRecurrenceDayValue == 2) {
                    setRecurringStringOnHover("Occurs on " + monthlyRecurrenceDayValue + "nd day of every " + event.target.value + " month");
                }
                else if (monthlyRecurrenceDayValue == 3) {
                    setRecurringStringOnHover("Occurs on " + monthlyRecurrenceDayValue + "rd day of every " + event.target.value + " month");
                }
                else {
                    setRecurringStringOnHover("Occurs on " + monthlyRecurrenceDayValue + "th day of every " + event.target.value + " month");
                }
            }
        }
    };

    const handleFSTFLChange = (event) => {
        setMonthlyRecurrenceFSTFLValue(event.target.value);
    };

    const handleWeekInputChange = (event) => {
        setMonthlyRecurrenceWeekValue(event.target.value);
    };

    const handleMonthInputChange_1 = (event) => {
        setMonthlyRecurrenceMonthValue_1(event.target.value);

        if (regEx.test(event.target.value) === false) {
            displayError("Invalid input, Please enter a number");
            return;
        }

        if (parseInt(event.target.value) > 12 || parseInt(event.target.value) < 1) {
            displayError("Invalid input (should be between 1-12)");
            return;
        }

        if ((event.target.value).length == 0) {
            setRecurringValue("");
            setRecurringStringOnHover("");
            return;
        }

        if (monthlyRecurrenceType === "weeks") {
            if (event.target.value != "") {
                let FSTFLValue = "";
                if (monthlyRecurrenceFSTFLValue == "1") {
                    FSTFLValue = "first";
                }
                else if (monthlyRecurrenceFSTFLValue == "2") {
                    FSTFLValue = "second";
                }
                else if (monthlyRecurrenceFSTFLValue == "3") {
                    FSTFLValue = "third";
                }
                else if (monthlyRecurrenceFSTFLValue == "4") {
                    FSTFLValue = "fourth";
                }
                else if (monthlyRecurrenceFSTFLValue == "5") {
                    FSTFLValue = "last";
                }

                if (monthlyRecurrenceWeekValue == "Sunday") {
                    setRecurringValue("0 0 * */" + event.target.value + " 0");
                    setRecurringStringOnHover("Occurs on " + FSTFLValue + " sunday of every " + event.target.value + " month");
                }
                else if (monthlyRecurrenceWeekValue == "Monday") {
                    setRecurringValue("0 0 * */" + event.target.value + " 1");
                    setRecurringStringOnHover("Occurs on " + FSTFLValue + " monday of every " + event.target.value + " month");
                }
                else if (monthlyRecurrenceWeekValue == "Tuesday") {
                    setRecurringValue("0 0 * */" + event.target.value + " 2");
                    setRecurringStringOnHover("Occurs on " + FSTFLValue + " tuesday of every " + event.target.value + " month");
                }
                else if (monthlyRecurrenceWeekValue == "Wednesday") {
                    setRecurringValue("0 0 * */" + event.target.value + " 3");
                    setRecurringStringOnHover("Occurs on " + FSTFLValue + " wednesday of every " + event.target.value + " month");
                }
                else if (monthlyRecurrenceWeekValue == "Thursday") {
                    setRecurringValue("0 0 * */" + event.target.value + " 4");
                    setRecurringStringOnHover("Occurs on " + FSTFLValue + " thursday of every " + event.target.value + " month");
                }
                else if (monthlyRecurrenceWeekValue == "Friday") {
                    setRecurringValue("0 0 * */" + event.target.value + " 5");
                    setRecurringStringOnHover("Occurs on " + FSTFLValue + " friday of every " + event.target.value + " month");
                }
                else if (monthlyRecurrenceWeekValue == "Saturday") {
                    setRecurringValue("0 0 * */" + event.target.value + " 6");
                    setRecurringStringOnHover("Occurs on " + FSTFLValue + " saturday of every " + event.target.value + " month");
                }
            }
        }
    };

    return (
        <ClickAwayListener className={"recurrence-time-container " + (classTimer ? " " + classTimer : "")} onClickAway={() => { setShowRecurrence(false); }} as="span" >
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
                            {recurrenceType && recurrenceType != "One Time" &&
                                <div className="recurrence-content">
                                    {recurrenceType === "Daily" && (
                                        <div className="daily-recurrence-list">
                                            <lable>
                                                <input type="radio" value="days" checked={dailyRecurrenceType === "days"} onChange={getDailyRecurrenceType} />
                                                <span>
                                                    &nbsp;&nbsp;&nbsp;&nbsp;Every
                                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                                    <input className={"recur-textbox " + ((parseInt(dailyRecurrenceValue) > 30 || parseInt(dailyRecurrenceValue) < 1) ? "s__err-Border" : "")} type="text" size="1" disabled={(dailyRecurrenceInputDisable) ? "disabled" : ""} value={dailyRecurrenceValue} onInput={handleInputChange} />
                                                    &nbsp;&nbsp;&nbsp;&nbsp;day(s).
                                                </span>
                                            </lable>

                                            <lable>
                                                <input type="radio" value="weekday" checked={dailyRecurrenceType === "weekday"} onChange={getDailyRecurrenceType} />
                                                <span>&nbsp;&nbsp;&nbsp;&nbsp;Every weekday.</span>
                                            </lable>
                                        </div>
                                    )}
                                    {recurrenceType === "Weekly" && (
                                        <div className="weekly-recurrence-list">
                                            <span>
                                                Recur every week on:
                                            </span>
                                            <div className="weeks">
                                                {weekDays.map(({ name }, index) => {
                                                    return (
                                                        <div className="weeks-child">
                                                            <lable>
                                                                <input type="checkbox" name={name} value={name} disabled={selectedWeek[index]} checked={weeklyRecurrenceWeek[index]} onChange={() => getWeeklyRecurrenceWeeks(index)} />
                                                                <span> {name}</span>
                                                            </lable>
                                                        </div>
                                                    );
                                                })}
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
                                                    <input className={"recur-textbox " + ((parseInt(monthlyRecurrenceDayValue) > 30 || parseInt(monthlyRecurrenceDayValue) < 1) ? "s__err-Border" : "")} type="text" size="1" disabled={(monthlyRecurrenceDayInputDisable) ? "disabled" : ""} value={monthlyRecurrenceDayValue} onInput={handleDayInputChange} />
                                                    &nbsp;&nbsp;&nbsp;&nbsp;of every
                                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                                    <input className={"recur-textbox " + ((parseInt(monthlyRecurrenceMonthValue) > 12 || parseInt(monthlyRecurrenceMonthValue) < 1) ? "s__err-Border" : "")} type="text" size="1" disabled={(monthlyRecurrenceMonthInputDisable) ? "disabled" : ""} value={monthlyRecurrenceMonthValue} onInput={handleMonthInputChange} />
                                                    &nbsp;&nbsp;&nbsp;&nbsp;month(s).
                                                </span>
                                            </lable>
                                            <lable>
                                                <input type="radio" value="weeks" checked={monthlyRecurrenceType === "weeks"} onChange={getMonthlyRecurrenceType} />
                                                <span>
                                                    &nbsp;&nbsp;&nbsp;&nbsp;The&nbsp;&nbsp;&nbsp;&nbsp;
                                                    <select name="month_day" id="month_day" value={monthlyRecurrenceFSTFLValue} onChange={handleFSTFLChange}>
                                                        <option value="1">
                                                            First
                                                        </option>
                                                        <option value="2">
                                                            Second
                                                        </option>
                                                        <option value="3">
                                                            Third
                                                        </option>
                                                        <option value="4">
                                                            Fourth
                                                        </option>
                                                        <option value="5">
                                                            Last
                                                        </option>
                                                    </select>
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
                                                    <input className={"recur-textbox " + ((parseInt(monthlyRecurrenceMonthValue_1) > 12 || parseInt(monthlyRecurrenceMonthValue_1) < 1) ? "s__err-Border" : "")} type="text" size="1" disabled={(monthlyRecurrenceMonthInputDisable_1) ? "disabled" : ""} value={monthlyRecurrenceMonthValue_1} onInput={handleMonthInputChange_1} />
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
                <img className={"timepickerIconToken" + (disabled ? " disabled" : "")} src={"static/imgs/ic-timepicker.png"} alt="timepicker" onClick={openRecurrenceScreen} />
            </div>
        </ClickAwayListener>
    );
};

export default RecurrenceComp;