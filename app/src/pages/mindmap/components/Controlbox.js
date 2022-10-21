import React, { useEffect,useState } from 'react';
import ClickAwayListener from 'react-click-away-listener';
import '../styles/ControlBox.scss'
import * as d3 from 'd3';
import {Provider, useSelector, useDispatch} from 'react-redux';
import PropTypes from 'prop-types';
import '../styles/TaskBox.scss';
import TaskBox from './TaskBox';
import CanvasAssign from '../containers/CanvasAssign';
import CreateAssign from '../containers/CreateAssign';
import ExecuteHome from '../../execute/containers/ExecuteHome';
// import ExecuteHome from '../../execute/containers/ExecuteHome';
// import MindmapHome from '../../mindmap/containers/MindmapHome';
import {Dialog} from '@avo/designcomponents';
import ScrapeScreen from '../../scrape/containers/ScrapeScreen';
// import { useHistory } from 'react-router-dom';
import DesignHome from '../../design/containers/DesignHome';
import TaskBox from './TaskBox';
import { useSelector, useDispatch }  from  "react-redux";
import { useHistory } from 'react-router-dom';
import { assign } from 'nodemailer/lib/shared';
import {SET_CT} from "../../plugin/state/action"
// import { assign } from 'nodemailer/lib/shared';

/*Component ControlBox
  use: returns node control options 
  props={nid:'nodeid',clickAdd:function to add node,ctScale:{x:1,y:1,k:1}
*/


const ControlBox = (props) => {
    const [showScrape, setShowScrape] = useState(false);
    const [ShowDesignTestSetup,setShowDesignTestSetup] = useState(false);
    const [showExecute,setShowExecute] = useState(false);
    // const [redirectTo, setRedirectTo] = useState("");
    // const history = useHistory();
    // const current_task = useSelector(state=>state.plugin.CT);
    const [redirectTo, setRedirectTo] = useState("");
//     const dispatch = useDispatch();
//     const roleSwitched = useSelector(state=>state.mindmap.breadcrumbValue);
//     useEffect(()=>{
//       if(roleSwitched){
//           dispatch({type: SWITCHED, payload: false});
//           setRole(true);
//       }
//   }, [roleSwitched])
    const history = useHistory();
    const current_task = useSelector(state=>state.plugin.CT);
    const dispatch = useDispatch()

    // const [showAssign,setShowAssign] = useEffect(false);
    const [showAssign,setShowAssign] = useState(false);

    var faRef = {
        "plus": "fa-plus",
        "plus1": "fa-hand-peace-o",
        "edit": "fa-pencil-square-o",
        "delete": "fa-trash-o",
        "assign":"fa-light fa-user",
        "execute":"fa-play",
        "record":"fa-dot-circle-o",
        "captureelements":"fa-crop",
        "designtestsetup":"fa-list-alt",
    };
    var ctScale = props.ctScale;
    var isEnE = props.isEnE;
    var p = d3.select('#'+props.nid);
    p.classed('node-highlight',!0)
    var t = p.attr('data-nodetype');
    useEffect(()=>{
        var split_char = ',';
        var l = p.attr('transform').slice(10, -1).split(split_char);
        l = [(parseFloat(l[0]) + 40) * ctScale.k + ctScale.x, (parseFloat(l[1]) + 40) * ctScale.k + ctScale.y];
        console.log('l',l);
        var c = d3.select('#ct-ctrlBox').style('top', l[1] + 'px').style('left', l[0] + 'px')
        if(isEnE){
            if(t==='endtoend'){
                c.select('p.' + faRef.plus).classed('ct-ctrl-hide', !0);
                c.select('p.' + faRef.plus1).classed('ct-ctrl-hide', !0);
                c.select('p.' + faRef.edit).classed('ct-ctrl-inactive', !1);
                c.select('p.' + faRef.edit).html('Edit End to End Module');
                c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !0);
            }else{
                c.select('p.' + faRef.plus).classed('ct-ctrl-hide', !0);
                c.select('p.' + faRef.plus1).classed('ct-ctrl-hide', !0);
                c.select('p.' + faRef.edit).classed('ct-ctrl-inactive', !0);
                c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !1);
                c.select('p.' + faRef.delete).html('Delete Scenario');
            }
        }else if (t === 'modules') {
            c.select('p.' + faRef.plus).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.plus).html('Add Scenario');
            c.select('p.' + faRef.plus1).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.plus1 ).html('Add Scenarios');
            c.select('p.' + faRef.edit ).html('Rename');
            c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !0);
            c.select('p.' + faRef.assign).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.assign).html('Assign');
            c.select('p.' + faRef.execute).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.execute).html('Execute');
            c.select('p.' + faRef.record).classed('ct-ctrl-inactive', !1);

        } else if (t === 'scenarios') {
            c.select('p.' + faRef.plus).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.plus ).html('Add Screen');
            c.select('p.' + faRef.plus1).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.plus1).html('Add Screens');
            c.select('p.' + faRef.edit ).html('Rename');
            c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.delete).html('Delete ');
            c.select('p.' + faRef.record).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.record).html('Record');
            c.select('p.' + faRef.assign).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.assign).html('Assign');
            c.select('p.' + faRef.execute).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.execute).html('Execute');
        } else if (t === 'screens') {
            c.select('p.' + faRef.plus).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.plus).html('Add Testcase');
            c.select('p.' + faRef.plus1).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.plus1).html('Add Testcases');
            c.select('p.' + faRef.edit ).html('Rename');
            c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.delete).html('Delete ');
            c.select('p.' + faRef.captureelements).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.captureelements).html('Capture Elements');
            c.select('p.' + faRef.assign).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.assign).html('Assign');
            c.select('p.' + faRef.execute).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.execute).html('Execute');
        } else if (t === 'testcases') {
            c.select('p.' + faRef.plus ).classed('ct-ctrl-inactive', !0);
            c.select('p.' + faRef.plus1).classed('ct-ctrl-inactive', !0);
            c.select('p.' + faRef.edit).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.edit ).html('Rename');
            c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.delete ).html('Delete');
            c.select('p.' + faRef.designtestsetup).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.designtestsetup).html('Design Test Setup');
            c.select('p.' + faRef.assign).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.assign).html('Assign');
            c.select('p.' + faRef.execute).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.execute).html('Execute');
        }
        d3.select('#ct-ctrlBox').classed('show-box', !0);
        p.classed('node-highlight',!0)
        return ()=>{
            p.classed('node-highlight',false)
        }
    })
    const editNode = (e) => {
        if(e.target.classList.contains('ct-ctrl-inactive'))return;
        props.setInpBox(p)
    }
    const addNode = (e) => {
        if(e.target.classList.contains('ct-ctrl-inactive'))return;
        props.clickAddNode(e.target.attributes.value.value.split("node_")[1])
    }
    const addMultipleNode = (e) => {
        if(e.target.classList.contains('ct-ctrl-inactive'))return;
        props.setMultipleNode(e.target.attributes.value.value.split("node_")[1])
    }
    const deleteNode = (e) =>{
        if(e.target.classList.contains('ct-ctrl-inactive'))return;
        props.clickDeleteNode(props.nid)
        props.setCtrlBox(false)
    }
    const DesignTest = () =>{
        setShowDesignTestSetup(true);
    };
    const execute =() =>{
        setShowExecute(true);
        
    }; 
    const CaptureElement = () =>{
        setShowScrape(true);
    };
    // const Assign = () =>{
    //     <TaskBox/>
    // }
    // console.log("taskname  "+props.taskname)
    // const Assign = () =>{
    //     setShowAssign(true);
    //     props.setTaskBox(props.nid);
    //     props.setCtrlBox(false);
    // };
    // const clickUnassign = (res) =>{
    //     setNodes(res.nodeDisplay)
    //     dispatch({type:actionTypes.UPDATE_UNASSIGNTASK,payload:res.unassignTask})
    //     setTaskBox(false)
    // };
    // useEffect(()=>{
    //     //useEffect to clear redux data selected module on unmount
    //     return ()=>{
    //         dispatch({type:actionTypes.SELECT_MODULE,payload:{}})
    //     }
    // },[dispatch])
    console.log("taskname  "+props.taskname)
    const Assign = () =>{
        setShowAssign(true);
        props.setTaskBox(props.nid);
        props.setCtrlBox(false);
    };
    

    return(
        <>
        <Dialog
            // open={this.state.show} onClose={this.onClose}
            hidden = {showScrape === false}
            onDismiss = {() => setShowScrape(false)}
            title={props.taskname}
            minWidth = '68rem'
            
            // onDecline={() => console.log(false)}
            onConfirm = {() => { }} >
                <div style={{ height: '623px'}}><ScrapeScreen /></div>
            </Dialog>


            <Dialog
            
            hidden = {ShowDesignTestSetup === false}
            onDismiss = {() => setShowDesignTestSetup(false)}
            title={props.taskname}
            minWidth = '65rem'
            
            // onDecline={() => console.log(false)}
            onConfirm = {() => { }} >
                <div style={{ height: '623px'}}><DesignHome /></div>
            </Dialog>

            
            <Dialog
            
            hidden = {showExecute === false}
            onDismiss = {() => {setShowExecute(false)}}
            title = 'Execute'
            minWidth = '60rem'
            confirmText = 'Save'
            onConfirm = {() => { }} >
                <div style={{ height: '623px'}}><ExecuteHome/></div>
            </Dialog>
             {/* {showAssign ? <TaskBox clickUnassign={clickUnassign} nodeDisplay={{...nodes}} releaseid={releaseid} cycleid={cycleid} ctScale={ctScale} nid={taskbox} dNodes={[...dNodes]} setTaskBox={setTaskBox} clickAddTask={clickAddTask} displayError={displayError}/>:null}
             <div hidden = {showAssign === false} ><MindmapHome/></div> */}

        <ClickAwayListener onClickAway={(e)=>{if(e.target.className.baseVal !== "ct-nodeIcon")props.setCtrlBox(false)}}>
           {t ==='modules'? <div id="ct-ctrlBox" className={(isEnE ?'end-to-end':'')}>
                <p data-test="add" className="ct-ctrl fa fa-plus" value={props.nid} onClick={addNode}> </p>
                <p data-test="addMultiple" className="ct-ctrl fa fa-hand-peace-o" value={props.nid} onClick={addMultipleNode}></p>
                <p data-test="edit" className="ct-ctrl fa fa-pencil-square-o" style={{width: "-webkit-fill-available",height: 24, marginLeft: 0, marginRight: 0, borderBottom: "2px solid #5B5A59", marginBottom: 8,paddingBottom: '20%'}} onClick={editNode}></p>
                <p data-test="delete"  className="ct-ctrl fa fa-trash-o ct-ctrl-inactive" onClick={deleteNode}></p>
                <p data-test="assign"  className="ct-ctrl fa fa-light fa-user " style={{width: "-webkit-fill-available",height: 24, marginLeft: 0, marginRight: 0, borderBottom: "2px solid #5B5A59" , marginBottom: 8,paddingBottom: "20%"}}  ><>  Assign </></p>
                <p data-test="execute"  className="ct-ctrl fa fa-play" onClick={() => execute()}> Execute </p>
            </div>   :     
            t ==='scenarios'? <div id="ct-ctrlBox" className={(isEnE ?'end-to-end':'')}>
                <p data-test="add" className="ct-ctrl fa fa-plus" value={props.nid} onClick={addNode}> </p>
                <p data-test="addMultiple" className="ct-ctrl fa fa-hand-peace-o" value={props.nid} onClick={addMultipleNode}></p>
                <p data-test="edit" className="ct-ctrl fa fa-pencil-square-o"onClick={editNode}></p>
                <p data-test="delete"  className="ct-ctrl fa fa-trash-o ct-ctrl-inactive" style={{width: "-webkit-fill-available",height: 24, marginLeft: 0, marginRight: 0, borderBottom: "2px solid #5B5A59", marginBottom: 8,paddingBottom: '20%'}}  onClick={deleteNode}></p>
                <p data-test="record"  className="ct-ctrl fa fa-dot-circle-o " style={{width: "-webkit-fill-available",height: 24, marginLeft: 0, marginRight: 0, borderBottom: "2px solid #5B5A59", marginBottom: 8,paddingBottom: '20%'}}  > <> Record_AvoGenius </></p >
                <p data-test="assign"  className="ct-ctrl fa fa-light fa-user" style={{width: "-webkit-fill-available",height: 24, marginLeft: 0, marginRight: 0, borderBottom: "2px solid #5B5A59", marginBottom: 8,paddingBottom: '20%'}} ><>  Assign </></p>
                <p data-test="execute"  className="ct-ctrl fa fa-play" onClick={() => execute()}> Execute </p>
               </div> : 
            t ==='screens'? <div id="ct-ctrlBox" className={(isEnE ?'end-to-end':'')}>
               <p data-test="add" className="ct-ctrl fa fa-plus" value={props.nid} onClick={addNode}> </p>
               <p data-test="addMultiple" className="ct-ctrl fa fa-hand-peace-o" value={props.nid} onClick={addMultipleNode}></p>
               <p data-test="edit" className="ct-ctrl fa fa-pencil-square-o"onClick={editNode}></p>
               <p data-test="delete"  className="ct-ctrl fa fa-trash-o ct-ctrl-inactive" style={{ width: "-webkit-fill-available",height: 24, marginLeft: 0, marginRight: 0, borderTop: "2px solid #5B5A59", marginBottom: 8,paddingBottom: '20%'}} onClick={deleteNode}></p>
               <p data-test="captureelements"  className="ct-ctrl fa fa-crop"  onClick={() => CaptureElement()}><> Capture Elements  </></p>
               <p data-test="assign"  className="ct-ctrl fa fa-light fa-user" style={{width: "-webkit-fill-available",height: 24, marginLeft: 0, marginRight: 0, borderTop: "2px solid #5B5A59", marginBottom: 8,paddingBottom: '20%'}}><>  Assign </></p>
               <p data-test="execute"  className="ct-ctrl fa fa-play"  onClick={() => execute()}> Execute </p>
            </div>   : 
            t ==='testcases'? <div id="ct-ctrlBox" className={(isEnE ?'end-to-end':'')}>
               <p data-test="add" className="ct-ctrl fa fa-plus ct-ctrl-inactive" value={props.nid} onClick={addNode}> </p>
           <p data-test="addMultiple" className="ct-ctrl fa fa-hand-peace-o ct-ctrl-inactive" value={props.nid} onClick={addMultipleNode}></p>
           <p data-test="edit" className="ct-ctrl fa fa-pencil-square-o" onClick={editNode}></p>
           <p data-test="delete"  className="ct-ctrl fa fa-trash-o ct-ctrl-inactive" style={{width: "-webkit-fill-available",height: 24, marginLeft: 0, marginRight: 0, borderBottom: "2px solid #5B5A59", marginBottom: 8,paddingBottom: '20%'}} onClick={deleteNode}></p>
           <p data-test="designtestsetup"  className="ct-ctrl fa fa-list-alt" onClick={()=> DesignTest()} > <> Design Test Setup </></p>
           <p data-test="assign"  className="ct-ctrl fa fa-light fa-user" style={{ width: "-webkit-fill-available",height: 24, marginLeft: 0, marginRight: 0, borderBottom: "2px solid #5B5A59", marginBottom: 8,paddingBottom: '20%'}} ><>  Assign </></p>
           <p data-test="execute"  className="ct-ctrl fa fa-play" onClick={() => execute()} > Execute </p>
       </div> : "" 
}
        </ClickAwayListener> 
        </>
    )
}

ControlBox.propTypes={
    nid: PropTypes.string.isRequired,
    setMultipleNode: PropTypes.func.isRequired,
    clickAddNode: PropTypes.func.isRequired,
    clickDeleteNode: PropTypes.func.isRequired,
    setCtrlBox: PropTypes.func.isRequired,
    setInpBox:PropTypes.func.isRequired,
    ctScale: PropTypes.object.isRequired
}
export default ControlBox;