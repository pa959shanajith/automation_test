import React, { useEffect } from 'react';
import { ModalContainer, ScrollBar } from '../../global'; 
import "../styles/UpdateMapPopup.scss";
import "../styles/ImportMapStatusPopup.scss";

//use : Renders Module Update Popup 

const ImportMapPopup = ( {testCasesErrorList, scenariosErrorList, errorRows} ) => {


    useEffect(()=>{
    }, []);

    return (
        <>
            <div className="import_map_status_modal">
                    
                    <div className="um__updateMapBody">
                        <div className="um_lbl um_mainMargin">Import Mappings Status</div>
                            {errorRows.length>0&&<>
                                <div className='import_popup_error_rows'>
                                    <label className='import_popup_label'> 
                                        Invalid Rows:
                                    </label>
                                    <span className='error_rows_label'>{errorRows.map((row,i)=>(i!==0?', '+row:row))}
                                    </span>
                                </div>
                            </>}
                        <div className="um_lists">
                            {testCasesErrorList.length>0 && <>
                            <div className="um__tclist">
                                <div className="um_lbl um_lblMargin">Not Found TestCases</div>
                                <div className="um__tclistContaniner">
                                    <div className="um_listCanvas">
                                        <div className="um_listMinHeight">
                                            <div className="um_listContent" id="umUpdateId">
                                            <ScrollBar scrollId="umUpdateId" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                                            <>
                                            { testCasesErrorList.map((custname, i) => 
                                                <div className="um_listItem"><span id='update_status' className="status_error"></span><span key={i}>{custname}</span></div>) }
                                            </>
                                            </ScrollBar>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </>}
                            {/* {warningList.length>0 && <>
                            <div className="um__tclist">
                                <div className="um_lbl um_lblMargin">Multiple Matches Found</div>
                                <div className="um__tclistContaniner">
                                    <div className="um_listCanvas">
                                        <div className="um_listMinHeight">
                                            <div className="um_listContent" id="umUpdateId">
                                            <ScrollBar scrollId="umUpdateId" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                                            <>
                                            { warningList.map((custname, i) => 
                                                <div className="um_listItem"><span id='update_status' className="status_multi_match"></span><span key={i}>{custname}</span></div>) }
                                            </>
                                            </ScrollBar>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </>} */}
                            {scenariosErrorList.length>0 && <>
                            <div className="um__tclist">
                                <div className="um_lbl um_lblMargin">Not Found Scenario</div>
                                <div className="um__tclistContaniner">
                                    <div className="um_listCanvas">
                                        <div className="um_listMinHeight">
                                            <div className="um_listContent" id="umUpdateId">
                                            <ScrollBar scrollId="umUpdateId" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                                            <>
                                            { scenariosErrorList.map((custname, i) => 
                                                <div className="um_listItem"><span id='update_status' className="status_error"></span><span key={i}>{custname}</span></div>) }
                                            </>
                                            </ScrollBar>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </>}
                    </div>



                </div>
                {/* // }
                //     modalClass=" modal-sm" /> */}
            </div>
        </>
    );
} 

export default ImportMapPopup;