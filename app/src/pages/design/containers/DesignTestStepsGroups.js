import React, {useState} from "react";
import { useDispatch } from "react-redux"
import { Dialog } from "primereact/dialog";
import CaptureModal from '../containers/CaptureScreenForFolderView';
import DesignModal from '../containers/DesignTestStepForFolderView';
import { TabView, TabPanel } from 'primereact/tabview';
import '../styles/designTestStepsGroups.scss'
import { dontShowFirstModule, setUpdateScreenModuleId } from "../designSlice";






function DesignTestStepsGroups(params) {
    const dispatch = useDispatch();
    const [visibleCaptureElement, setVisibleCaptureElement] = useState(true);
    const [visibleDesignStep, setVisibleDesignStep] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [moduleData, setModuleData] = useState({});
    const headerTemplate = (
        <>
            <div>
                <h5 className='dailog_headerGroups'>{params.fetchingDetailsForGroup['parent']['name'] && params.fetchingDetailsForGroup['parent']['name'].length>20?params.fetchingDetailsForGroup['parent']['name'].trim().substring(0,20)+'...' : params.fetchingDetailsForGroup['parent']['name']}</h5>
                <TabView className="tabViewHeader" activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} >
                    <TabPanel className="tabPanelforHeader" header="Element Repository"/>
                    <TabPanel className="tabPanelforHeader" header="Design Test Steps"/>
                </TabView>
            </div>
        </>
    );
    return(
        <div className="designGroup_dialog_div">
            <Dialog className='designGroup_dialog_box' header={headerTemplate} visible={params.visibleDesignStepGroups} position='right' style={{ width: '85%', color: 'grey', height: '95%', margin: '0px' }} onHide={()=>{if(Object.keys(moduleData).length>0){params.setVisibleDesignStepGroups(false);dispatch(setUpdateScreenModuleId(moduleData));dispatch(dontShowFirstModule(true))}else{params.setVisibleDesignStepGroups(false)}}}>
                <div className='designTestGroups'>
                    
                {activeIndex === 0 ?<div>
                    <CaptureModal visibleCaptureElement={visibleCaptureElement} setVisibleCaptureElement={setVisibleCaptureElement} fetchingDetails={params.fetchingDetailsForGroup['parent']} testSuiteInUse={params.testSuiteInUse} setFetchingDetails={params.setFetchingDetailsForGroup} setModuleData={setModuleData}/>
                    </div>  
                    :
                    <div>
                        <DesignModal   fetchingDetails={params.fetchingDetailsForGroup} appType={params.appType} visibleDesignStep={visibleDesignStep} setVisibleDesignStep={setVisibleDesignStep} impactAnalysisDone={params.impactAnalysisDone} testcaseDetailsAfterImpact={params.testcaseDetailsAfterImpact} setImpactAnalysisDone={params.setImpactAnalysisDone} testSuiteInUse={params.testSuiteInUse}/>
                    </div>  }   
                </div>
            </Dialog>
        </div>
    )
}
export default DesignTestStepsGroups;