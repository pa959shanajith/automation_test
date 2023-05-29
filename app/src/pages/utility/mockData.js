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
