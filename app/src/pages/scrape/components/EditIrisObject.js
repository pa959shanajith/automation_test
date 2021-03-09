import React, { useState, useEffect } from 'react';
import { ModalContainer } from '../../global';
import { irisObjectTypes } from './ListVariables';
import { updateIrisDataset } from '../api';
import "../styles/EditIrisObject.scss";

const EditIrisObject = props => {

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
        if(selectedType !== existingType){
			let data = {
                "_id": props.utils.object.objId,
                "cord": props.utils.cord,
                "type": selectedType, 
                "xpath": props.utils.object.xpath,
                "status": selectedStatus,
                ...props.taskDetails
            };

            if (!props.utils.object.objId) props.setShowPop({title: "IRIS Object Details", content: "Please save the object first."});
            else {
                updateIrisDataset(data)
                .then(val => {
                    props.setShow(false);
                    if(val === 'success'){
                        props.setShowPop({title: "IRIS Object Details", content: "Submitted Successfully."});
                        props.utils.modifyScrapeItem(props.utils.object.val, {
                            custname: props.utils.object.custname,
                            tag: `iris;${selectedType}`,
                            url: props.utils.object.url,
                            xpath: props.utils.object.xpath,
                            editable: true
                        }, true);
                    }
                    else props.setShowPop({title: "IRIS Object Details", content: "Failed to updated IRIS Object Details."});
                })
                .catch(error => console.error(error));
            }
		}
		else{
			props.setShow(false);
			props.setShowPop({title: "IRIS Object Details", content: "Submitted Successfully."});
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