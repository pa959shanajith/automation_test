import React, {useState} from 'react';
import { v4 as uuid } from 'uuid';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import '../styles/AddElement.scss';
import { Messages as MSG, VARIANT } from '../../global/components/Messages';


const AddElement = (props) => {
    //add Elements
    const [addElementTempIdCounter, setAddElementTempIdCounter] = useState(0);
    const [addElementObjects, setAddElementObjects] = useState([]);
    const [addElementSelectObjectType, setAddElementSelectObjectType] = useState(null);
    const [addElementInputValue, setAddElementInputValue] = useState('');
    const [addElementSave,setAddElementSave] = useState(false);
    const [addElementObjectType,setAddElementObjectType] = useState(false);

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
        let errorObj = {};
        let errorFlag = null;

        let duplicateDict = {};
        let idArr = [];
        let newObjects = [];
        let newOrderList = [];

        for (let i = 0; i < addElementObjects.length; i++) {
            let name = addElementObjects[i].objName;
            let type = addElementObjects[i].objType;
            let tempId = addElementObjects[i].tempId;
            let [tag, value] = type.split("-");
            let custname = `${name.trim()}`;

            for(let object of props.capturedDataToSave) {
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
        if (errorFlag) {
            if (errorFlag==='duplicate') {
                errorObj = {type: 'input', tempId: idArr};
                props.toastError(MSG.SCRAPE.ERR_DUPLICATE_OBJ)
            } 
            else if (errorFlag==='present') props.toastError(MSG.CUSTOM(`Object Characteristics are same for ${errorObj.dTitle.split('_')[0]}!`,VARIANT.ERROR))
            // setError(errorObj);
        };
        if (!errorFlag && newObjects.length > 0) {
            props.addCustomElement(newObjects, newOrderList);
            props.toastSuccess(MSG.SCRAPE.SUCC_OBJ_ADD);
        }
        props.OnClose();
    }


    const handleAddElementInputChange = (e) => {
        setAddElementInputValue(e.target.value.replace(/\s/g, ''));
        setAddElementSave(true);
    };

    const handleAddElementDropdownChange = (e) => {
        setAddElementSelectObjectType(e.value);
        setAddElementObjectType(true);
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
        setAddElementObjectType(false);
        setAddElementTempIdCounter(addElementTempIdCounter + 1);
    };

    const deleteField = index => {
        let updatedObjects = [...addElementObjects];
        updatedObjects.splice(index, 1);
        setAddElementObjects(updatedObjects);
    }

    const handleAddElementClear = () => {
        setAddElementInputValue('');
        setAddElementSelectObjectType('');
        setAddElementObjects([]);
    }

    const addElementfooter = (
        <div className=''>
            <Button size="small" onClick={handleAddElementClear} text >Clear</Button> {/*className='add_object_clear'*/}
            <Button size="small" disabled={addElementInputValue || !addElementSave} onClick={addElementSaveHandler}>Save</Button> {/*className='add_object_save' */}
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
                                    disabled={!addElementObjectType && !addElementInputValue}
                                    placeholder='Text Input'
                                    style={{ width: "15rem", marginLeft: "1.25rem" }} />
                            </div>
                            <div style={{ marginLeft: "9rem" }}>
                                <Button label='Add Element' size="small" disabled={!addElementInputValue} onClick={handleAddElementAdd} ></Button>
                            </div>
                        </div>
                    </Card>
                    <Card className='add_object__right' title="Added Elements">
                        {addElementObjects.map((value, index) => (
                            <div key={index} style={{ overflow: 'auto', position: 'relative' }}>
                                <span className="added__step"><p style={{whiteSpace: 'nowrap', overflow: 'hidden',textOverflow: 'ellipsis',width: '12rem'}}>{value.objName}<i className="pi pi-times cross_icon" onClick={()=>deleteField(index)}/></p></span>
                            </div>
                        ))}
                    </Card>
                </div >
            </Dialog >
        </>
    )
}
export default AddElement;