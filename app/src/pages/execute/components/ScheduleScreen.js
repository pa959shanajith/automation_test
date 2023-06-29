import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RadioButton } from "primereact/radiobutton";
import { OverlayPanel } from 'primereact/overlaypanel';
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Button } from 'primereact/button';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { TabPanel, TabView } from "primereact/tabview";
import "../styles/ScheduleScreen.scss";
import ExecutionCard from "./ExecutionCard";
import AvoDropdown from "../../../globalComponents/AvoDropdown";
import { getScheduledDetails_ICE } from "../configureSetupSlice";
import { scheduleMonths, schedulePeriod, scheduleWeek, scheduleWeeks } from "../../utility/mockData";
import AvoInput from "../../../globalComponents/AvoInput";

const ScheduleScreen = ({ cardData, startDate, setStartDate, selectedPattren, setSelectedPattren }) => {
  const [selectedDaily, setSelectedDaily] = useState(null);
  const [selectedMonthly, setSelectedMonthly] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [dropdownWeek, setDropdownWeek] = useState(null);
  const [dropdownDay, setDropdownDay] = useState(null);
  const [tableFilter, setTableFilter] = useState("");
  const getScheduledList = useSelector((store) => store.configsetup);
  const dispatch = useDispatch();

  const recurrance = useRef(null);

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
        <div className="col-12 lg:col-9 xl:col-9 md:col-8 sm:col-6 flex flex-wrap flex-column">
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
    return recurrenceObj[selectedPattren?.key];
  };

  useEffect(() => {
    dispatch(
      getScheduledDetails_ICE({
        param: "getScheduledDetails_ICE",
        configKey: cardData?.configurekey,
        configName: cardData?.configurename,
      })
    );
  }, []);

  return (
    <>
      <ExecutionCard cardData={cardData} />
      <div className="schedule_container">
        <div className="grid" style={{ marginBottom: "-2rem" }}>
          <div className="col-12 lg:col-4 xl:col-4 md:col-6 sm:col-12">
            <Button
              icon="pi pi-sync"
              label={
                selectedPattren?.key ? selectedPattren?.name : "Make Recurring"
              }
              onClick={(e) => recurrance.current.toggle(e)}
              iconPos="right"
              severity="info"
              className="make_recurring"
            />
            <OverlayPanel ref={recurrance} className="recurrence_container">
              <div className="grid">
                <div className="col-12">Recurrence Pattern</div>
                <div
                  className={`${
                    selectedPattren?.key
                      ? "with_border col-12 lg:col-3 xl:col-3 md:col-4 sm:col-6 "
                      : "without_border col-12"
                  }`}
                >
                  {schedulePeriod.map((el) => (
                    <div key={el?.key} className="radioBtn">
                      <RadioButton
                        inputId={el?.key}
                        name="schedule"
                        value={el}
                        onChange={(e) => setSelectedPattren(e.value)}
                        checked={selectedPattren?.key === el?.key}
                      />
                      <label htmlFor={el?.key} className="ml-2">
                        {el?.name}
                      </label>
                    </div>
                  ))}
                </div>
                {onRecurrenceClick()}
                <div className="col-12">
                  <Calendar
                    value={startDate}
                    placeholder="Enter Start date"
                    onChange={(e) => setStartDate(e.value)}
                    showIcon
                  />
                </div>
              </div>
            </OverlayPanel>
          </div>
          <div className="col-12 lg:col-4 xl:col-4 md:col-6 sm:col-12">
            <Calendar
              value={startDate}
              placeholder="Enter Start date"
              onChange={(e) => setStartDate(e.value)}
              showIcon
            />
          </div>
          <div className="col-12 lg:col-4 xl:col-4 md:col-6 sm:col-12">
            <Calendar
              value={startTime}
              placeholder="Enter Start Time "
              onChange={(e) => setStartTime(e.value)}
              icon="pi pi-fw pi-clock"
              showIcon
              timeOnly
            />
          </div>
        </div>
        <AvoInput
          icon="pi pi-search"
          placeholder="Search"
          inputTxt={tableFilter}
          setInputTxt={setTableFilter}
          inputType="searchIcon"
        />
        <TabView>
          <TabPanel header="Scheduled Taks">
            <DataTable
              value={getScheduledList?.scheduledList}
              tableStyle={{ minWidth: "50rem" }}
              globalFilter={tableFilter}
            >
              <Column field="scheduledon" header="Date & Time"></Column>
              <Column field="target" header="Host"></Column>
              <Column field="recurringpattern" header="Schedule Type"></Column>
              <Column field="status" header="Status"></Column>
            </DataTable>
          </TabPanel>
          <TabPanel header="Recurring Taks">
            <DataTable
              value={getScheduledList?.scheduledList}
              tableStyle={{ minWidth: "50rem" }}
              globalFilter={tableFilter}
            >
              <Column field="scheduledon" header="Date & Time"></Column>
              <Column field="target" header="Host"></Column>
              <Column field="recurringpattern" header="Schedule Type"></Column>
              <Column field="status" header="Status"></Column>
            </DataTable>
          </TabPanel>
        </TabView>
      </div>
    </>
  );
};

export default ScheduleScreen;
