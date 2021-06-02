/*
    Other Objects Filter Functions
*/
const otherObjects = ScrapeObjectTag => {
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

export const getOtherObjects = scrapedItems => {
    scrapedItems.forEach(item => {
        if (otherObjects(item.tag)) {
                item.hide = false;
        }
    });
    return scrapedItems;
}


/*
    Other Mobile Filters Function
*/
const otherMobileObjects = ScrapeObjectTag => {
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

export const getOtherMobileObjects = scrapedItems => {
    scrapedItems.forEach(item => {
        if (otherMobileObjects(item.tag)){
                item.hide = false;
            }
    });

    return scrapedItems;
}

/*
    Duplicate Objects Filter
*/
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


/*
    Custom Object Filter Function 
*/
export const getCustomObjects = scrapedItems => {
    scrapedItems.forEach(item => {
        if (item.isCustom) {
            item.hide = false
        }
    });

    return scrapedItems;
}

/*
    Filter Selected Objects Functions
*/
const isSelectedElement = (selectedFilterTag, ScrapeObjectTag) => {
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

export const getSelectedObjects = (scrapedItems, tag) => {
    scrapedItems.forEach(item => {
        if (isSelectedElement(tag, item.tag)) {
            item.hide = false;
        }
    });

    return scrapedItems;
}


/* 
    Unsaved Objects Filter Functions
*/
const isUnsaved = objectId => {
    const isUnsaved = objectId ? false : true;
    return isUnsaved;
}

export const getUnsavedObjects = scrapedItems => {
    scrapedItems.forEach(item => {
        if (isUnsaved(item.objId)) {
            item.hide = false;
        }
    });

    return scrapedItems;
}


/*
    Order The List by Alphabet Order
*/
const alphabetOrder = scrapeItems => {
    let tempScrapeItems = [...scrapeItems];

    tempScrapeItems.sort(compareObjectName);
    return tempScrapeItems;
}

export const getListInAlphabetOrder = scrapedItems => {
    scrapedItems = alphabetOrder(scrapedItems);
    scrapedItems.forEach(item => item.hide = false);

    return scrapedItems;
}

export const scrapedOrder = (scrapeItems, orderList) => {
    let tempScrapeItems = [...scrapeItems];
    let newScrapeList = [];
    let orderDict = {};

    for (let scrapeItem of tempScrapeItems){
        if(scrapeItem.objId) orderDict[scrapeItem.objId] = scrapeItem;
        else orderDict[scrapeItem.tempOrderId] = scrapeItem;
    }
    if (orderList && orderList.length) 
        orderList.forEach(orderId => newScrapeList.push(orderDict[orderId]))

    return newScrapeList;
}

export const resetList = (scrapeItems, order, orderList) => {
    if (order === "val") scrapeItems = scrapedOrder(scrapeItems, orderList);

    scrapeItems.forEach(item => {
        item.hide = true;
        item.duplicate = false;
    })

    return scrapeItems;
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

function compareObjectName (objOne, objTwo) {
    let titleOne = objOne.title.toLowerCase();
    let titleTwo = objTwo.title.toLowerCase();

    return (titleOne <= titleTwo) ? -1 : 1;
}