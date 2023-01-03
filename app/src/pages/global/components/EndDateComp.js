import React, { useState, useEffect } from 'react';
import ClickAwayListener from 'react-click-away-listener';
import '../styles/EndDateComp.scss';

const EndDateComp = (props) => {

    const [showEndDate, setShowEndDate] = useState(false);
    const [endAfter, setEndAfetr] = useState('');

    const placeholder = props.placeholder;
    const classname = props.classname;
    const readonly = props.readonly;
    const disabled = props.disabled;
    const title = props.title;
    const endAfterValue = props.endAfterValue;
    const setEndAfterValue = props.setEndAfterValue;

    const openEndDate = () => {
        if (disabled) {
            return;
        }
        setShowEndDate(true);
    }

    return(
        <ClickAwayListener className="recurrence-time-container schedule_timer" onClickAway={() => { setShowEndDate(false)}} as="span">
            <div className="rdt rdtOpen">
                <input type="text" className={classname} placeholder={placeholder} readOnly={readonly} disabled={disabled} title={title ? title : "Select End After"} value={endAfterValue} />
                { showEndDate && (<div className="main-container rdtPicker">
                    <select name="select_end_after" id="select_end_after" onChange={(event) => {setEndAfetr(event.target.value); setEndAfterValue(event.target.value); setShowEndDate(false)}}>
                        <option disabled selected value> -- select an option -- </option>
                        <option value="1 Month">1 Month</option>
                        <option value="3 Months">3 Months</option>
                        <option value="6 Months">6 Months</option>
                        <option value="9 Months">9 Months</option>
                    </select>
                </div>) }
            </div>
            <img className={"timepickerIconToken" + (disabled ? " disabled" : "")} src={"static/imgs/ic-datepicker.png"} alt="recurring" onClick={openEndDate} />
        </ClickAwayListener>
    )

}

export default EndDateComp;