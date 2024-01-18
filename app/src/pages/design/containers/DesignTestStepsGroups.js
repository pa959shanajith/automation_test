import React, {useState} from "react";
import { Dialog } from "primereact/dialog";
import CaptureModal from '../containers/CaptureScreenForFolderView';
import DesignModal from '../containers/DesignTestStepForFolderView';
import { TabView, TabPanel } from 'primereact/tabview';
import '../styles/designTestStepsGroups.scss'







function DesignTestStepsGroups(params) {
    const [visibleCaptureElement, setVisibleCaptureElement] = useState(true);
    const [visibleDesignStep, setVisibleDesignStep] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const headerTemplate = (
        <>
            <div>
                <h5 className='dailog_headerGroups'>Design Steps Groups</h5>
                <TabView className="tabViewHeader" activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} >
                    <TabPanel header="Element Reposiotry"></TabPanel>
                    <TabPanel header="Design Test Steps"></TabPanel>
                </TabView>
            </div>
        </>
    );
    return(
        <>
            <Dialog className='designGroup_dialog_box' header={headerTemplate} visible={params.visibleDesignStepGroups} position='right' style={{ width: '85%', color: 'grey', height: '95%', margin: '0px' }} onHide={()=>params.setVisibleDesignStepGroups(false)}>
                <div className='designTestGroups'>
                    
                {activeIndex === 0 ?<div>
                    <CaptureModal visibleCaptureElement={visibleCaptureElement} setVisibleCaptureElement={setVisibleCaptureElement} fetchingDetails={params.fetchingDetailsForGroup['parent']} testSuiteInUse={params.testSuiteInUse}/>
                    </div>  
                    :
                    <div>
                        <DesignModal   fetchingDetails={params.fetchingDetailsForGroup} appType={params.appType} visibleDesignStep={visibleDesignStep} setVisibleDesignStep={setVisibleDesignStep} impactAnalysisDone={params.impactAnalysisDone} testcaseDetailsAfterImpact={params.testcaseDetailsAfterImpact} setImpactAnalysisDone={params.setImpactAnalysisDone} testSuiteInUse={params.testSuiteInUse}/>
                    </div>  }   
                </div>
            </Dialog>
        </>
    )
}
export default DesignTestStepsGroups;