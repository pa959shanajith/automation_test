export const mobileMacFilters = [
    { label: "Button", tag: "Button"},
    { label: "links", tag: "links"},
    { label: "statictexts", tag: "statictext"},
    { label: "image", tag: "image"},
    { label: "RadioButton", tag: "RadioButton"},
    { label: "Slider", tag: "XCUIElementTypeSlider"},
    { label: "Datepicker", tag: "Datepicker"},
    { label: "SecureTextField", tag: "iOSXCUIElementTypeSecureTextField"},
    { label: "TextField", tag: "iOSEditText"},
    { label: "OtherElements", tag: "otherElements"},
    { label: "SearchField", tag: "iOSXCUIElementTypeSearchField"},
    { label: "PickerWheelPickerWheel", tag: "XCUIElementTypePickerWheel"},
    { label: "textView", tag: "textView"},
    { label: "cells", tag: "cell"},
    { label: "Duplicate Custnames", tag: "duplicateCustnames"}
]

export const mobileFilters = [
    { label: "Button", tag: "android.widget.Button"},
    { label: "Checkbox", tag: "android.widget.CheckBox"},
    { label: "NumberPicker", tag: "android.widget.NumberPicker"},
    { label: "TimePicker", tag: "android.widget.TimePicker"},
    { label: "DatePicker", tag: "android.widget.DatePicker"},
    { label: "RadioButton", tag: "android.widget.RadioButton"},
    { label: "TextBox", tag: "android.widget.EditText"},
    { label: "ListView", tag: "android.widget.ListView"},
    { label: "Spinner", tag: "android.widget.Spinner"},
    { label: "Switch", tag: "android.widget.Switch"},
    { label: "ImageButton", tag: "android.widget.ImageButton"},
    { label: "SeekBar", tag: "android.widget.SeekBar"},
    { label: "Others", tag: "othersAndroid"},
    { label: "Duplicate Custnames", tag: "duplicateCustnames"}
]

export const nonMobileFilters = [
    { label: "Button", tag: "button"},
    { label: "Checkbox", tag: "checkbox"},
    { label: "Dropdown", tag: "select"},
    { label: "Image", tag: "img"},
    { label: "Link", tag: "a"},
    { label: "Radio Button", tag: "radiobutton"},
    { label: "Text Box", tag: "input"},
    { label: "List Box", tag: "list"},
    { label: "Table", tag: "table"},
    { label: "IRIS", tag: "iris"},
    { label: "Others", tag: "others"},
    { label: "User Created", tag: "userobj"},
    { label: "Duplicate Custnames", tag: "duplicateCustnames"}
]

export const objectTypes = [
    {value: "a", typeOfElement: "lnk", name: "Link"}, 
    {value: "input", typeOfElement: "txtbox", name: "Textbox/Textarea"}, 
    {value: "table", typeOfElement: "tbl", name: "Table"}, 
    {value: "list", typeOfElement: "lst", name: "List"},
    {value: "select", typeOfElement: "select", name: "Dropdown"},
    {value: "img", typeOfElement: "img", name: "Image"},
    {value: "button", typeOfElement: "btn", name: "Button"},
    {value: "radiobutton", typeOfElement: "radiobtn", name: "Radiobutton"},
    {value: "checkbox", typeOfElement: "chkbox", name: "Checkbox"}, 
    {value: "Element", typeOfElement: "elmnt", name: "Element"}
];

export const tagList = ['a', 'input', 'table', 'list', 'select', 'img', 'button', 'radiobutton', 'checkbox', 'Element']

export const irisObjectTypes = {
    "button": { name: "Button", states: [0] }, 
    "checkbox": { name: "Checkbox", states: [0, 1] }, 
    "radiobutton": { name: "Radiobutton", states: [0, 1] }, 
    "textbox": { name: "Textbox", states: [0] }, 
    "label": { name: "Label", states: [0] }, 
    "tree": { name: "Tree", states: [0] }, 
    "table": { name: "Table", states: [0]}, 
    "dropdown": { name: "Dropdown", states: [0]}, 
    "image": { name: "Image", states: [0]}, 
    "scroll": { name: "Scroll", states: [0]}, 
    "unrecognizableobject": { name: "Others", states: [0]}
};
