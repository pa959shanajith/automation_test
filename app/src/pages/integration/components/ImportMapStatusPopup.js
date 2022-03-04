import React, { useEffect } from 'react';
import { ModalContainer, ScrollBar } from '../../global'; 
import "../styles/UpdateMapPopup.scss";
import "../styles/ImportMapStatusPopup.scss";

//use : Renders Module Import Mapping Status Popup 

const ImportMapStatusPopup = ( {testCasesErrorList, scenariosErrorList, errorRows, importStatus} ) => {

    useEffect(()=>{
    }, []);

    return (
        <>
            <div className="import_map_status_modal">
                    <div className="um__updateMapBody">
                        {importStatus==="Partial"?
                            <div className="import_status_partial um_mainMargin">Import Mappings partially successful!</div>
                            :
                            <div className="import_status_noMappings um_mainMargin">Import Mappings unsuccessful!</div>
                        }
                            {errorRows.length>0&&<>
                                <div className='import_popup_error_rows'>
                                    <label className='import_popup_label' title ="Rows containing N-N mappings or empty TestCaseIDs/Scenarios."> 
                                        Invalid Rows:
                                    </label>
                                    <span className='error_rows_label'>{errorRows.map((row,i)=>(i!==0?', '+row:row))}
                                    </span>
                                </div>
                            </>}
                            {testCasesErrorList.length>0 && <>
                                <div className="error_lists">
                                    <div className="um__tclist">
                                        <div className="um_lbl um_lblMargin" title="TestCaseIDs Not Found">Not Found TestCases</div>
                                        <div className="um__tclistContaniner">
                                            <div className="um_listCanvas">
                                                <div className="um_listMinHeight">
                                                    <div className="um_listContent" id="umUpdateId">
                                                    <ScrollBar scrollId="umUpdateId" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                                                    <>
                                                    { testCasesErrorList.map((e, i) => 
                                                        <div className="error_listItem">
                                                            <span id='update_status' className="status_error">
                                                            </span>
                                                            <span key={i}>Row : {e.row} (
                                                            {e.tcId.map((tc,i)=>(i!==0?', '+tc:tc))})
                                                            </span>
                                                        </div>) }
                                                    </>
                                                    </ScrollBar>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>}
                            {scenariosErrorList.length>0 && <>
                                <div className="error_lists">
                                    <div className="um__tclist">
                                        <div className="um_lbl um_lblMargin" title="Scenarios Not Found">Not Found Scenario</div>
                                        <div className="um__tclistContaniner">
                                            <div className="um_listCanvas">
                                                <div className="um_listMinHeight">
                                                    <div className="um_listContent" id="umUpdateId">
                                                    <ScrollBar scrollId="umUpdateId" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                                                    <>
                                                    { scenariosErrorList.map((e, i) => 
                                                        <div className="error_listItem"><span id='update_status' className="status_error"></span>
                                                        <span key={i}>Row : {e.row} (
                                                        {e.snrNames.map((snr,i)=>(i!==0?', '+snr:snr))})
                                                        </span>
                                                        </div>) }
                                                    </>
                                                    </ScrollBar>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>}
                </div>
            </div>
        </>
    );
} 

export default ImportMapStatusPopup;