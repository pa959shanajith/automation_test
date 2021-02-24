import React, { useState } from 'react';
import { ModalContainer, ScrollBar } from '../../global';
import "../styles/AddObjectModal.scss";

const AddObjectModal = props => {

    const [tempIdCounter, setTempIdCounter] = useState(1);
    const [objects, setObjects] = useState([{objName: "", objType: "", tempId: tempIdCounter}]);
    const [error, setError] = useState({});

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
        let newTempId = tempIdCounter + 1;
        updatedObjects.push({ objName: "", objType: "", tempId: newTempId});
        setObjects(updatedObjects);
        setTempIdCounter(newTempId);
    }

    const deleteField = index => {
        let updatedObjects = [...objects];
        updatedObjects.splice(index, 1);
        setObjects(updatedObjects);
    }

    const handleInput = (event, index) => {
        let updatedObjects = [...objects];
        updatedObjects[index].objName = event.target.value;
        setObjects(updatedObjects);
    }

    const handleType = (event, index) =>{
        let updatedObjects = [...objects];
        updatedObjects[index].objType = event.target.value;
        setObjects(updatedObjects);
    }

    const onSubmit = () => {
        let errorObj = {};
        let errorFlag = null;
        let lastObj = props.scrapeItems[props.scrapeItems.length-1]
        let lastVal = lastObj ? lastObj.val : 0;

        let duplicateDict = {};
        let idArr = [];
        let newObjects = [];
        
        for (let i=0; i<objects.length; i++){
            let name = objects[i].objName;
            let type = objects[i].objType;
            let tempId = objects[i].tempId;
            let [tag, value] = type.split("-");
            let custname = `${name}_${value}`;

            for(let object of props.scrapeItems) {
                if (object.title === custname) {
                    errorObj = { type: "input", tempId: [tempId], dTitle: custname };
                    errorFlag = 'present';
                    break;
                }
            }
            if (errorFlag==='present') break;

            if (!name || !type) {
                errorObj = { type: !name ? "input" : "type", tempId: [tempId] };
                errorFlag = 'empty';
                break;
            }

            if (custname in duplicateDict){
                duplicateDict[custname].push(tempId);
                idArr.push(...duplicateDict[custname]);
                errorFlag = 'duplicate';
            }
            else duplicateDict[custname] = [tempId];

            newObjects.push({
                objIdx: i,
                title: `${name}_${value}`, 
                tag: tag, 
                xpath: "", 
                val: ++lastVal,
                isCustom: true
            });
        }

        if (errorFlag) {
            if (errorFlag==='duplicate') {
                errorObj = {type: 'input', tempId: idArr};
                props.setShowPop({title: 'Add Objects', content: 'Duplicate Object Names Found!'})
            } 
            else if (errorFlag==='present') props.setShowPop({title: 'Add Objects', content: `Object Characteristics are same for ${errorObj.dTitle.split('_')[0]}!`})
            setError(errorObj);
        };
        
        if (!errorFlag && newObjects.length > 0) {
            props.setScrapeItems([...props.scrapeItems, ...newObjects]);
            props.setShow(false);
            props.setSaved(false);
            props.setShowPop({title: "Add Object", content: "Objects has been added successfully."});
        }
    }

    const resetFields = () => {
        let emptyFields = [...objects];
        for (let i=0; i<emptyFields.length; i++) {
            emptyFields[i] = {objName: "", objType: ""};
        }
        setObjects(emptyFields);
        setError({});
    }

    return (
        <div className="ss__objModal">
            <ModalContainer 
                title="Add Object"
                content={
                    <div className="ss__objModal_content" id="ss__objModalListId">
                        <ScrollBar scrollId="ss__objModalListId" thumbColor="#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                                { objects.map((object, index) => <div className="ss__objModal_item" key={index}>
                                        <input className={"addObj_name"+(error.type==="input" && error.tempId.includes(object.tempId) ? " ss__error_field" : "")} value={object.objName} onChange={(e)=>handleInput(e, index)} placeholder="Enter Object Name" />
                                        <select className={"addObj_objType"+(error.type==="type" && error.tempId.includes(object.tempId) ? " ss__error_field" : "")} value={object.objType} onChange={(e)=>handleType(e, index)}>
                                            <option className="addObj_option" disabled selected value="">Select Object Type</option>
                                            { objectTypes.map((objectType, i) =>
                                                <option key={i} className="addObj_option" value={`${objectType.value}-${objectType.typeOfElement}`}>
                                                    {objectType.name}
                                                </option>
                                            ) }
                                        </select>
                                        <button className="addObj_btn" onClick={()=>deleteField(index)} disabled={objects.length === 1}><img src="static/imgs/ic-delete.png" /></button>
                                        { objects.length-1 === index && <button className="addObj_btn" onClick={newField}><img src="static/imgs/ic-add.png" /></button>}
                                    </div>
                                ) }
                        </ScrollBar>
                    </div>
                }
                close={()=>props.setShow(false)}
                footer={<>
                    <button onClick={resetFields}>Reset</button>
                    <button onClick={onSubmit}>Submit</button>
                </>}
            />
        </div>
    );
}

export default AddObjectModal;