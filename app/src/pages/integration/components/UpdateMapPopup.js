import React, { useEffect } from 'react';
import { ModalContainer, ScrollBar } from '../../global'; 
import "../styles/UpdateMapPopup.scss";

//use : Renders Module Update Popup 

const UpdateMapPopup = ( {updateList, errorList, warningList, clearSelections} ) => {

    useEffect(()=>{
    }, []);

    return (
        <>
            <div className="update-map-Modal">
                <ModalContainer 
                    title="Update Mapping Status"  
                    close={()=>{clearSelections()}} 
                    footer={<><div>
                        <button type="button" onClick={()=>{clearSelections()}} >OK</button>
                    </div></>}
                    content= {
                    <div className="um__updateMapBody">
                        <div className="um_lbl um_mainMargin">Test Case Update Status</div>
                        <div className="um_lists">
                            {updateList.length>0 && <>
                            <div className="um__tclist">
                                <div className="um_lbl um_lblMargin">Found and Updated</div>
                                <div className="um__tclistContaniner">
                                    <div className="um_listCanvas">
                                        <div className="um_listMinHeight">
                                            <div className="um_listContent" id="umUpdateId">
                                            <ScrollBar scrollId="umUpdateId" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                                            <>
                                            { updateList.map((custname, i) => 
                                                <div className="um_listItem"><span id='update_status' className="status_updated"></span><span key={i}>{custname}</span></div>) }
                                            </>
                                            </ScrollBar>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </>}
                            {warningList.length>0 && <>
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
                            </>}
                            {errorList.length>0 && <>
                            <div className="um__tclist">
                                <div className="um_lbl um_lblMargin">Not Found</div>
                                <div className="um__tclistContaniner">
                                    <div className="um_listCanvas">
                                        <div className="um_listMinHeight">
                                            <div className="um_listContent" id="umUpdateId">
                                            <ScrollBar scrollId="umUpdateId" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                                            <>
                                            { errorList.map((custname, i) => 
                                                <div className="um_listItem"><span id='update_status' className="status_not_found"></span><span key={i}>{custname}</span></div>) }
                                            </>
                                            </ScrollBar>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </>}
                    </div>
                </div>}
                    modalClass=" modal-sm" />
                </div>
        </>
    );
} 

export default UpdateMapPopup;