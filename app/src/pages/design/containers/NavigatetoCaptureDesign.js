import React, {useEffect, useState} from "react";
import { useSelector, useDispatch } from "react-redux"
import { Dialog } from "primereact/dialog";
import CaptureModal from '../containers/CaptureScreen';
import DesignModal from '../containers/DesignTestStep';
import { TabView, TabPanel } from 'primereact/tabview';
import '../styles/NavigatetoCaptureDesign.scss'







function NavigatetoCaptureDesign(params) {
    const [visibleCaptureElement, setVisibleCaptureElement] = useState(true);
    const [visibleDesignStep, setVisibleDesignStep] = useState(true);
    const [activeIndex, setActiveIndex] = useState(params.designClick?1:0);
    // const changeScreenId = useSelector(state => state.design.changeScreen);

    // let screenId = localStorage.getItem('updatedScreen');

    // useEffect(()=>{
    //     if(screenId || changeScreenId){
    //         params.setVisibleCaptureAndDesign(true);
    //         //         console.log("inside the capture screen",i)
    //         params.setFetchingDetails(changeScreenId[0])
    //         console.log("changes screen id")
    //         // for(let i=0; i<params.dNodes.length; i++){
    //         //     if(params.dNodes[i]._id === changeScreenId.id && params.dNodes[i].childIndex === changeScreenId.index){
    //         //         params.setVisibleCaptureAndDesign(true);
    //         //         console.log("inside the capture screen",i)
    //         //         params.setFetchingDetails(params.dNodes[i])
    //         //     }else{
    //         //         console.log("outside");
    //         //     }
    //         // }
    //     }
    // },[screenId,changeScreenId])

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
    const headerTemplate = (
        <>
            <div>
            <h5 className='header_Groups'>{params.fetchingDetails['name'] && params.fetchingDetails['name'].length>20?params.fetchingDetails['name'].trim().substring(0,20)+'...' : params.fetchingDetails['name']}</h5>
                <TabView className="tabView_captureDesign" activeIndex={activeIndex} onTabChange={(e)=>tabChnage(e)} >
                    <TabPanel header="Element Repository"></TabPanel>
                    <TabPanel header="Design Test Steps"></TabPanel>
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
            <Dialog className='captureDesign_dialog_box' header={headerTemplate} visible={params.visibleCaptureAndDesign} position='right' style={{ width: '85%', color: 'grey', height: '95%', margin: '0px' }} onHide={()=>{params.setVisibleCaptureAndDesign(false);params.setDesignClick(false)}}>
                <div className='captureDesignGroups'>
                    
                {activeIndex === 0 ?<div>
                    <CaptureModal visibleCaptureElement={params.visibleCaptureAndDesign} setVisibleCaptureElement={params.setVisibleCaptureAndDesign} fetchingDetails={!params.designClick?params.fetchingDetails:params.fetchingDetails['parent']} testSuiteInUse={params.testSuiteInUse} designClick={params.designClick} setDesignClick={params.setDesignClick}/>
                    </div>  
                    :
                    <div>
                        <DesignModal  fetchingDetails={!params.designClick?params.fetchingDetails['children'][0]:params.fetchingDetails} appType={params.appType} visibleDesignStep={visibleDesignStep} setVisibleDesignStep={setVisibleDesignStep} impactAnalysisDone={params.impactAnalysisDone} testcaseDetailsAfterImpact={params.testcaseDetailsAfterImpact} setImpactAnalysisDone={params.setImpactAnalysisDone} testSuiteInUse={params.testSuiteInUse}/>
                    </div>  }   
                </div>
            </Dialog>
        </div>
    )
}
export default NavigatetoCaptureDesign;