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

/*
    Filter Selected Objects Functions
*/
const isSelectedElement = (ScrapeObjectTag, selectedFilters) => {
    let isDesiredElement = false;
    let objectTag = ScrapeObjectTag.toLowerCase();
    
    for (let filterTag of selectedFilters) {
        let selectedTag = filterTag.toLowerCase();
        if (
            selectedTag === objectTag
            || (objectTag.includes(selectedTag) && selectedTag !== "a" && objectTag !== "radio button" && objectTag !== "radiobutton" && !objectTag.includes("listview") && !objectTag.includes("tablecell"))
            || (selectedTag === "input" && (objectTag.includes("edit") || objectTag.includes("text")))
            || (selectedTag === "select" && objectTag.includes("combo box"))
            || (selectedTag === "a" && (objectTag.includes("hyperlink"))) 
            || (selectedTag === "checkbox" && objectTag.includes("check box")) 
            || (selectedTag === "radiobutton" && objectTag.includes("radio button"))
        ) isDesiredElement = true;
    }    

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
    // scrapedItems.forEach(item => item.hide = false);

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
        item.hide = false;
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

export const getFilteredScrapeObjects = (scrapeItems, filters, order, orderList) => {
    let newScrapedItems = scrapeItems;
    let reversedScrapeItems = newScrapedItems.reverse();
    let uniqueBucket = [];
    let flags = getFlags(filters);

    for (let scrapeItem of reversedScrapeItems) {
        let hide = true;
        let duplicate = false;
        if (
            (flags.others && otherObjects(scrapeItem.tag)) ||
            (flags.othersMobile && otherMobileObjects(scrapeItem.tag)) ||
            (flags.userobj && scrapeItem.isCustom) ||
            (flags.unsavedObjects && isUnsaved(scrapeItem.objId)) ||
            (flags.elements.length && isSelectedElement(scrapeItem.tag, flags.elements))
        ) {
            hide = false;
        }
        
        if (flags.duplicateCustnames) {
            let custname = scrapeItem.title.trim().replace(/[<>]/g, '');
            if (!uniqueBucket.includes(custname)) {
                uniqueBucket.push(custname);
            }
            else {
                hide = false;
                duplicate = true;
            }
        }

        if (filters.length === 1 && filters[0] === "alphabetOrder") hide = false;

        scrapeItem.hide = hide;
        scrapeItem.duplicate = duplicate;
    }

    switch(order){
        case "val": newScrapedItems = scrapedOrder(reversedScrapeItems, orderList); break;
        case "alphabet": newScrapedItems = getListInAlphabetOrder(reversedScrapeItems); break;
        default : newScrapedItems = reversedScrapeItems.reverse();
    }

    return newScrapedItems;
}

function getFlags(filters) {
    let flags = { others: false, othersMobile: false, duplicateCustnames: false, userobj: false, unsavedObjects: false, elements: [], order: false };
    for (let tag of filters) {
        switch (tag) {
            case "others": flags.others = true; break;
            case "othersMobile": flags.othersMobile = true; break;
            case "duplicateCustnames": flags.duplicateCustnames = true; break;
            case "userobj": flags.userobj = true; break;
            case "unsavedObjects": flags.unsavedObjects = true; break;
            case "alphabetOrder": flags.order = true; break;
            default: flags.elements.push(tag); break;
        }
    }
    return flags;
}