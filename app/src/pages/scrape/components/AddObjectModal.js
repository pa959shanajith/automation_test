import React, { useState } from 'react';
import { ModalContainer, ScrollBar } from '../../global';
import "../styles/AddObjectModal.scss";

const AddObjectModal = props => {

    const [objects, setObjects] = useState([{objName: "", objType: ""}]);
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
        updatedObjects.push({ objName: "", objType: ""});
        setObjects(updatedObjects);
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
        let newObjects = []
        let errorObj = {};
        let lastObj = props.scrapeItems[props.scrapeItems.length-1]
        let lastVal = lastObj ? lastObj.val : 0;
        for (let i=0; i<objects.length; i++){
            let name = objects[i].objName;
            let type = objects[i].objType;

            if (!name || !type) {
                errorObj = { type: !name ? "input" : "type", index: i };
                break;
            } else {
                let [tag, value] = type.split("-");
                newObjects.push({
                    objIdx: i,
                    title: `${name}_${value}`, 
                    tag: tag, 
                    xpath: "", 
                    val: ++lastVal,
                    isCustom: true
                });
            }
        }
        if (newObjects.length > 0 && !errorObj.index) {
            props.setScrapeItems([...props.scrapeItems, ...newObjects]);
            props.setShow(false);
        }
        setError(errorObj)
    }

    return (
        <div className="ss__objModal">
            <ModalContainer 
                title="Add Object"
                content={
                    <div className="ss__objModal_content">
                        <ScrollBar hideXbar={true} thumbColor="#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px' minThumbSize='20px'>
                                { objects.map((object, index) => <div className="ss__objModal_item" key={index}>
                                        <input className={"addObj_name"+(error.type==="input" && error.index === index ? " ss__error_field" : "")} value={object.objName} onChange={(e)=>handleInput(e, index)} placeholder="Enter Object Name" />
                                        <select className={"addObj_objType"+(error.type==="type" && error.index === index ? " ss__error_field" : "")} value={object.objType} onChange={(e)=>handleType(e, index)}>
                                            <option className="addObj_option" disabled selected value="">Select Object Type</option>
                                            { objectTypes.map( objectType =>
                                                <option className="addObj_option" value={`${objectType.value}-${objectType.typeOfElement}`}>
                                                    {objectType.name}
                                                </option>
                                            ) }
                                        </select>
                                        <button className="addObj_btn" onClick={()=>deleteField(index)}><img src="static/imgs/ic-delete.png" /></button>
                                        { objects.length-1 === index && <button className="addObj_btn" onClick={newField}><img src="static/imgs/ic-add.png" /></button>}
                                    </div>
                                ) }
                        </ScrollBar>
                    </div>
                }
                close={()=>props.setShow(false)}
                footer={<>
                    <button>Reset</button>
                    <button onClick={onSubmit}>Submit</button>
                </>}
            />
        </div>
    );
}

export default AddObjectModal;