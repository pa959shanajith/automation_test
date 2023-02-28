import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { ModalContainer, ScrollBar, RedirectPage, Messages as MSG, VARIANT, setMsg } from '../../global';
import { objectTypes } from './ListVariables';
import { userObjectElement_ICE } from '../api';
import "../styles/CreateObjectModal.scss";
import {v4 as uuid} from 'uuid';
import PropTypes from 'prop-types'

const CreateObjectModal = props => {

    const history = useHistory();

    const customObj = { objName: "", objType: "", url: "", name: "", relXpath: "", absXpath: "", className: "", id: "", qSelect: ""};
    const [tempIdCounter, setTempIdCounter] = useState(1);
    const [objects, setObjects] = useState([ { ...customObj, tempId: tempIdCounter } ]);
    const [customObjList, setCustomObjList] = useState({});
    const [error, setError] = useState({type: '', tempId: ''});
    const [showFields, setShowFields] = useState([tempIdCounter]);

    useEffect(()=>{
        if (props.editFlag) {
            let customFields = ['decrypt', props.utils.object.xpath, props.utils.object.url, props.utils.object.tag];
            
            userObjectElement_ICE(customFields)
            .then(data => {
                if (data === "unavailableLocalServer") 
                    setMsg(MSG.SCRAPE.ERR_CREATE_OBJ);
                else if (data === "invalid session") return RedirectPage(history);
                else if (data === "fail") 
                    setMsg(MSG.SCRAPE.ERR_CREATE_OBJ);
                else{
                    let custname = props.utils.object.title;
                    let newObj = { 
                        objName:  custname.slice(0, custname.lastIndexOf("_")), 
                        objType: `${data.tag}-${custname.slice(custname.lastIndexOf("_")+1)}`, 
                        url: data.url, 
                        name: data.name, 
                        relXpath: data.rpath, 
                        absXpath: data.apath, 
                        className: data.classname, 
                        id: data.id, 
                        qSelect: data.selector
                    }
                    let obj = [...objects];
                    obj[0] = {...obj[0], ...newObj};
                    setObjects(obj);
                }})
                .catch(error => console.log(error));
        }
        //eslint-disable-next-line
    }, [])

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
            setMsg(MSG.SCRAPE.WARN_ADD_PROPERTY);
        }

        if (!Object.keys(errorObj).length) {
            customFields.push(...[object.url, object.name, object.relXpath, object.absXpath, object.className, object.id, object.qSelect, elementType]);
            userObjectElement_ICE(customFields)
			.then(data => {
				if (data === "unavailableLocalServer")
					setMsg(MSG.CUSTOM(`Failed to ${props.editFlag ? "edit" : "create"} object ICE not available`,VARIANT.ERROR));
				else if (data === "Invalid Session")
					return RedirectPage(history);
				else if (data === "fail")
					setMsg({VARIANT:VARIANT.ERROR, CONTENT: `Failed to ${props.editFlag ? "edit" : "create"} object`});
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
        if (props.editFlag) {
            let errorFlag = null;
            let errorObj = {};
            let custname = customObjList[1].custname.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;').replace(/[<>]/g, '').trim();
            for(let object of props.scrapeItems) {
                if (object.title === custname && object.val !== props.utils.object.val) {
                    errorObj = { [customObjList[1].tempId]: "objName", dTitle: custname };
                    errorFlag = 'present';
                    break;
                }
            }
            if (errorFlag) {
                setError(errorObj);
                setMsg(MSG.CUSTOM(`Object Characteristics are same for ${errorObj.dTitle.split('_')[0]}!`,VARIANT.ERROR));
            }
            else {
                props.utils.modifyScrapeItem(props.utils.object.val, {
                    custname: custname,
                    tag: customObjList[1].tag,
                    url: customObjList[1].url,
                    xpath: customObjList[1].xpath,
                    editable: true
                }, true);
                props.setShow(false);
            }
        }
        else {
            let localScrapeList = [];
            let viewArray = [];
            let lastIdx = props.newScrapedData.view ? props.newScrapedData.view.length : 0;

            let duplicateDict = {};
            let tempIdArr = [];
            let duplicateFlag = false;
            let errorFlag = null;
            let errorObj = {};
            let newOrderList = [];

            for (let tempId of Object.keys(customObjList)){

                let custname = customObjList[tempId].custname.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;').replace(/[<>]/g, '').trim();

                for(let object of props.scrapeItems) {
                    if (object.title === custname) {
                        errorObj = { [tempId]: "objName", dTitle: custname };
                        errorFlag = 'present';
                        break;
                    }
                }

                if (errorFlag==='present') break;

                if (custname in duplicateDict){
                    duplicateDict[custname].push(tempId);
                    tempIdArr.push(...duplicateDict[custname]);
                    duplicateFlag = true;
                } else duplicateDict[custname] = [tempId]

                let newUUID = uuid();
                localScrapeList.push({
                    objId: undefined,
                    objIdx: lastIdx,
                    val: newUUID,
                    hide: false,
                    title: custname,
                    url: customObjList[tempId].url,
                    tag: customObjList[tempId].tag,
                    xpath: customObjList[tempId].xpath,
                    editable: true,
                    tempOrderId: newUUID,
                });
                viewArray.push({
                    custname: custname,
                    tag: customObjList[tempId].tag,
                    url: customObjList[tempId].url,
                    xpath: customObjList[tempId].xpath,
                    editable: true
                });  
                newOrderList.push(newUUID);
                lastIdx++
            }
            
            if (errorFlag) {
                setError(errorObj);
                setMsg(MSG.CUSTOM( `Object Characteristics are same for ${errorObj.dTitle.split('_')[0]}!`,VARIANT.ERROR));
            } 
            else if (duplicateFlag) {
                tempIdArr.forEach(tempId => errorObj[tempId] = "objName");
                setError(errorObj);
                setMsg(MSG.SCRAPE.ERR_DUPLICATE_OBJ);
            } else {
                let updatedNewScrapeData = {...props.newScrapedData};
                if (updatedNewScrapeData.view) updatedNewScrapeData.view.push(...viewArray);
                else updatedNewScrapeData = { view: [...viewArray] };
                props.setNewScrapedData(updatedNewScrapeData);
                props.updateScrapeItems(localScrapeList)
                props.setOrderList(oldOrderList => [...oldOrderList, ...newOrderList])
                props.setSaved({ flag: false });
                props.setShow(false);
                setMsg(MSG.SCRAPE.SUCC_OBJ_CREATE);
            }
        }
    }

    const handleType = (event, index) => {
        let updatedObjects = [...objects];
        updatedObjects[index].objType = event.target.value;
        setObjects(updatedObjects);
    }

    const resetFields = () => {
        let emptyFields = [...objects];
        let showAll = [...showFields];
        for (let i=0; i<emptyFields.length; i++) {
            emptyFields[i] = { ...emptyFields[i], ...customObj};
            if (!showAll.includes(emptyFields[i].tempId)) 
                showAll.push(emptyFields[i].tempId)
        }
        setObjects(emptyFields);
        setShowFields(showAll);
        setError({type: '', tempId: ''});
    }

    return (
        <div data-test="createObject" className="ss__createObj">
            <ModalContainer 
                title={props.editFlag ? "Edit Object" : "Create Element"}
                content={
                    <div data-test="createObjectModalContent" className="ss__createObj_content" id="createObjListId">
                        <ScrollBar scrollId="createObjListId" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                                { objects.map((object, index) => <div data-test="ssCreateObjectItem" className="ss__createObj_item" key={object.tempId}>
                                        <div data-test="createObjectRow" className="createObj_row">
                                            <input  data-test="createObjectInput" className={"createObj_input"+(error[object.tempId] === "objName" ? " ss__error_border" : "")} disabled={!showFields.includes(object.tempId)} name="objName" onChange={(e)=>handleInputs(e, index)} value={object.objName} placeholder="Enter Element Name" />
                                            <select data-test="createObjectType" className={"createObj_objType"+(error[object.tempId] === "objType" ? " ss__error_border" : "")} disabled={!showFields.includes(object.tempId)} value={object.objType} onChange={(e)=>handleType(e, index)}>
                                                <option className="createObj_option" disabled value="">Select Element Type</option>
                                                { objectTypes.map( (objectType, i) =>
                                                    <option key={i} className="createObj_option" value={`${objectType.value}-${objectType.typeOfElement}`}>{objectType.name}</option>
                                                ) }
                                            </select>
                                            {!props.editFlag && <button data-test="objectDeleteButton" className="createObj_btn" onClick={()=>deleteField(index)} disabled={objects.length === 1}><img alt="del-ic" src="static/imgs/ic-delete.png" /></button>}
                                            <button data-test="objectEditButton" className="createObj_btn" onClick={()=>onEdit(object.tempId)} style={props.editFlag ? {flex: "1 0"} : null}><img alt="edit-ic" src="static/imgs/ic-jq-editstep.png" /></button>
                                            {!props.editFlag && objects.length-1 === index && <button data-test="objectAddButton" className="createObj_btn" onClick={newField}><img alt="add-ic" src="static/imgs/ic-add.png" /></button>}
                                        </div>
                                        {
                                            showFields.includes(object.tempId) && 
                                            <>
                                            <div data-test="enterURL" className="createObj_row"><input  data-test="enterURLInput" className={"createObj_input"+(error[object.tempId] === "url" ? " ss__error_border" : "")} name="url" onChange={(e)=>handleInputs(e, index)} value={object.url} placeholder="Enter URL" /></div>
                                            <div data-test="enterName" className="createObj_row"><input data-test="enterNameInput"className="createObj_input" name="name" onChange={(e)=>handleInputs(e, index)} value={object.name} placeholder="Enter name" /></div>
                                            <div data-test="enterrelXpath" className="createObj_row"><input className="createObj_input" name="relXpath" onChange={(e)=>handleInputs(e, index)} value={object.relXpath} placeholder="Enter Relative xpath" /></div>
                                            <div data-test="enterabsXpath"className="createObj_row"><input className="createObj_input" name="absXpath" onChange={(e)=>handleInputs(e, index)} value={object.absXpath} placeholder="Enter Absolute xpath" /></div>
                                            <div data-test="enterclassName" className="createObj_row"><input className="createObj_input" name="className" onChange={(e)=>handleInputs(e, index)} value={object.className} placeholder="Enter class name" /></div>
                                            <div data-test="enterID" className="createObj_row"><input className="createObj_input" name="id" onChange={(e)=>handleInputs(e, index)} value={object.id} placeholder="Enter ID" /></div>
                                            <div data-test="enterQuery" className="createObj_row">
                                                <input className="createObj_input" name="qSelect" onChange={(e)=>handleInputs(e, index)} value={object.qSelect} placeholder="Enter Query Selector" />
                                                <button   data-test="saveButton"  className="createObj_save" onClick={()=>onSave(index)}>Save</button>
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
                    <button data-test="reset" onClick={resetFields}>Reset</button>
                    <button data-test="submit" disabled={showFields.length} onClick={onSubmit}>Submit</button>
                </>}
            />
        </div>
    );
}

const EditObjectModal = props => {
    return (
        <CreateObjectModal {...props} editFlag={true} />
    );
}
CreateObjectModal.propTypes={
    scrapeItems: PropTypes.arrayOf(PropTypes.object),
    newScrapedData: PropTypes.array,
    setNewScrapedData:PropTypes.func,
    setSaved: PropTypes.func,
    setShow: PropTypes.func,
    setShowPop: PropTypes.func,
    updateScrapeItems:PropTypes.func
}
export { CreateObjectModal, EditObjectModal };