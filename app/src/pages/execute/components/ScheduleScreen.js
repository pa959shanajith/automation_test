import { useEffect, useState } from "react";
import { Tree } from "primereact/tree";
import { RadioButton } from "primereact/radiobutton";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { scheduleMonths, schedulePeriod, scheduleWeek, scheduleWeeks } from "../../utility/mockData";
import "../styles/ScheduleScreen.scss";
import ExecutionCard from "./ExecutionCard";
import AvoDropdown from "../../../globalComponents/AvoDropdown";

const ScheduleScreen = ({ cardData }) => {
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedDaily, setSelectedDaily] = useState(null);
  const [selectedMonthly, setSelectedMonthly] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [scheduleNodes, setScheduleNodes] = useState(null);
  const [dropdownWeek, setDropdownWeek] = useState(null);
  const [dropdownDay, setDropdownDay] = useState(null);

  const scheduleDaily = [
    { name: <span>Every <InputText className="every_day" /> day(s).</span>, key: 'day' },
    { name: 'Every Weekday.', key: 'weekend' },
  ];
  const scheduleMonthly = [
    {
      name: (
        <span>
          Day <InputText className="every_day" /> of every{" "}
          <InputText className="every_day" /> month(s).
        </span>
      ),
      key: "daymonth",
    },
    {
      name: (
        <span className="day_week">
          The{" "}
          <AvoDropdown
            dropdownValue={dropdownWeek}
            onDropdownChange={(e) => setDropdownWeek(e.value)}
            dropdownOptions={scheduleMonths}
            name="scheduleweeek"
            placeholder="Select Value"
            required={false}
            customeClass="dropdown_week"
          />{" "}
          <AvoDropdown
            dropdownValue={dropdownDay}
            onDropdownChange={(e) => setDropdownDay(e.value)}
            dropdownOptions={scheduleWeek}
            name="scheduleday"
            placeholder="Select Day"
            required={false}
            customeClass="dropdown_day"
          />{" "}
          of every <InputText className="every_day" /> month(s).
        </span>
      ),
      key: "dayweek",
    },
  ];

  const onRecurrenceClick = () => {
    let recurrenceObj = {
      OT: <></>,
      DY: (
        <div className="col-12 lg:col-9 xl:col-9 md:col-8 sm:col-6 dailyContainer">
          {scheduleDaily.map((el) => (
            <div key={el?.key} className="radioBtndaily">
              <RadioButton
                inputId={el?.key}
                name="daily"
                value={el}
                onChange={(e) => setSelectedDaily(e.value)}
                checked={selectedDaily?.key === el?.key}
              />
              <label htmlFor={el?.key} className="ml-2">
                {el?.name}
              </label>
            </div>
          ))}
        </div>
      ),
      WY: (
        <div className="col-12 lg:col-9 xl:col-9 md:col-8 sm:col-6 flex flex-wrap">
          <div>
            Recur every <InputText /> week(s) on:
          </div>
          <div className="flex flex-wrap">
            {scheduleWeeks.map((el) => (
              <div key={el?.key} className="checkbox_padding">
                <Checkbox
                  inputId={el?.key}
                  name="daily"
                  value={el}
                  onChange={(e) => setSelectedDaily(e.value)}
                  checked={selectedDaily?.key === el?.key}
                />
                <label htmlFor={el?.key} className="ml-2">
                  {el?.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      ),
      MY: (
        <div className="col-12 lg:col-9 xl:col-9 md:col-8 sm:col-6 dailyContainer">
          {scheduleMonthly.map((el) => (
            <div key={el?.key} className="radioBtndaily">
              <RadioButton
                inputId={el?.key}
                name="daily"
                value={el}
                onChange={(e) => setSelectedMonthly(e.value)}
                checked={selectedMonthly?.key === el?.key}
              />
              <label htmlFor={el?.key} className="ml-2">
                {el?.name}
              </label>
            </div>
          ))}
        </div>
      ),
    };
    return recurrenceObj[selectedSchedule?.key];
  };

  return (
    <>
      <ExecutionCard cardData={cardData} />
      <div className="schedule_container">
        <div className="grid">
          <div className="col-12 lg:col-5 xl:col-5 md:col-6 sm:col-12">
            <Calendar
              value={startDate}
              placeholder="Enter Start date"
              onChange={(e) => setStartDate(e.value)}
              icon="pi pi-fw pi-angle-down"
              showIcon
            />
          </div>
          <div className="col-12 lg:col-5 xl:col-5 md:col-6 sm:col-12">
            <Calendar
              value={startTime}
              placeholder="Enter Start Time "
              onChange={(e) => setStartTime(e.value)}
              icon="pi pi-fw pi-angle-down"
              showIcon
              timeOnly
            />
          </div>
          <div className="col-12 lg:col-5 xl:col-5 md:col-6 sm:col-12">
            <Calendar
              value={endDate}
              placeholder="Enter End Date"
              onChange={(e) => setEndDate(e.value)}
              icon="pi pi-fw pi-angle-down"
              showIcon
            />
          </div>
          <div className="col-12 lg:col-5 xl:col-5 md:col-6 sm:col-12">
            <Calendar
              value={endTime}
              placeholder="Enter End Time"
              onChange={(e) => setEndTime(e.value)}
              icon="pi pi-fw pi-angle-down"
              showIcon
              timeOnly
            />
          </div>
        </div>
        <div className="grid">
          <div className="col-12">Recurrence Pattern</div>
          <div
            className={`col-12 lg:col-3 xl:col-3 md:col-4 sm:col-6 ${
              selectedSchedule?.key !== "OT" && selectedSchedule?.key
                ? "with_border"
                : "without_border"
            }`}
          >
            {schedulePeriod.map((el) => (
              <div key={el?.key} className="radioBtn">
                <RadioButton
                  inputId={el?.key}
                  name="schedule"
                  value={el}
                  onChange={(e) => setSelectedSchedule(e.value)}
                  checked={selectedSchedule?.key === el?.key}
                />
                <label htmlFor={el?.key} className="ml-2">
                  {el?.name}
                </label>
              </div>
            ))}
          </div>
          {onRecurrenceClick()}
        </div>
      </div>
    </>
  );
};

export default ScheduleScreen;
