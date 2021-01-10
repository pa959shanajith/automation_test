import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ModalContainer, ScrollBar, RedirectPage } from '../../global';
import { userObjectElement_ICE } from '../api';
import "../styles/CreateObjectModal.scss";

const CreateObjectModal = props => {

    const history = useHistory();

    const customObj = { objName: "", objType: "", url: "", name: "", relXpath: "", absXpath: "", className: "", id: "", qSelect: ""};
    const [tempIdCounter, setTempIdCounter] = useState(1);
    const [objects, setObjects] = useState([ { ...customObj, tempId: tempIdCounter } ]);
    const [customObjList, setCustomObjList] = useState({});
    const [error, setError] = useState({type: '', tempId: ''});
    const [showFields, setShowFields] = useState([tempIdCounter]);

    const objectTypes = [
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

    const newField = () => {
        let updatedObjects = [...objects];
        let updatedShowFields = [...showFields];
        let newTempId = tempIdCounter + 1;
        updatedObjects.push({ ...customObj, tempId: newTempId});
        updatedShowFields.push(newTempId);
        setObjects(updatedObjects);
        setShowFields(updatedShowFields);
        setTempIdCounter(newTempId);
    }

    const deleteField = index => {
        let updatedObjects = [...objects];

        updatedObjects.splice(index, 1);
        
        if (objects[index].tempId in customObjList){
            let updatedCustomsObjList = {...customObjList};
            delete updatedCustomsObjList[objects[index].tempId];
            setCustomObjList(updatedCustomsObjList);
        }
        let indexOfId = showFields.indexOf(objects[index].tempId);
        if (indexOfId >=0 ) {
            let updatedShowFields = [...showFields];
            updatedShowFields.splice(indexOfId, 1);
            setShowFields(updatedShowFields);
        }
        setObjects(updatedObjects);
    }
    
    const handleInputs = (event, index) => {
        let updatedObjects = [...objects];
        updatedObjects[index] = { ...updatedObjects[index], [event.target.name]: event.target.value };
        setObjects(updatedObjects);
    }

    const onEdit = id => {
        let indexOfId = showFields.indexOf(id);
        if (indexOfId < 0) {
            let updatedShowFields = [...showFields];
            updatedShowFields.push(id);
            setShowFields(updatedShowFields)
        }
    }

    const onSave = index => {
        let object = objects[index];
        let [tag, elementType] = object.objType.split('-');
        let customFields = ['encrypt'];
        let errorObj = {};
        
        if (!object.objName || !object.objType || !object.url) {
            errorObj = { [object.tempId]: !object.objName ? "objName" : !object.objType ?  "objType" : "url" };
        } else if (object.name === "" && object.relXpath === "" && object.absXpath === "" && object.className === "" && object.id === "" && object.qSelect === ""){
            errorObj = { missingField: true }
            props.setShowPop({title: 'Warning!', content: "Please enter at least one property"});
        }

        if (!Object.keys(errorObj).length) {
            customFields.push(...[object.url, object.name, object.relXpath, object.absXpath, object.className, object.id, object.qSelect, elementType]);
            userObjectElement_ICE(customFields)
			.then(data => {
				if (data === "unavailableLocalServer")
					props.setShowPop({title: "Fail", content: "Failed to create object ICE not available"});
				else if (data === "Invalid Session")
					return RedirectPage(history);
				else if (data === "fail")
					props.setShowPop({title: "Fail", content: "Failed to create object"});
				else{
                    let customObject = { custname: `${object.objName}_${elementType}`,
                                        tag: tag,
                                        url: data.url,
                                        xpath: data.xpath,
                                        editable: 'yes'
                                        };
					let customObjectsList = { ...customObjList, [object.tempId]: customObject};
                    
                    let indexOfId = showFields.indexOf(object.tempId);
                    let updatedShowFields = [...showFields];
                    updatedShowFields.splice(indexOfId, 1);
                    setShowFields(updatedShowFields);
                    setCustomObjList(customObjectsList);
				}
            })
            .catch(error=>console.error(error));
        }
        setError(errorObj)
    }

    const onSubmit = () => {
        let localScrapeList = [];
        let viewArray = [];
        let lastObj = props.scrapeItems[props.scrapeItems.length-1]
        let lastVal = lastObj ? lastObj.val : 0;
        let lastIdx = props.newScrapedData.view ? props.newScrapedData.view.length : 0;
        for (let tempId of Object.keys(customObjList)){
            localScrapeList.push({
                objId: undefined,
                objIdx: lastIdx++,
                val: ++lastVal,
                hide: false,
                title: customObjList[tempId].custname.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;').replace(/[<>]/g, '').trim()
            });
            viewArray.push({
                custname: customObjList[tempId].custname.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;').replace(/[<>]/g, '').trim(),
                tag: customObjList[tempId].tag,
                url: customObjList[tempId].url,
                xpath: customObjList[tempId].xpath,
                editable: customObjList[tempId].editable
            });  
        }
        let updatedNewScrapeData = {...props.newScrapedData};
        if (updatedNewScrapeData.view) updatedNewScrapeData.view.push(...viewArray);
        else updatedNewScrapeData = { view: [...viewArray] };
        // update other properties too
        props.setNewScrapedData(updatedNewScrapeData);
        props.updateScrapeItems(localScrapeList)
        props.setSaved(false);
        props.setShow(false);
        props.setShowPop({title: "Add Object", content: "Objects has been added successfully."})
    }

    const handleType = (event, index) => {
        let updatedObjects = [...objects];
        updatedObjects[index].objType = event.target.value;
        setObjects(updatedObjects);
    }

    return (
        <div className="ss__createObj">
            <ModalContainer 
                title="Create Object"
                content={
                    <div className="ss__createObj_content">
                        <ScrollBar hideXbar={true} thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px' minThumbSize='20px'>
                                { objects.map((object, index) => <div className="ss__createObj_item" key={object.tempId}>
                                        <div className="createObj_row">
                                            <input className={"createObj_input"+(error[object.tempId] === "objName" ? " ss__error_border" : "")} name="objName" onChange={(e)=>handleInputs(e, index)} value={object.objName} placeholder="Enter Object Name" />
                                            <select className={"createObj_objType"+(error[object.tempId] === "objType" ? " ss__error_border" : "")} value={object.objType} onChange={(e)=>handleType(e, index)}>
                                                <option className="createObj_option" disabled selected value="">Select Object Type</option>
                                                { objectTypes.map( objectType =>
                                                    <option className="createObj_option" value={`${objectType.value}-${objectType.typeOfElement}`}>{objectType.name}</option>
                                                ) }
                                            </select>
                                            <button className="createObj_btn" onClick={()=>deleteField(index)} disabled={objects.length === 1}><img src="static/imgs/ic-delete.png" /></button>
                                            <button className="createObj_btn" onClick={()=>onEdit(object.tempId)}><img src="static/imgs/ic-jq-editstep.png" /></button>
                                            { objects.length-1 === index && <button className="createObj_btn" onClick={newField}><img src="static/imgs/ic-add.png" /></button>}
                                        </div>
                                        {
                                            showFields.includes(object.tempId) && 
                                            <>
                                            <div className="createObj_row"><input className={"createObj_input"+(error[object.tempId] === "url" ? " ss__error_border" : "")} name="url" onChange={(e)=>handleInputs(e, index)} value={object.url} placeholder="Enter URL" /></div>
                                            <div className="createObj_row"><input className="createObj_input" name="name" onChange={(e)=>handleInputs(e, index)} value={object.name} placeholder="Enter name" /></div>
                                            <div className="createObj_row"><input className="createObj_input" name="relXpath" onChange={(e)=>handleInputs(e, index)} value={object.relXpath} placeholder="Enter Relative xpath" /></div>
                                            <div className="createObj_row"><input className="createObj_input" name="absXpath" onChange={(e)=>handleInputs(e, index)} value={object.absXpath} placeholder="Enter Absolute xpath" /></div>
                                            <div className="createObj_row"><input className="createObj_input" name="className" onChange={(e)=>handleInputs(e, index)} value={object.className} placeholder="Enter class name" /></div>
                                            <div className="createObj_row"><input className="createObj_input" name="id" onChange={(e)=>handleInputs(e, index)} value={object.id} placeholder="Enter ID" /></div>
                                            <div className="createObj_row">
                                                <input className="createObj_input" name="qSelect" onChange={(e)=>handleInputs(e, index)} value={object.qSelect} placeholder="Enter Query Selector" />
                                                <button className="createObj_save" onClick={()=>onSave(index)}>Save</button>
                                            </div>
                                            </>
                                        }
                                    </div>
                                ) }
                        </ScrollBar>
                    </div>
                }
                close={()=>props.setShow(false)}
                footer={<>
                    <button>Reset</button>
                    <button disabled={showFields.length} onClick={onSubmit}>Submit</button>
                </>}
            />
        </div>
    );
}

export default CreateObjectModal;