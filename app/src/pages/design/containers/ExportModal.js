import React, { useState } from 'react';
import { RedirectPage, Messages as MSG, setMsg } from '../../global';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { exportScreenToExcel, getScrapeDataScreenLevel_ICE } from '../api';
import ModalContainer from '../../global/components/ModalContainer';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';


const ExportModal = props => {
    const [tempIdCounter, setTempIdCounter] = useState(1);
    const ftypeRef = useState(undefined)
    const history = useNavigate();
    const exportTypes = [
        { value: "json", name: "JSON" },
        // { value: "excel", name: "Excel", disabled: appType !== "Web"}
    ]
    const [objects, setObjects] = useState([{ objType: "", tempId: tempIdCounter }]);
    // const { appType, screenId, screenName, versionnumber, projectId, testCaseId } = useSelector(state => state.plugin.CT);
    const setOverlay = props.setOverlay
    let appType = props.appType;
    const screenId = props.fetchingDetails["_id"]
    const projectId = props.fetchingDetails.projectID
    const screenName = props.fetchingDetails["name"]
    let versionnumber = 0
    const [disableExport, setDisableExport] = useState(false);
    const Content = () => {
        return (
            <div className='mp__import-popup'>
                <div>
                    <label>Export As: </label>
                    {objects.map((object, index) =>
                        // <select  data-test="addObjectTypeSelect" ref={ftypeRef} className="imp-inp" value={object.objType} onChange={(e)=>handleType(e, index)}>
                        //     <option disabled value="">Select Export Format</option>
                        //     { exportTypes.map( (exportType, i) =>
                        //         <option key={i} value={`${exportType.value}`}>{exportType.name}</option>
                        //     ) }
                        // </select>
                        <Dropdown ref={ftypeRef} className="imp-inp" value={object.objType} onChange={(e) => handleType(e, index)} options={exportTypes} optionLabel="name" placeholder="Select Export Format" style={{width:'20rem', marginLeft:'2.6rem'}}/>
                    )}
                </div>
            </div>
        )
    }

    const Footer = () => {
        return (
            <Button data-test="export" size="small" disabled={!disableExport} onClick={onExport} label="Export"></Button>
        )
    }

    const onExport = () => {
        let objectsBlob;

        let versionnumber = 0
        let filename;
        let hasData = false;
        let responseData;
        let temp = {}
        var err = validate([ftypeRef])
        if (err) return
        setOverlay('Exporting ...')
        if (objects[0].objType === "json") {
            getScrapeDataScreenLevel_ICE(appType, screenId, projectId, "")
                .then(data => {
                    {
                        if (data === "Invalid Session") return RedirectPage(history);

                        if (typeof data === 'object' && data.view.length > 0) {
                            hasData = true;
                            if (appType === "Webservice") {
                                let { view, reuse, ...info } = data;
                                temp['scrapeinfo'] = info;
                                temp['reuse'] = reuse;
                                temp['view'] = view;
                            } else temp = data;

                            temp['appType'] = props.appType;
                            temp['screenId'] = props.fetchingDetails["_id"];
                            temp['versionnumber'] = 0;
                            responseData = JSON.stringify(temp, undefined, 2);
                        }
                        if (hasData) {
                            filename = "Screen_" + props.fetchingDetails["name"] + ".json";
                            objectsBlob = new Blob([responseData], {
                                type: "text/json"
                            });
                            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                                window.navigator.msSaveOrOpenBlob(objectsBlob, filename);
                            }
                            else {
                                let a = window.document.createElement('a');
                                a.href = window.URL.createObjectURL(objectsBlob);
                                a.download = filename;
                                a.className = "exportScreen"
                                a.click();
                                // document.body.appendChild(a);
                                // document.body.removeChild(a);
                                props.toastSuccess("Data Exported Successfully.");
                            }
                        } else props.toastError('Failed to export data.');
                    }
                })
                .catch(error => console.error(error));
        }
        else if (objects[0].objType === "excel") {
            exportScreenToExcel(appType, screenId, projectId, "")
                .then(data => {
                    if (data instanceof ArrayBuffer) {
                        filename = "Screen_" + screenName + ".xlsx";

                        objectsBlob = new Blob([data], {
                            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        });
                        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                            window.navigator.msSaveOrOpenBlob(objectsBlob, filename);
                        }
                        else {
                            let a = window.document.createElement('a');
                            a.href = window.URL.createObjectURL(objectsBlob);
                            a.download = filename;
                            a.className = "exportScreen"
                            // document.body.appendChild(a);
                            // document.body.removeChild(a);
                            a.click();
                            props.toastSuccess("Data Exported Successfully.");
                        }
                    } else props.toastError('Failed to export excel.');
                })
                .catch(error => console.error(error));
        }
        setOverlay('')
        props.setShow(false)
    }

    const handleType = (event, index) => {
        let updatedObjects = [...objects];
        updatedObjects[index].objType = event.target.value;
        setObjects(updatedObjects);
        setDisableExport(true);
    }

    const validate = (arr) => {
        var err = false;
        arr.forEach((e) => {
            if (e.current) {
                if (e.current.props) {
                    if (!e.current.props.value || e.current.props.value === 'def-option') {
                        err = true
                    }
                }
                else {
                    e.current.style.borderColor = 'black'
                    if (!e.current.value || e.current.value === 'def-option') {
                        e.current.style.borderColor = 'red'
                        err = true
                    }
                }
            }
        })
        return err
    }

    return (
        <ModalContainer
            show={props.show === "exportModal"}
            title={'Export'}
            modalClass="modal-md"
            close={() => props.setShow(false)}
            content={<Content />}
            footer={<Footer />}
            width="35rem"
        />
    )

}


export default ExportModal;