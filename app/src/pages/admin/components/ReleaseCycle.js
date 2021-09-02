import React ,  { Fragment} from 'react';
import '../styles/ReleaseCycle.scss';

/*Component ReleaseCycle
  use: renders ReleaseCycle for Project Assign page
  todo: 
*/
    
const ReleaseCycle = (props) => {
    
  return (
    <Fragment>
        <div className="containerWrap-project relCycContainer" id='createRelContainer'>
            <div className="containerWrap-project releaseContainer rcContainer">
                <div className="addContainer"><span onClick={()=>{props.clickAddRelease()}} id="addRelease" title="Add Release" className={props.disableAddRelease && props.taskName ==="Update Project" ?"disableAddRelease":""}><img src={"static/imgs/ic-add-sm.png"} alt="Add Release" />Add Release</span></div>
                <ul id="releaseList" className="containerWrap-project containerWrap-project-cust ">
                {props.releaseList.map((releaseName,index) => ( 
                    <li key={index} id={'releaseList_' + props.count} onClick={()=>{props.clickReleaseListName({id:'releaseList_' + props.count,releaseName:releaseName});props.setActiveRelease(releaseName);}} className={(releaseName===props.activeRelease)?"active-release":""} >
                        <img src={"static/imgs/ic-release.png"} alt="Release"/><span title={releaseName} className='releaseName'>{releaseName}</span>
                        {(releaseName===props.activeRelease)?
                        <span >
                            <img onClick={()=>{props.clickEditRelease("editReleaseName_" + props.count)}} id={"editReleaseName_" + props.count} title='Edit Release Name' src={"static/imgs/ic-edit-sm.png"} alt="Edit Release Name" className='editReleaseName'/>
                        </span>
                        :null}
                    </li>
                ))}
                </ul>
            </div>
            <div className="containerWrap-project cycleContainer rcContainer">
                <div className="addContainer"><span onClick={()=>{props.clickAddCycle()}} id="addCycle" title="Add Cycle" className={props.disableAddCycle?"disableAddCycle":""}><img src={"static/imgs/ic-add-sm.png"} alt="Add Cycle" />Add Cycle</span></div>
                <ul id="cycleList" className="containerWrap-project containerWrap-project-cust">
                {props.cycleList.map((cycleName,index) => ( 
                    <li key={index} className={props.cycleListClass?'cycleList createCycle':"createCycle"}>
                        <img src={"static/imgs/ic-cycle.png"} alt="Cycle" />
                        <span title={cycleName} className='cycleName'>{cycleName}</span>
                        <span >
                            <img onClick={()=>{props.clickEditCycle("editReleaseName_" + props.count,cycleName)}} id={"editCycleName_" + props.delCount}  title='Edit Cycle Name' src={"static/imgs/ic-edit-sm.png"} alt='Edit Cycle Name' className='editCycleName'/>
                            {/* <img id={"deleteCycleName_" + delCount } title='Delete Cycle' src={"static/imgs/ic-delete-sm.png"} class='deleteCycle'/> */}
                        </span>
                    </li>
                ))}
                </ul>
            </div>
        </div>
	</Fragment>
  )
}  


export default ReleaseCycle;