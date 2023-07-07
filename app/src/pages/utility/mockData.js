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