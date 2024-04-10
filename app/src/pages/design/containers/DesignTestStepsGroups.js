import React, {useState} from "react";
import { useDispatch } from "react-redux"
import { Dialog } from "primereact/dialog";
import CaptureModal from '../containers/CaptureScreenForFolderView';
import DesignModal from '../containers/DesignTestStepForFolderView';
import { TabView, TabPanel } from 'primereact/tabview';
import '../styles/designTestStepsGroups.scss'
import { dontShowFirstModule, setUpdateScreenModuleId } from "../designSlice";






function DesignTestStepsGroups(params) {
    const {assignUser} = params;
    const dispatch = useDispatch();
    const [visibleCaptureElement, setVisibleCaptureElement] = useState(true);
    const [visibleDesignStep, setVisibleDesignStep] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [moduleData, setModuleData] = useState({});
    const tabsPanelInfo = [{ name: "Element Repository", "iconpath": ["static/imgs/elem_repo_tab_one_blue.svg", "static/imgs/elem_repo_tab_one_black.svg"] }, { name: "Design Test Steps", "iconpath": ["static/imgs/elem_repo_tab_two_black.svg", "static/imgs/elem_repo_tab_two_blue.svg"] }]
    const TabTemplate = (name, iconpath) => {
        return <div className="flex flex-row">
            <div className="mr-2">
                <img className="w-full" src={iconpath[activeIndex]} alt="" />
            </div>
            <div>{name}</div>
        </div>
    };
    const headerTemplate = (
        <>
            <div>
                <h5 className='dailog_headerGroups repo_group_header'>{params.fetchingDetailsForGroup['parent']['name'] && params.fetchingDetailsForGroup['parent']['name'].length>20?params.fetchingDetailsForGroup['parent']['name'].trim().substring(0,20)+'...' : params.fetchingDetailsForGroup['parent']['name']}
                {assignUser === false &&
                    <img
                        style={{ height: '24px', width: '24px', opacity: 1 }}
                        src="static/imgs/eye_view_icon.svg"
                        className=""
                    />}</h5>
                <TabView className="tabViewHeader" activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} >
                    {
                        tabsPanelInfo?.map(({name, iconpath})=>{
                            return <TabPanel className="elem_repo_tab_heading" header={TabTemplate(name, iconpath)}></TabPanel>
                        })
                    }
                </TabView>
            </div>
        </>
    );
    return(
        <div className="designGroup_dialog_div">
            <Dialog className='designGroup_dialog_box' header={headerTemplate} visible={params.visibleDesignStepGroups} position='right' style={{ width: '85%', color: 'grey', height: '95%', margin: '0px' }} onHide={()=>{if(Object.keys(moduleData).length>0){params.setVisibleDesignStepGroups(false);dispatch(setUpdateScreenModuleId(moduleData));dispatch(dontShowFirstModule(true))}else{params.setVisibleDesignStepGroups(false)}}}>
                <div className='designTestGroups'>
                    
                {activeIndex === 0 ?<div>
                    <CaptureModal visibleCaptureElement={visibleCaptureElement} setVisibleCaptureElement={setVisibleCaptureElement} fetchingDetails={params.fetchingDetailsForGroup['parent']} testSuiteInUse={params.testSuiteInUse} setFetchingDetails={params.setFetchingDetailsForGroup} setModuleData={setModuleData} assignUser={assignUser}/>
                    </div>  
                    :
                    <div>
                        <DesignModal  fetchingDetails={params.fetchingDetailsForGroup} appType={params.appType} visibleDesignStep={visibleDesignStep} setVisibleDesignStep={setVisibleDesignStep} impactAnalysisDone={params.impactAnalysisDone} testcaseDetailsAfterImpact={params.testcaseDetailsAfterImpact} setImpactAnalysisDone={params.setImpactAnalysisDone} testSuiteInUse={params.testSuiteInUse} assignUser={assignUser}/>
                    </div>  }   
                </div>
            </Dialog>
        </div>
    )
}
export default DesignTestStepsGroups;