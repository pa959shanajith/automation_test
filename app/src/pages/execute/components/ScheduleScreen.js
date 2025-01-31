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
import { Link } from "react-router-dom";
import "../styles/ScheduleScreen.scss";
import ExecutionCard from "./ExecutionCard";
import AvoDropdown from "../../../globalComponents/AvoDropdown";
import { cancelScheduledJob_ICE, getScheduledDetailsOnDate_ICE, getScheduledDetails_ICE } from "../configureSetupSlice";
import { endMonths, scheduleMonths, schedulePeriod, scheduleWeek, scheduleWeeks, statusDetails } from "../../utility/mockData";
import AvoInput from "../../../globalComponents/AvoInput";
import AvoModal from "../../../globalComponents/AvoModal";
import { Toast } from "primereact/toast";
import { Tooltip } from 'primereact/tooltip';
import { Dropdown } from "primereact/dropdown";

const ScheduleScreen = ({
  cardData,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  recurEvery,
  setRecurEvery,
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
  const [selectedType, setSelectedType] = useState("");
  const [filterStatus, setFilterStatus] = useState({ name: "", code: "" },);
  const getScheduledList = useSelector((store) => store.configsetup);
  const dispatch = useDispatch();
  const duplicateinfo = useRef(null);

  const recurrance = useRef(null);
  const statusfilter = useRef(null);

  const scheduleDaily = [
    {
      name: (
        <span>
          Every{" "}
          <InputText
            title="Enter after every how many number of day(s) you wish it to recur."
            className="every_day"
            name="everyday"
            value={scheduleOption?.everyday}
            onChange={(e) => onScheduleChange(e)}
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
          <InputText
            className="every_day"
            name="monthweek"
            title=" Enter on which day of the month you wish it to recur."
            // value={scheduleOption.monthweek}
            value={scheduleOption?.monthweek}
            onChange={(e) => onScheduleChange(e)}
            disabled={selectedMonthly?.key !== "daymonth"}
          />{" "}
          of every{" "}
          <InputText
            className="every_day"
            name="monthday"
            title=" Enter after every how many month(s) you wish it to recur."
            // value={scheduleOption.monthday}
            value={scheduleOption?.monthday}
            onChange={(e) => {
              onScheduleChange(e)}}
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
          <InputText
            className="every_day"
            name="everymonth"
            title=" Enter after every how many month(s) you wish it to recur."
            value={scheduleOption?.everymonth}
            onChange={(e) => onScheduleChange(e)}
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
            Recur every <InputText title="Enter after every how many week(s) you wish it to recur" value={recurEvery} onChange={(e) => setRecurEvery(e.target.value)} keyfilter={/^[0-9]+$/} /> week(s) on:
          </div>
          <div className="flex flex-wrap">
            {scheduleWeeks.map((el) => (
              <div key={el?.key} className="checkbox_padding">
                <Checkbox
                  inputId={el?.key}
                  name="daily"
                  value={el}
                  onChange={onWeekChange}
                  disabled={checkDisable && ((selectedWeek.map((item) => item?.key).includes("ALL")) && (el?.key !== "ALL"))}
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

  useEffect(() => {
    if(getScheduledList?.scheduledStatus?.status === "booked"){
      duplicateinfo?.current?.show({ severity: 'error', summary: 'Error', detail: `Schedule time is matching for test suites scheduled ${getScheduledList?.scheduledStatus?.user}` });
    }
  }, [getScheduledList?.scheduledStatus]);

  const onScheduleStatus = (getStatus) => {
    setSelectedType(getStatus?.status);
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
    {
      duplicateinfo?.current?.show({ severity: 'success', summary: 'Success', detail: "Scheduled item has been deleted successfully", life: 5000 });
      dispatch(
        getScheduledDetails_ICE({
          param: "getScheduledDetails_ICE",
          configKey: cardData?.configurekey,
          configName: cardData?.configurename,
        })
      )
    }
    );
  };

  return (
    <>
      <ExecutionCard cardData={cardData} configData={getScheduledList} />
      <div className="schedule_container">
        <div className="grid schedule_options">
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
            <OverlayPanel ref={statusfilter} className="recurrence_container">
              <Dropdown
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.value)}
                options={statusDetails}
                optionLabel="name"
                placeholder="Select status"
                className="w-full md:w-14rem"
              />
            </OverlayPanel>
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
                          setStartTime(new Date(Date.now() + (6 * 60 * 1000)));
                          setStartDate(null);
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
                    required={true}
                    customeClass="dropdown_enddate"
                  />
                </div>
              </div>
            </OverlayPanel>
          </div>
          <div className="col-12 lg:col-3 xl:col-3 md:col-6 sm:col-12">
            <Calendar
              value={startDate}
              placeholder="Enter Start date"
              onChange={(e) => {
                setStartDate(e.value);
                setStartTime(new Date(Date.now() + (6 * 60 * 1000)));
              }}
              disabled={selectedPattren?.key}
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
                [...getScheduledList?.scheduledList]
                  ?.reverse()
                  .filter((el) => el?.recurringpattern === "One Time")
                  .filter((el) =>
                    filterStatus?.name && filterStatus?.name !== "Show All"
                      ? el.status.toLowerCase() ===
                        filterStatus?.name.toLowerCase()
                      : el
                  )
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
                        {el.status === "recurring" ||
                        el.status === "scheduled" ? (
                          <span
                            className="pi pi-trash"
                            onClick={(e) => handleCancel(e, el)}
                          ></span>
                        ) : null}
                        <Tooltip
                          target=".pi-trash"
                          position="bottom"
                          content="Click here to delete this scheduled execution."
                        />
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
                header=" Recurrence Type"
              ></Column>
              <Column
                align="center"
                field="endafter"
                header="End After"
              ></Column>
              <Column
                align="center"
                field="status"
                header={
                  <span>
                    Status
                    <span
                      className="pi pi-filter"
                      title="Filter Status"
                      onClick={(e) => statusfilter.current.toggle(e)}
                    ></span>
                  </span>
                }
              ></Column>
            </DataTable>
          </TabPanel>
          <TabPanel header="Recurring Tasks">
            <DataTable
              value={
                Array.isArray(getScheduledList?.scheduledList) &&
                [...getScheduledList?.scheduledList]
                  ?.reverse()
                  .filter((el) => el?.recurringpattern !== "One Time")
                  .filter((el) =>
                    filterStatus?.name && filterStatus?.name !== "Show All"
                      ? el.status.toLowerCase() ===
                        filterStatus?.name.toLowerCase()
                      : el
                  )
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
                        {el.status === "recurring" ||
                        el.status === "scheduled" ? (
                          <span
                            className="pi pi-trash"
                            onClick={(e) => handleCancel(e, el)}
                          ></span>
                        ) : null}
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
                header=" Recurrence Type"
              ></Column>
              <Column
                align="center"
                field="endafter"
                header="End After"
              ></Column>
              <Column
                align="center"
                field="status"
                header={
                  <span>
                    Status
                    <span
                      className="pi pi-filter"
                      title="Filter Status"
                      onClick={(e) => statusfilter.current.toggle(e)}
                    ></span>
                  </span>
                }
              ></Column>
            </DataTable>
          </TabPanel>
        </TabView>
      </div>
      <Toast ref={duplicateinfo} position="bottom-center" />
      <AvoModal
        visible={exestatus}
        setVisible={setExestatus}
        onhide={exestatus}
        onModalBtnClick={onStatusBtnClick}
        content={
          <DataTable
            value={getScheduledList?.scheduledStatusList.map((list) =>
              list?.scenariodetails.map((details, ind) =>
                details.map((scenarios) => ({
                  testsuitename: list?.testsuitenames[ind],
                  scenariodetail: scenarios?.scenarioName,
                  status: list?.status,
                })
                )
              )
            ).flat(2).filter((val) => val.status === selectedType )}
            tableStyle={{ minWidth: "50rem" }}
            globalFilter={tableFilter}
          >
            <Column
              align="center"
              field="testsuitename"
              header="Test Suite"
            ></Column>
            <Column
              align="center"
              field="scenariodetail"
              header="Test case Name"
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
