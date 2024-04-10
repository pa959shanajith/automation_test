import React, { useState } from "react";
import { useDispatch ,useSelector} from "react-redux"
import { Dialog } from "primereact/dialog";
import CaptureModal from '../containers/CaptureScreen';
import DesignModal from '../containers/DesignTestStep';
import { TabView, TabPanel } from 'primereact/tabview';
import '../styles/NavigatetoCaptureDesign.scss'
import { dontShowFirstModule, setUpdateScreenModuleId ,SetAdvanceDebug,SetDebuggerPoints} from "../designSlice";







function NavigatetoCaptureDesign(params) {
    const {assignUser} =params
    const dispatch = useDispatch();
    const [visibleCaptureElement, setVisibleCaptureElement] = useState(true);
    const [visibleDesignStep, setVisibleDesignStep] = useState(true);
    const [activeIndex, setActiveIndex] = useState(params.designClick?1:0);
    const [moduleData, setModuleData] = useState({});
    const advanceDebug=useSelector(state=>state.design.advanceDebug);

    const tabChnage =(e) =>{
       if(!params.designClick){
            if(params.fetchingDetails['children'].length > 0){
            setActiveIndex(e.index)
        }
     }
       else {
        if(params.fetchingDetails['parent']){
            setActiveIndex(e.index)
        }
       }
    }
    const tabsPanelInfo = [{ name: "Element Repository", "iconpath": ["static/imgs/elem_repo_tab_one_blue.svg", "static/imgs/elem_repo_tab_one_black.svg"] }, { name: "Design Test Steps", "iconpath": ["static/imgs/elem_repo_tab_two_black.svg", "static/imgs/elem_repo_tab_two_blue.svg"] }]
    const TabTemplate = (name, iconpath) => {
        return <div className="flex flex-row">
            <div className="mr-2 w-2">
                <img className="w-full" src={iconpath[activeIndex]} />
            </div>
            <div>{name}</div>
        </div>
    };
    const headerTemplate = (
        <>
            <div>
                <h5 className='header_Groups repo_group_header'>{params.fetchingDetails['name'] && params.fetchingDetails['name'].length > 20 ? params.fetchingDetails['name'].trim().substring(0, 20) + '...' : params.fetchingDetails['name']} {assignUser === false &&
                    <img
                        style={{ height: '24px', width: '24px', opacity: 1 }}
                        src="static/imgs/eye_view_icon.svg"
                        className=""
                    />} </h5>
                <TabView className="tabView_captureDesign" activeIndex={activeIndex} onTabChange={(e)=>tabChnage(e)} >
                    {
                        tabsPanelInfo?.map(({name, iconpath})=>{
                            return <TabPanel className="elem_repo_tab_heading" header={TabTemplate(name, iconpath)}></TabPanel>
                        })
                    }
                </TabView>
            </div>
        </>
    );

    // const onClose =()=>{
    //     params.setDesignClick(false);
    //     params.setVisibleCaptureAndDesign(false);
    // }
    return(
        <div className="captureDesign_dialog_div">
            <Dialog className='captureDesign_dialog_box' header={headerTemplate} visible={params.visibleCaptureAndDesign} position={advanceDebug?'left':'right'} style={{ width: '80vw', color: 'grey', height: '95%', margin: '0px' }} onHide={()=>{if(Object.keys(moduleData).length>0){params.setVisibleCaptureAndDesign(false);params.setDesignClick(false);dispatch(setUpdateScreenModuleId(moduleData));dispatch(dontShowFirstModule(true));dispatch(SetAdvanceDebug(false));dispatch(SetDebuggerPoints({push:'reset',points:[]}))}else{params.setVisibleCaptureAndDesign(false);params.setDesignClick(false);dispatch(SetAdvanceDebug(false));dispatch(SetDebuggerPoints({push:'reset',points:[]}))}}}>
                <div className='captureDesignGroups'>
                    
                {activeIndex === 0 ?<div>
                    <CaptureModal visibleCaptureElement={params.visibleCaptureAndDesign} setVisibleCaptureElement={params.setVisibleCaptureAndDesign} fetchingDetails={!params.designClick?params.fetchingDetails:Object.keys(moduleData).length>0?params.fetchingDetails:params.fetchingDetails['parent']} testSuiteInUse={params.testSuiteInUse} designClick={params.designClick} setDesignClick={params.setDesignClick} setFetchingDetails={params.setFetchingDetails} setModuleData={setModuleData}  assignUser={assignUser}/>
                    </div>  
                    :
                    <div>
                        <DesignModal  fetchingDetails={!params.designClick?params.fetchingDetails['children'][0]:Object.keys(moduleData).length>0?params.fetchingDetails['children'][0]:params.fetchingDetails} appType={params.appType} visibleDesignStep={visibleDesignStep} setVisibleDesignStep={setVisibleDesignStep} impactAnalysisDone={params.impactAnalysisDone} testcaseDetailsAfterImpact={params.testcaseDetailsAfterImpact} setImpactAnalysisDone={params.setImpactAnalysisDone} testSuiteInUse={params.testSuiteInUse}  assignUser={assignUser}/>
                    </div>  }   
                </div>
            </Dialog>
        </div>
    )
}
export default NavigatetoCaptureDesign;