export const mobileMacFilters = [
    { label: "Button", tag: "Button"},
    { label: "links", tag: "links"},
    { label: "statictexts", tag: "statictexts"},
    { label: "image", tag: "image"},
    { label: "RadioButton", tag: "RadioButton"},
    { label: "Slider", tag: "XCUIElementTypeSlider"},
    { label: "Datepicker", tag: "Datepicker"},
    { label: "SecureTextField", tag: "iOSXCUIElementTypeSecureTextField"},
    { label: "TextField", tag: "iOSEditText"},
    { label: "OtherElements", tag: "otherElements"},
    { label: "SearchField", tag: "iOSXCUIElementTypeSearchField"},
    { label: "PickerWheelPickerWheel", tag: "XCUIElementTypePickerWheel"},
    { label: "textView", tag: "textViews"},
    { label: "cells", tag: "cellscells"},
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

export const mappingList = {
    'lnk': { value: 'a', name: 'Link'},
    'txtbox': { value: 'input', name: 'Textbox/Textarea'},
    'tbl': { value: 'table', name: 'Table'},
    'lst': { value: 'list', name: 'List'},
    'select': { value: 'select', name: 'Dropdown'},
    'img': { value: 'img', name: 'Image'},
    'btn': { value: 'button', name: 'Button'},
    'radiobtn': { value: 'radiobutton', name: 'Radiobutton'},
    'chkbox': { value: 'checkbox', name: 'Checkbox'},
    'elmnt': { value: 'Element', name: 'Element'}
}