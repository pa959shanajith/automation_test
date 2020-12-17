import React, { useEffect, useState } from 'react';
import { ModalContainer, ScrollBar } from '../../global';
import "../styles/AddObjectModal.scss";

const AddObjectModal = props => {

    const [objects, setObjects] = useState([
        { objName: "", objType: ""}
    ]);

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

    return (
        <div className="ss__objModal">
            <ModalContainer 
                title="Add Object"
                content={
                    <div className="ss__objModal_content">
                        <ScrollBar hideXbar={true} thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px' minThumbSize='20px'>
                                { objects.map((object, index) => <div className="ss__objModal_item" key={index}>
                                        <input className="addObj_name" placeholder="Enter Object Name" />
                                        <select className="addObj_objType" value={object.objType}>
                                            <option className="addObj_option" disabled value="">Select Object Type</option>
                                            { objectTypes.map( objectType =>
                                                <option className="addObj_option" value={objectType.value}>{objectType.name}</option>
                                            ) }
                                        </select>
                                        <button className="addObj_btn" onClick={deleteField}><img src="static/imgs/ic-delete.png" /></button>
                                        { objects.length-1 === index && <button className="addObj_btn" onClick={newField}><img src="static/imgs/ic-add.png" /></button>}
                                    </div>
                                ) }
                        </ScrollBar>
                    </div>
                }
                close={()=>props.setShow(false)}
                footer={<>
                    <button>Reset</button>
                    <button>Submit</button>
                </>}
            />
        </div>
    );
}

export default AddObjectModal;