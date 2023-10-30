import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModalContainer, RedirectPage, Messages as MSG, setMsg } from '../../global';
import { irisObjectTypes } from './ListVariables';
import { updateIrisDataset, userObjectElement_ICE } from '../api';
import "../styles/EditIrisObject.scss";
import PropTypes from 'prop-types'
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
const EditIrisObject = props => {

    const history = useNavigate();
    const [selectedType, setSelectedType] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    useEffect(()=>{
        let objType = props.cordData.objectDetails.xpath.split(";")[6];
        let objStatus = props.cordData.objectDetails.xpath.split(";")[7];
        if (objType==='' || objType==='Unable to recognize object type') objType = "unrecognizableobject";
        setSelectedType(objType);
        setSelectedStatus(objStatus);
    }, [props.cordData])

    const onSelectType = event => {
        setSelectedType(event.target.value);
    }

    const onSelectStatus = event => {
        setSelectedStatus(event.target.value);

    }
    
    const submitData = () => {
        let existingType = props.cordData.objectDetails.xpath.split(";")[6] || "unrecognizableobject";
        let existingStatus = props.cordData.objectDetails.xpath.split(";")[7]

        let newXpath = props.cordData.objectDetails.xpath.split(';');
        newXpath.splice(6, 1, selectedType);
        newXpath.splice(7, 1, selectedStatus);
        newXpath = newXpath.join(';');
        
        let data = {
            "_id": (props.cordData.objectDetails.objId || ''),
            "cord": props.cordData.cord,
            "type": selectedType, 
            "xpath": newXpath,
            "status": parseInt(selectedStatus),
            ...props.taskDetails
        };

        let irisAppType = `saveirisimage_${props.taskDetails.appType}`;

        if (!props.cordData.objectDetails.objId) {
            props.setShow(false);
            props.toastError(MSG.SCRAPE.ERR_OBJ_SAVE);
        }
        else {
            updateIrisDataset(data)
            .then(val => {
                if(val === 'success'){
                    if(selectedType !== existingType || selectedStatus !== existingStatus){
                        props.cordData.modifyScrapeItem(props.cordData.objectDetails.val, {
                            custname: props.cordData.objectDetails.custname,
                            tag: `iris;${selectedType}`,
                            url: props.cordData.objectDetails.url,
                            xpath: newXpath,
                            editable: true
                        }, true);
                    }
                    
                    let args =[irisAppType, props.cordData.cord, selectedType, (props.cordData.objectDetails.objId || '')];
                    userObjectElement_ICE(args)
                        .then(datairis => {
                            let msg = null;
                            if (datairis === "Invalid Session") return RedirectPage(history);
                            else if (datairis === "unavailableLocalServer") msg =MSG.SCRAPE.WARN_IRIS_SAVE;
                            else if (datairis === "fail" && selectedType === "unrecognizableobject") msg = MSG.SCRAPE.SUCC_SUBMIT;
                            else if (datairis === "fail") msg = MSG.SCRAPE.WARN_IRIS_SAVE_FAIL;
                            else msg = MSG.SCRAPE.SUCC_IRIS_SAVE;
                            if (msg)  props.toastSuccess(msg);
                            props.setShow(false);
                        })
                        .catch(error => {
                            props.toastError(MSG.SCRAPE.WARN_IRIS_SAVE_FAIL);
                            props.setShow(false);
                            console.error("ERROR::::", error);
                        });
                        props.toastSuccess(MSG.SCRAPE.SUCC_OBJ_CHANGE);
                }
                else {
                    props.setShow(false);
                    props.toastError(MSG.SCRAPE.ERR_UPDATE_IRIS);
                }
            })
            .catch(error => {
                props.toastError(MSG.SCRAPE.ERR_UPDATE_IRIS);
                props.setShow(false);
                console.error("ERROR::::", error);
            });
        }
        props.setElementProperties(false)
        props.saveScrapedObjects();
    }
    const footerContent = (
        <div>
          {/* <div style={{ position: 'absolute', fontStyle: 'italic' }}><span style={{ color: 'red' }}>*</span>Click on value fields to edit element properties.</div> */}
          <Button label="Cancel" onClick={() => { props.setElementProperties(false) }} className="p-button-text" style={{ borderRadius: '20px', height: '2.2rem' }} />
          <Button label="Submit" onClick={submitData} autoFocus style={{ height: '2.2rem' }} />
        </div>
      )

    return (
        <div className="ss__ei_container">
            <Dialog header="IRIS Object Details" className='irisPopUp' footer={footerContent} visible={props.elementPropertiesVisible} onHide={() => props.setElementProperties(false)}
                
                // footer={
                //     <button data-test="submit" onClick={submitData}>Submit</button>
                // }
                // close={() => props.setShow(false)}
            >
                 <div className="ss__ei_body">
                        <div className="ss__ei_info_panel">
                            <span data-test="objTypeHeading">Object Type:</span>
                            <span><select data-test="selectObjType" className="ss__ei_objType" value={selectedType} onChange={onSelectType}>
                                <option className="ss__ei_options" disabled value={0}>Select Object Type</option>
                                { Object.keys(irisObjectTypes).map((key, i) => <option key={i} className="ss__ei_options" value={key}>
                                        {irisObjectTypes[key].name}
                                    </option>) }
                            </select></span>
                            { irisObjectTypes[selectedType] && irisObjectTypes[selectedType].states.length > 1 ?
                                <> 
                                <span data-test="objStatusHeading">Object Status:</span>
                                <span>
                                    <select data-test="selectobjStatus" className="ss__ei_objType" value={selectedStatus} onChange={onSelectStatus}>
                                        <option className="ss__ei_options" value={"0"}>Unchecked</option>
                                        <option className="ss__ei_options" value={"1"}>Checked</option>
                                    </select>
                                </span>
                                </>
                                : null }
                            <span data-test="objTag">Object Tag:</span>
                            <span data-test="objTagValue">{props.cordData.objectDetails.xpath.split(";").pop()}</span>
                        </div>
                        <div className="ss__ei_img_panel">
                            <span>Object Image</span>
                            <div className="ss__ei_img_box">
                                <img    
                                    data-test="irirsImage" 
                                    className="ss__ei_img" 
                                    alt="iris" 
                                    src={`data:image/PNG;base64,
                                        ${getImage(props.cordData?.cord)}
                                    `}
                                />
                            </div>
                        </div>
                    </div>
             </Dialog>
        </div>
    ); 
}
EditIrisObject.propTypes={
    cordData:PropTypes.object,
    taskDetails:PropTypes.object,
    setShow:PropTypes.func,
    setShowPop:PropTypes.func
}

const getImage = base64 => {
    let newBase64;
    if (base64.substring(base64.length-2) === "''")
        newBase64 = base64.substring(3, base64.length - 2);
    else 
        newBase64 = base64.substring(2, base64.length - 1)
    return newBase64;
}

export default EditIrisObject;