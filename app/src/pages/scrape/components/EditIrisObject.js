import React, { useState, useEffect } from 'react';
import { ModalContainer } from '../../global';
import { irisObjectTypes } from './ListVariables';
import { updateIrisDataset } from '../api';
import "../styles/EditIrisObject.scss";

const EditIrisObject = props => {

    const [selectedType, setSelectedType] = useState("");

    useEffect(()=>{
        setSelectedType(props.utils.object.tag.split(";").pop() || "unrecognizableobject")
    }, [])

    const onSelectType = event => {
        setSelectedType(event.target.value);
    }

    const submitData = () => {
        let existingType = props.utils.object.tag.split(";").pop() || "unrecognizableobject";
        if(selectedType !== existingType){
			let data = {
                "_id": props.utils.object.objId,
                "cord": props.utils.cord,
                "type": selectedType, 
                "xpath": props.utils.object.xpath,
                ...props.taskDetails
            };

            if (!props.utils.object.objId) props.setShowPop({title: "Iris Object Details", content: "Please save the object first."});
            else {
                updateIrisDataset(data)
                .then(val => {
                    props.setShow(false);
                    if(val === 'success'){
                        props.setShowPop({title: "Iris Object Details", content: "Submitted Successfully."});
                        // for(var i=0;i<viewString.view.length;i++){
                        //     if(viewString.view[i].xpath == obj_xpath){
                        //         viewString.view[i].objectType = user_obj_type;
                        //         break;
                        //     }
                        // }
                    }
                    else props.setShowPop({title: "Iris Object Details", content: "Failed to updated Iris Object Details."});
                })
                .catch(error => console.error(error));
            }
		}
		else{
			props.setShow(false);
			props.setShowPop({title: "Iris Object Details", content: "Submitted Successfully."});
		}
    }

    return (
        <div className="ss__ei_container">
            <ModalContainer 
                title="Iris Object Details"
                content={
                    <div className="ss__ei_body">
                        <div className="ss__ei_info_panel">
                            <span>Object Type:</span>
                            <span><select className="ss__ei_objType" value={selectedType} onChange={onSelectType}>
                                <option className="ss__ei_options" disabled selected value={0}>Select Object Type</option>
                                { irisObjectTypes.map(option => <option className="ss__ei_options" value={option.val}>
                                        {option.name}
                                    </option>) }
                            </select></span>
                            <span>Object Text:</span>
                            <span>{props.utils.object.irisText || "Undefined"}</span>
                            <span>Object Tag:</span>
                            <span>{props.utils.object.xpath.split(";").pop()}</span>
                        </div>
                        <div className="ss__ei_img_panel">
                            <img className="ss__ei_img" src={`data:image/PNG;base64,${props.utils.cord.substring(2, props.utils.cord.length - 2)}`}/>
                        </div>
                    </div>
                }
                footer={
                    <button onSubmit={submitData}>Submit</button>
                }
                close={()=>props.setShow(false)}
            />
        </div>
    ); 
}

export default EditIrisObject;