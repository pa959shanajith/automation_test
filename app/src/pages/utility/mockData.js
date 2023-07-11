export const configTableHead = [
  {
    id: 1,
    field: "name",
    code: "Name",
  },
  {
    id: 2,
    field: "dataParameterization",
    code: "Data Parameterization",
  },
  {
    id: 3,
    field: "condition",
    code: "Condition",
  },
  {
    id: 4,
    field: "accessibility",
    code: "Accessibility",
  },
];

export const conditions = [
  { name: "True", code: "T" },
  { name: "False", code: "F" },
];

export const accessibilities = [
  { title: "method A", value: "A", name: "A" },
  { title: "method AA", value: "AA", name: "AA" },
  { title: "method AAA", value: "AAA", name: "AAA" },
  { title: "Aria", value: "aria", name: "Aria" },
  { title: "method 508", value: "508", name: "Section 508" },
  {
    title: "method Best Practice",
    value: "Best Practice",
    name: "Best Practice",
  },
];

export const browsers = [
  {
    data: {
      icon: "chrome",
    },
    key: "1",
    name: "Google Chrome",
  },
  {
    data: {
      icon: "safari",
    },
    key: "safari",
    name: "Safari",
    disabled: true,
  },
  {
    data: {
      icon: "firefox",
    },
    key: "2",
    name: "Mozilla Firefox",
  },
  {
    data: {
    icon: "edge",
    },
    key: "8",
    name: "Microsoft Edge",
  },
];

export const selections = ["Non-Headless", "Headless"];

export const schedulePeriod = [
  { name: 'Daily', key: 'DY' },
  { name: 'Weekly', key: 'WY' },
  { name: 'Monthly ', key: 'MY' }
];

export const scheduleWeeks = [
  { name: 'Monday', key: 0 },
  { name: 'Tuesday', key: 1 },
  { name: 'Wednesday', key: 2 },
  { name: 'Thursday', key: 3 },
  { name: 'Friday', key: 4 },
  { name: 'Saturday', key: 5 },
  { name: 'Sunday', key: 6 },
  { name: 'All', key: 'ALL' }
];

export const scheduleMonths = [
  { name: 'First', code: 'FI' },
  { name: 'Second', code: 'SE' },
  { name: 'Third', code: 'TH' },
  { name: 'Fourth', code: 'FO' },
  { name: 'Last', code: 'LA' }
];

export const scheduleWeek = [
  { name: 'Sunday', key: 0 },
  { name: 'Monday', key: 1 },
  { name: 'Tuesday', key: 2 },
  { name: 'Wednesday', key: 3 },
  { name: 'Thursday', key: 4 },
  { name: 'Friday', key: 5 },
  { name: 'Saturday', key: 6 }
];

export const endMonths = [
  { name: '1 Month', key: 1 },
  { name: '3 Months', key: 3 },
  { name: '6 Months', key: 6 },
  { name: '9 Months', key: 9 }
];

export const reportsData = [
  {
    _id: "de666ad5-e25f-4ece-aad7-9c4df1f68c03",
    startDate: "2023-07-10T11:48:31.000Z",
    modSattus: ["Pass", "Pass", "Pass", "Fail", "Pass", "Fail", "Fail"],
    scestatus: ["Pass", "Pass", "Pass", "Pass", "Fail", "Fail"],
  },
  {
    _id: "58e2725c-2a53-4fab-a851-bd14fad3be3f",
    startDate: "2023-07-10T12:01:02.000Z",
    modSattus: ["Pass", "Fail", "Inprogress", "Inprogress", "Inprogress"],
    scestatus: ["Pass", "Pass"],
  },
  {
    _id: "3de9f0f2-036d-438a-b961-8754a4945ce7",
    startDate: "2023-07-10T11:45:36.000Z",
    modSattus: ["Pass", "Pass"],
    scestatus: ["Pass", "Pass"],
  },
  {
    _id: "ef4e63c8-f190-4056-a14d-62e5d36c7f30",
    startDate: "2023-07-10T12:02:12.000Z",
    modSattus: ["Queued", "Inprogress"],
    scestatus: ["Pass", "Pass"],
  },
];

export const reportsBar = {
  Pass: "#8FBC8F",
  Fail: "#8B0000",
  Queued: "#808080",
  Inprogress: "#6366f1",
};