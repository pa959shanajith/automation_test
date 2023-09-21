import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RadioButton } from "primereact/radiobutton";
import { OverlayPanel } from 'primereact/overlaypanel';
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from "primereact/checkbox";
import { Button } from 'primereact/button';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { TabPanel, TabView } from "primereact/tabview";
import { Link } from "react-router-dom";
import "../styles/ScheduleScreen.scss";
import ExecutionCard from "./ExecutionCard";
import AvoDropdown from "../../../globalComponents/AvoDropdown";
import { cancelScheduledJob_ICE, getScheduledDetailsOnDate_ICE, getScheduledDetails_ICE } from "../configureSetupSlice";
import { endMonths, scheduleMonths, schedulePeriod, scheduleWeek, scheduleWeeks } from "../../utility/mockData";
import AvoInput from "../../../globalComponents/AvoInput";
import AvoModal from "../../../globalComponents/AvoModal";

const ScheduleScreen = ({
  cardData,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  startTime,
  setStartTime,
  selectedPattren,
  setSelectedPattren,
  isDisabled,
  onSchedule,
  selectedDaily,
  selectedMonthly,
  dropdownWeek,
  dropdownDay,
  setSelectedDaily,
  setSelectedMonthly,
  setDropdownWeek,
  setDropdownDay,
  scheduleOption,
  onScheduleChange,
  selectedWeek,
  onWeekChange,
  checkDisable
}) => {
  const [tableFilter, setTableFilter] = useState("");
  const [exestatus, setExestatus] = useState("");
  const getScheduledList = useSelector((store) => store.configsetup);
  const dispatch = useDispatch();

  const recurrance = useRef(null);

  const scheduleDaily = [
    {
      name: (
        <span>
          Every{" "}
          <InputNumber
            title="Enter after every how many number of day(s) you wish it to recur."
            className="every_day"
            name="everyday"
            value={scheduleOption?.everyday}
            onValueChange={(e) => onScheduleChange(e)}
            disabled={selectedDaily?.key !== "day"}
          />{" "}
          day(s).
        </span>
      ),
      key: "day",
    },
    { name: "Every Weekday.", key: "weekend" },
  ];
  const scheduleMonthly = [
    {
      name: (
        <span>
          Day{" "}
          <InputNumber
            className="every_day"
            name="monthweek"
            title=" Enter on which day of the month you wish it to recur."
            // value={scheduleOption.monthweek}
            value={scheduleOption?.monthweek}
            onValueChange={(e) => onScheduleChange(e)}
            disabled={selectedMonthly?.key !== "daymonth"}
          />{" "}
          of every{" "}
          <InputNumber
            className="every_day"
            name="monthday"
            title=" Enter after every how many month(s) you wish it to recur."
            // value={scheduleOption.monthday}
            value={scheduleOption?.monthday}
            onValueChange={(e) => onScheduleChange(e)}
            disabled={selectedMonthly?.key !== "daymonth"}
          />{" "}
          month(s).
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
            disabled={selectedMonthly?.key !== "dayweek"}
          />{" "}
          <AvoDropdown
            dropdownValue={dropdownDay}
            onDropdownChange={(e) => setDropdownDay(e.value)}
            dropdownOptions={scheduleWeek}
            name="scheduleday"
            placeholder="Select day"
            required={false}
            customeClass="dropdown_day"
            disabled={selectedMonthly?.key !== "dayweek"}
          />{" "}
          of every{" "}
          <InputNumber
            className="every_day"
            name="everymonth"
            title=" Enter after every how many month(s) you wish it to recur."
            value={scheduleOption?.everymonth}
            onValueChange={(e) => onScheduleChange(e)}
            disabled={selectedMonthly?.key !== "dayweek"}
          />{" "}
          month(s).
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
            Recur every <InputText title="Enter after every how many week(s) you wish it to recur" /> week(s) on:
          </div>
          <div className="flex flex-wrap">
            {scheduleWeeks.map((el) => (
              <div key={el?.key} className="checkbox_padding">
                <Checkbox
                  inputId={el?.key}
                  name="daily"
                  value={el}
                  onChange={onWeekChange}
                  disabled={checkDisable}
                  checked={selectedWeek.some((item) => item.key === el.key)}
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

  const onScheduleStatus = (getStatus) => {
    dispatch(
      getScheduledDetailsOnDate_ICE({
        param: "getScheduledDetails_ICE",
        configKey: getStatus?.configurekey,
        configName: getStatus?.configurename,
        scheduledDate: getStatus?.scheduledon
      })
    );
    setExestatus(true);
  };

  const onStatusBtnClick = () => {
    setExestatus(false);
  }

  const handleCancel = (getItem, getValue) => {
    const dt = new Date(getValue?.scheduledon);
    dispatch(
      cancelScheduledJob_ICE({
        param: "cancelScheduledJob_ICE",
        schDetails: {
          cycleid: getValue?.cycleid ? getValue?.cycleid : "",
          scheduledatetime:
            dt.getFullYear() +
            "-" +
            ("0" + (dt.getMonth() + 1)).slice(-2) +
            "-" +
            ("0" + dt.getDate()).slice(-2) +
            " " +
            ("0" + dt.getHours()).slice(-2) +
            ":" +
            ("0" + dt.getMinutes()).slice(-2),
          scheduleid: getValue?._id,
        },
        host:
          getValue?.schedulethrough === "client"
            ? getValue?.target
            : getValue?.schedulethrough,
        schedUserid: JSON.stringify(getValue?.scheduledby),
      })
    ).then(() =>
      dispatch(
        getScheduledDetails_ICE({
          param: "getScheduledDetails_ICE",
          configKey: cardData?.configurekey,
          configName: cardData?.configurename,
        })
      )
    );
  };

  return (
    <>
      <ExecutionCard cardData={cardData} />
      <div className="schedule_container">
        <div className="grid schedule_options">
          <div className="col-12 lg:col-3 xl:col-3 md:col-6 sm:col-12">
            <Calendar
              value={startDate}
              placeholder="Enter Start date"
              onChange={(e) => {
                setStartDate(e.value);
                setStartTime(new Date());
              }}
              // disabled={selectedPattren?.key}
              minDate={new Date()}
              showIcon
            />
          </div>
          <div className="col-12 lg:col-3 xl:col-3 md:col-6 sm:col-12">
            <Calendar
              value={startTime}
              placeholder="Enter Start Time "
              onChange={(e) => setStartTime(e.value)}
              icon="pi pi-fw pi-clock"
              showIcon
              timeOnly
            />
          </div>
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
                        onChange={(e) => {
                          setStartTime(new Date());
                          // setStartDate(null);
                          setSelectedPattren(e.value);
                        }}
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
                  <AvoDropdown
                    dropdownValue={endDate}
                    onDropdownChange={(e) => setEndDate(e.value)}
                    dropdownOptions={endMonths}
                    name="endmonth"
                    placeholder="End After"
                    required={false}
                    customeClass="dropdown_enddate"
                  />
                </div>
              </div>
            </OverlayPanel>
          </div>
          <div className="col-12 lg:col-2 xl:col-2 md:col-6 sm:col-12 flex justify-content-end">
            <Button
              className="schedule_btn"
              onClick={() => onSchedule("Schedule")}
              disabled={isDisabled}
              label="Schedule"
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
          <TabPanel header="Scheduled Tasks">
            <DataTable
              value={
                Array.isArray(getScheduledList?.scheduledList) &&
                getScheduledList?.scheduledList
                  ?.filter((el) => el?.status !== "recurring")
                  .map((el) => ({
                    ...el,
                    scheduledon: `${new Date(
                      el.scheduledon
                    ).toLocaleDateString()}, ${el.time}`,
                    endafter: el.endafter ? el.endafter : "-",
                    status: (
                      <div className="flex align-items-center justify-content-evenly">
                        <Link onClick={() => onScheduleStatus(el)}>
                          {el.status}
                        </Link>
                        {(el.status === "recurring" || el.status === "scheduled") ? <span className="pi pi-trash" onClick={(e) => handleCancel(e, el)}></span> : null }
                      </div>
                    ),
                    target:
                      el.schedulethrough === "client"
                        ? el.target
                        : el.schedulethrough,
                  }))
              }
              tableStyle={{ minWidth: "50rem" }}
              globalFilter={tableFilter}
            >
              <Column
                align="center"
                field="scheduledon"
                header="Start Date & Time"
              ></Column>
              <Column
                align="center"
                field="target"
                header="Environment"
              ></Column>
              <Column
                align="center"
                field="scheduletype"
                header="Recurrance Type"
              ></Column>
              <Column
                align="center"
                field="endafter"
                header="End After"
              ></Column>
              <Column align="center" field="status" header="Status"></Column>
            </DataTable>
          </TabPanel>
          <TabPanel header="Recurring Tasks">
            <DataTable
              value={
                Array.isArray(getScheduledList?.scheduledList) &&
                getScheduledList?.scheduledList
                  ?.filter((el) => el?.status === "recurring")
                  .map((el) => ({
                    ...el,
                    scheduledon: `${new Date(
                      el.scheduledon
                    ).toLocaleDateString()}, ${el.time}`,
                    endafter: el.endafter ? el.endafter : "-",
                    status: (
                      <div className="flex align-items-center justify-content-evenly">
                        <Link onClick={() => onScheduleStatus(el)}>
                          {el.status}
                        </Link>
                        {(el.status === "recurring" || el.status === "scheduled") ? <span className="pi pi-trash" onClick={(e) => handleCancel(e, el)}></span> : null }
                      </div>
                    ),
                    target:
                      el.schedulethrough === "client"
                        ? el.target
                        : el.schedulethrough,
                  }))
              }
              tableStyle={{ minWidth: "50rem" }}
              globalFilter={tableFilter}
            >
              <Column
                align="center"
                field="scheduledon"
                header="Start Date & Time"
              ></Column>
              <Column
                align="center"
                field="target"
                header="Envrionment"
              ></Column>
              <Column
                align="center"
                field="scheduletype"
                header="Recurrance Type"
              ></Column>
              <Column
                align="center"
                field="endafter"
                header="End After"
              ></Column>
              <Column align="center" field="status" header="Status"></Column>
            </DataTable>
          </TabPanel>
        </TabView>
      </div>
      <AvoModal
        visible={exestatus}
        setVisible={setExestatus}
        onhide={exestatus}
        onModalBtnClick={onStatusBtnClick}
        content={
          <DataTable
            value={getScheduledList?.scheduledStatusList.map((el) => ({
              ...el,
              scenariodetails: "Test_Scenario12",
              testsuitenames: "",
            }))}
            tableStyle={{ minWidth: "50rem" }}
            globalFilter={tableFilter}
          >
            <Column
              align="center"
              field="testsuitenames"
              header="Test Suite"
            ></Column>
            <Column
              align="center"
              field="scenariodetails"
              header="Testcase Name"
            ></Column>
            <Column align="center" field="status" header="Status"></Column>
          </DataTable>
        }
        headerTxt="Execution Status"
        modalSytle={{ width: "50vw", background: "#FFFFFF", height: "85%" }}
      />
    </>
  );
};

export default ScheduleScreen;
