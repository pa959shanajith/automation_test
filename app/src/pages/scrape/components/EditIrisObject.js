import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { ModalContainer, RedirectPage } from '../../global';
import { irisObjectTypes } from './ListVariables';
import { updateIrisDataset, userObjectElement_ICE } from '../api';
import "../styles/EditIrisObject.scss";

const EditIrisObject = props => {

    const history = useHistory();
    const [selectedType, setSelectedType] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    useEffect(()=>{
        setSelectedType(props.utils.object.tag.split(";").pop() || "unrecognizableobject");
        setSelectedStatus(0);
        //eslint-disable-next-line
    }, [])

    const onSelectType = event => {
        setSelectedType(event.target.value);
    }

    const onSelectStatus = event => {
        setSelectedStatus(event.target.value);
    }

    const submitData = () => {
        let existingType = props.utils.object.tag.split(";").pop() || "unrecognizableobject";
        
        let data = {
            "_id": (props.utils.object.objId || ''),
            "cord": props.utils.cord,
            "type": selectedType, 
            "xpath": props.utils.object.xpath,
            "status": selectedStatus,
            ...props.taskDetails
        };

        let irisAppType = `saveirisimage_${props.taskDetails.appType}`;

        if (!props.utils.object.objId) props.setShowPop({title: "IRIS Object Details", content: "Please save the object first."});
        else {
            updateIrisDataset(data)
            .then(val => {
                props.setShow(false);
                if(val === 'success'){
                    // props.setShowPop({title: "IRIS Object Details", content: "Submitted Successfully."});
                    if(selectedType !== existingType){
                        props.utils.modifyScrapeItem(props.utils.object.val, {
                            custname: props.utils.object.custname,
                            tag: `iris;${selectedType}`,
                            url: props.utils.object.url,
                            xpath: props.utils.object.xpath,
                            editable: true
                        }, true);
                    }
                    
                    let args =[irisAppType, props.utils.cord, selectedType, (props.utils.object.objId || '')];
                    userObjectElement_ICE(args)
                        .then(datairis => {
                            let msg = null;
                            if (datairis === "Invalid Session") return RedirectPage(history);
                            else if (datairis === "unavailableLocalServer") msg ={title: "IRIS Object Details", content: "Submitted successfully but failed to save IRIS image, ICE not available."};
                            else if (datairis === "fail" && selectedType === "unrecognizableobject") msg = {title: "IRIS Object Details", content: "Submitted successfully."};
                            else if (datairis === "fail") msg = {title: "IRIS Object Details", content: "Submitted successfully but failed to save IRIS image."};
                            else msg = {title: "IRIS Object Details", content: "Submitted Successfully. IRIS image saved."};
                            if (msg) props.setShowPop(msg);
                            props.setShow(false);
                        })
                        .catch(error => {
                            props.setShowPop({title: "IRIS Object Details", content: "Submitted successfully but failed to save IRIS image."});
                            props.setShow(false);
                            console.error("ERROR::::", error);
                        });
                }
                else props.setShowPop({title: "IRIS Object Details", content: "Failed to updated IRIS Object Details."});
            })
            .catch(error => {
                props.setShowPop({title: "IRIS Object Details", content: "Failed to updated IRIS Object Details."});
                props.setShow(false);
                console.error("ERROR::::", error);
            });
        }
    }

    return (
        <div className="ss__ei_container">
            <ModalContainer 
                title="IRIS Object Details"
                content={
                    <div className="ss__ei_body">
                        <div className="ss__ei_info_panel">
                            <span>Object Type:</span>
                            <span><select className="ss__ei_objType" value={selectedType} onChange={onSelectType}>
                                <option className="ss__ei_options" disabled value={0}>Select Object Type</option>
                                { Object.keys(irisObjectTypes).map((key, i) => <option key={i} className="ss__ei_options" value={key}>
                                        {irisObjectTypes[key].name}
                                    </option>) }
                            </select></span>
                            { irisObjectTypes[selectedType] && irisObjectTypes[selectedType].states.length > 1 ?
                                <> 
                                <span>Object Status:</span>
                                <span>
                                    <select className="ss__ei_objType" value={selectedStatus} onChange={onSelectStatus}>
                                        <option className="ss__ei_options" value={0}>Unchecked</option>
                                        <option className="ss__ei_options" value={1}>Checked</option>
                                    </select>
                                </span>
                                </>
                                : null }
                            <span>Object Tag:</span>
                            <span>{props.utils.object.xpath.split(";").pop()}</span>
                        </div>
                        <div className="ss__ei_img_panel">
                            <span>Object Image</span>
                            <div className="ss__ei_img_box">
                                <img className="ss__ei_img" alt="iris" src={`data:image/PNG;base64,${props.utils.cord.substring(2, props.utils.cord.length - 1)}`}/>
                            </div>
                        </div>
                    </div>
                }
                footer={
                    <button onClick={submitData}>Submit</button>
                }
                close={()=>props.setShow(false)}
            />
        </div>
    ); 
}

export default EditIrisObject;