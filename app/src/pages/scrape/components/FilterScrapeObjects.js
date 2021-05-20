export const otherObjects = ScrapeObjectTag => {
    let isOtherObject = true;
    let objectTag = ScrapeObjectTag.toLowerCase();
    let typeArray = [ 
        "button", "checkbox", "select", "img", "a", "radiobutton", "input", "list", "link", 
        "scroll bar", "internal frame", "table", "grid", "tablecell", "edit", "text", "combo box",
        "hyperlink", "check box", "checkbox", "image", "radio button"
    ]

    if (typeArray.includes(objectTag)) isOtherObject = false;

    return isOtherObject;
}

export const otherMobileObjects = ScrapeObjectTag => {
    let isOtherObject = true;
    let objectTag = ScrapeObjectTag.toLowerCase();

    let mobileTypeArray = [
        "android.widget.button", "android.widget.checkbox", "android.widget.numberpicker", "android.widget.timepicker", 
        "android.widget.datepicker", "android.widget.radiobutton", "android.widget.edittext", "android.widget.listview",
        "android.widget.spinner", "android.widget.switch", "android.widget.imagebutton", "android.widget.seekbar",
        "button", "links", "statictext", "image", "radiobutton", "xcuielementtypeslider", "datepicker", "iosedittext",
        "iosxcuielementtypesecuretextfield", "iosxcuielementtypesearchfield", "xcuieelementtypepickerwheel", "textView", "cell"
    ]
    
    if (mobileTypeArray.includes(objectTag) || isInArray(mobileTypeArray, objectTag)) isOtherObject = false;

    return isOtherObject;
}

export const duplicateObjects = scrapedItems => {
    let newScrapedItems = scrapedItems;
    let reversedScrapeItems = newScrapedItems.reverse();
    let uniqueBucket = []

    reversedScrapeItems.forEach(item => {
        let custname = item.title.trim().replace(/[<>]/g, '');
        if (!uniqueBucket.includes(custname)) {
            uniqueBucket.push(custname);
        }
        else {
            item.hide = false;
            item.duplicate = true;
        }
    })

    newScrapedItems = reversedScrapeItems.reverse();

    return newScrapedItems;
}

export const isSelectedElement = (selectedFilterTag, ScrapeObjectTag) => {
    let isDesiredElement = false;
    let objectTag = ScrapeObjectTag.toLowerCase();
    let selectedTag = selectedFilterTag.toLowerCase();

    if (
        selectedTag === objectTag
        || (objectTag.includes(selectedTag) && selectedTag !== "a" && objectTag !== "radio button" && objectTag !== "radiobutton" && !objectTag.includes("listview") && !objectTag.includes("tablecell"))
        || (selectedTag === "input" && (objectTag.includes("edit") || objectTag.includes("text")))
        || (selectedTag === "select" && objectTag.includes("combo box"))
        || (selectedTag === "a" && (objectTag.includes("hyperlink"))) 
        || (selectedTag === "checkbox" && objectTag.includes("check box")) 
        || (selectedTag === "radiobutton" && objectTag.includes("radio button"))
    ) isDesiredElement = true;

    return isDesiredElement;
}

function isInArray (array, item) {
    let found = false;
    for (let arrayItem of array){
        if (arrayItem.includes(item) || item.includes(arrayItem)) {
            found = true;
            break;
        }
    }
    return found;
}