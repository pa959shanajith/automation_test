import React, { useEffect, useState } from 'react';
import { ModalContainer, ScrollBar } from '../../global';
import "../styles/CreateObjectModal.scss";

const CreateObjectModal = props => {

    const [objects, setObjects] = useState([
        { objName: "", objType: "", url: "", name: "", relXpath: "", absXpath: "", className: "", id: "", qSelect: ""}
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
        <div className="ss__createObj">
            <ModalContainer 
                title="Create Object"
                content={
                    <div className="ss__createObj_content">
                        <ScrollBar hideXbar={true} thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px' minThumbSize='20px'>
                                { objects.map((object, index) => <div className="ss__createObj_item" key={index}>
                                        <div className="createObj_row">
                                            <input className="createObj_input" placeholder="Enter Object Name" />
                                            <select className="createObj_objType" value={object.objType}>
                                                <option className="createObj_option" disabled value="">Select Object Type</option>
                                                { objectTypes.map( objectType =>
                                                    <option className="createObj_option" value={objectType.value}>{objectType.name}</option>
                                                ) }
                                            </select>
                                            <button className="createObj_btn" onClick={deleteField}><img src="static/imgs/ic-delete.png" /></button>
                                            <button className="createObj_btn" onClick={deleteField}><img src="static/imgs/ic-jq-editstep.png" /></button>
                                            { objects.length-1 === index && <button className="createObj_btn" onClick={newField}><img src="static/imgs/ic-add.png" /></button>}
                                        </div>
                                        <div className="createObj_row"><input className="createObj_input" placeholder="Enter URL" /></div>
                                        <div className="createObj_row"><input className="createObj_input" placeholder="Enter name" /></div>
                                        <div className="createObj_row"><input className="createObj_input" placeholder="Enter Relative xpath" /></div>
                                        <div className="createObj_row"><input className="createObj_input" placeholder="Enter Absolute xpath" /></div>
                                        <div className="createObj_row"><input className="createObj_input" placeholder="Enter class name" /></div>
                                        <div className="createObj_row"><input className="createObj_input" placeholder="Enter ID" /></div>
                                        <div className="createObj_row">
                                            <input className="createObj_input" placeholder="Enter Query Selector" />
                                            <button className="createObj_save">Save</button>
                                        </div>
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

export default CreateObjectModal;