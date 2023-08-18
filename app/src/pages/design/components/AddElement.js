import React, {useState} from 'react';
import { v4 as uuid } from 'uuid';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import '../styles/AddElement.scss';


const AddElement = (props) => {
    //add Elements
    const [addElementTempIdCounter, setAddElementTempIdCounter] = useState(0);
    const [addElementObjects, setAddElementObjects] = useState([]);
    const [addElementSelectObjectType, setAddElementSelectObjectType] = useState(null);
    const [addElementInputValue, setAddElementInputValue] = useState('');

    const objectTypes = [
        { value: "a", typeOfElement: "lnk", name: "Link" },
        { value: "input", typeOfElement: "txtbox", name: "Textbox/Textarea" },
        { value: "table", typeOfElement: "tbl", name: "Table" },
        { value: "list", typeOfElement: "lst", name: "List" },
        { value: "select", typeOfElement: "select", name: "Dropdown" },
        { value: "img", typeOfElement: "img", name: "Image" },
        { value: "button", typeOfElement: "btn", name: "Button" },
        { value: "radiobutton", typeOfElement: "radiobtn", name: "Radiobutton" },
        { value: "checkbox", typeOfElement: "chkbox", name: "Checkbox" },
        { value: "Element", typeOfElement: "elmnt", name: "Element" }
    ];

    const addElementSaveHandler = () => {
        let newObjects = [];
        let newOrderList = [];

        for (let i = 0; i < addElementObjects.length; i++) {
            let name = addElementObjects[i].objName;
            let type = addElementObjects[i].objType;
            let tempId = addElementObjects[i].tempId;
            let [tag, value] = type.split("-");
            let custname = `${name.trim()}_${value}`;
            let newUUID = uuid();
            newObjects.push({
                custname: name,
                objIdx: i,
                title: name,
                tag: tag,
                xpath: "",
                val: newUUID,
                isCustom: true,
                tempOrderId: newUUID,
            });
            newOrderList.push(newUUID);
        }
        if (newObjects.length > 0) {
            props.addCustomElement(newObjects, newOrderList);
        }
        props.OnClose();
    }


    const handleAddElementInputChange = (e) => {
        setAddElementInputValue(e.target.value);
    };

    const handleAddElementDropdownChange = (e) => {
        setAddElementSelectObjectType(e.value);
    };

    const handleAddElementAdd = () => {
        let updatedObjects = {};
        objectTypes.map(object_type => {
            if (object_type.value === addElementSelectObjectType) {
                updatedObjects["objName"] = addElementInputValue;
                updatedObjects["objType"] = object_type.value + '-' + object_type.typeOfElement;
                updatedObjects["tempId"] = addElementTempIdCounter + 1;

            }
        });
        setAddElementObjects([...addElementObjects, updatedObjects]);
        setAddElementInputValue('');
        setAddElementSelectObjectType('');
        setAddElementTempIdCounter(addElementTempIdCounter + 1);
    };

    const handleAddElementClear = () => {
        setAddElementInputValue('');
        setAddElementSelectObjectType('');
        setAddElementObjects([]);
    }

    const addElementfooter = (
        <div className=''>
            <Button size="small" onClick={handleAddElementClear} text >Clear</Button> {/*className='add_object_clear'*/}
            <Button size="small" onClick={addElementSaveHandler}>Save</Button> {/*className='add_object_save' */}
        </div>
    )
    return (
        <>
            {/* Add Element */}
            <Dialog
                className='add__object__header'
                header='Add Element'
                visible={props.isOpen === 'addObject'}
                onHide={props.OnClose}
                style={{ height: "28.06rem", width: "38.06rem", marginRight: "15rem" }}
                position='right'
                draggable={false}
                footer={addElementfooter}>
                <div className='card__add_object'>
                    <Card className='add_object__left'>
                        <div className='flex flex-column'>
                            <div className="pb-3">
                                <label className='text-left pl-4' htmlFor="object__dropdown">Select Element Type</label>
                                <Dropdown value={addElementSelectObjectType} onChange={handleAddElementDropdownChange} options={objectTypes} optionLabel="name"
                                    placeholder="Search" className="w-full mt-1 md:w-15rem object__dropdown" />
                            </div>
                            <div className="pb-5">
                                <label className='text-left pl-4' htmlFor="Element_name">Enter Element Name</label>
                                <InputText
                                    type="text"
                                    className='Element_name p-inputtext-sm mt-1'
                                    value={addElementInputValue}
                                    onChange={handleAddElementInputChange}
                                    placeholder='Text Input'
                                    style={{ width: "15rem", marginLeft: "1.25rem" }} />
                            </div>
                            <div style={{ marginLeft: "13.5rem" }}>
                                <Button icon="pi pi-plus" size="small" onClick={handleAddElementAdd} ></Button>
                            </div>
                        </div>
                    </Card>
                    <Card className='add_object__right' title="Added Elements">
                        {addElementObjects.map((value, index) => (
                            <div key={index}>
                                <p className="text__added__step">{value.objName}</p>
                            </div>
                        ))}
                    </Card>
                </div >
            </Dialog >
        </>
    )
}
export default AddElement;