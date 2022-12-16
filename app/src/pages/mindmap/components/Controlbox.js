import React, { useEffect,useState } from 'react';
import ClickAwayListener from 'react-click-away-listener';
import '../styles/ControlBox.scss'
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import '../styles/TaskBox.scss';
import { Redirect } from 'react-router-dom'
import { useSelector } from 'react-redux';
import { disable } from 'agenda/dist/job/disable';

/*Component ControlBox
  use: returns node control options 
  props={nid:'nodeid',clickAdd:function to add node,ctScale:{x:1,y:1,k:1}
*/


const ControlBox = (props, onClick) => {
    const [redirectTo, setRedirectTo] = useState("");
    const appType = useSelector((state)=>state.mindmap.appType)
    var faRef = {
        "plus": "add_icon",
        "plus1": "addmultiple_icon",
        "edit": "edit_icon",
        "delete": "delete_icon",
        "record":"record_icon",
        "captureelements":"capture_icon",
        "designteststeps":"design_icon",
        "debug":"debug_icon",
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
        var c = d3.select('#ct-ctrlBox').style('top', l[1] + 'px').style('left', l[0] + 'px');
        if(isEnE){
            if(t==='endtoend'){
                c.select('p.' + faRef.plus).classed('ct-ctrl-hide', !0);
                c.select('p.' + faRef.plus1).classed('ct-ctrl-hide', !0);
                c.select('p.' + faRef.edit).classed('ct-ctrl-inactive', !1);
                c.select('p.' + faRef.edit ).html('Rename').style('font-family', 'LatoWeb');
                c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !0);
                c.select('p.' + faRef.delete).html('Delete').style('font-family','LatoWeb');

            }else{
                c.select('p.' + faRef.plus).classed('ct-ctrl-hide', !0);
                c.select('p.' + faRef.plus1).classed('ct-ctrl-hide', !0);
                c.select('p.' + faRef.edit).classed('ct-ctrl-hide', !0);
                // c.select('p.' + faRef.edit).html('Rename').style('font-family','LatoWeb');
                c.select('p.' + faRef.record).classed('ct-ctrl-hide', !0);
                c.select('p.' + faRef.debug).classed('ct-ctrl-hide', !0);
                // c.select('p.' + faRef.record).html('AvoGenius(SmartRecord)').style('font-family', 'LatoWeb');
                c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !1);
                c.select('p.' + faRef.delete).html('Delete').style('font-family', 'LatoWeb');
                c.selectAll('hr').classed('ct-ctrl-hide', !0);
            }
        }else if (t === 'modules') {
            c.select('p.' + faRef.plus).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.plus).html('Add Scenario').style('font-family','LatoWeb');
            c.select('p.' + faRef.plus1).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.plus1 ).html('Add Scenarios').style('font-family','LatoWeb');
            c.select('p.' + faRef.edit).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.edit ).html('Rename').style('font-family', 'LatoWeb');
            c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !0);
        } else if (t === 'scenarios') {
            c.select('p.' + faRef.plus).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.plus ).html('Add Screen').style('font-family', 'LatoWeb');
            c.select('p.' + faRef.plus1).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.plus1).html('Add Screens').style('font-family', 'LatoWeb');
            c.select('p.' + faRef.edit).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.edit ).html('Rename').style('font-family', 'LatoWeb');
            c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.delete).html('Delete ').style('font-family', 'LatoWeb');
            c.select('p.' + faRef.debug).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.debug).html('Debug').style('font-family', 'LatoWeb');
            if(appType === "Web"){
            c.select('p.' + faRef.record).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.record).html('Avo Genius (Smart Recorder)').style('font-family', 'LatoWeb');
            }
            else{
                c.select('p.' + faRef.record).classed('ct-ctrl-disabled', !0);
                c.select('p.' + faRef.record).html('Avo Genius (Smart Recorder)').style('font-family', 'LatoWeb');
            }
        } else if (t === 'screens') {
            c.select('p.' + faRef.plus).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.plus).html('Add Testcase').style('font-family', 'LatoWeb');
            c.select('p.' + faRef.plus1).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.plus1).html('Add Testcases').style('font-family', 'LatoWeb');
            c.select('p.' + faRef.edit).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.edit ).html('Rename').style('font-family', 'LatoWeb');
            c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.delete).html('Delete ').style('font-family', 'LatoWeb');
            c.select('p.' + faRef.captureelements).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.captureelements).html('Capture Elements').style('font-family','LatoWeb');
        } else if (t === 'testcases') {
            c.select('p.' + faRef.edit).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.edit ).html('Rename').style('font-family','LatoWeb');
            c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.delete ).html('Delete').style('font-family','LatoWeb');
            c.select('p.' + faRef.designteststeps).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.designteststeps).html('Design Test Steps').style('font-family','LatoWeb');
        }
        d3.select('#ct-ctrlBox').classed('show-box', !0);
        p.classed('node-highlight',!0);
        let body_bounds = document.querySelector(".mp__body").getBoundingClientRect();
        let ct_bounds = d3.select('#ct-ctrlBox').node()?.getBoundingClientRect();

        if (ct_bounds?.bottom && ct_bounds?.bottom>=body_bounds.bottom) {
            d3.select('#ct-ctrlBox').style("top","unset")
            d3.select('#ct-ctrlBox').style('bottom', 0 + 'px').style('left', l[0] + 'px');
        }
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

    return(
        <>
        { redirectTo && <Redirect data-test="redirectTo" to={redirectTo} />}
        <ClickAwayListener onClickAway={(e)=>{if(e.target.className.baseVal !== "ct-nodeIcon")props.setCtrlBox(false)}}>
            {t==="modules"? <div id="ct-ctrlBox" className={(isEnE ?'end-to-end':'')}>
                <p data-test="add" className="ct-ctrl add_icon onhover" value={props.nid} onClick={addNode}></p>
                <p data-test="addMultiple" className="ct-ctrl addmultiple_icon onhover" value={props.nid} onClick={addMultipleNode}></p>
                <hr className='separator'/>
                <p data-test="edit" className="ct-ctrl  edit_icon onhover" onClick={editNode}></p>
                {/* <p data-test="delete"  className="ct-ctrl  delete_icon ct-ctrl-inactive onhover" onClick={deleteNode}></p> */}
            </div>  : ""} </ClickAwayListener>
        <ClickAwayListener onClickAway={(e)=>{if(e.target.className.baseVal !== "ct-nodeIcon")props.setCtrlBox(false)}}>
            {t==='endtoend'?
            <div id="ct-ctrlBox" className={(isEnE ?'end-to-end':'')}>
                <p data-test="edit" className="ct-ctrl onhover edit_icon" onClick={editNode}></p> 
            </div>  : ""}
        </ClickAwayListener>  
        <ClickAwayListener onClickAway={(e)=>{if(e.target.className.baseVal !== "ct-nodeIcon")props.setCtrlBox(false)}}> 
            {t ==='scenarios'? <div id="ct-ctrlBox" className={(isEnE ?'end-to-end':'')}>
                <p data-test="add" className="ct-ctrl add_icon onhover" value={props.nid} onClick={addNode}> </p>
                <p data-test="addMultiple" className="ct-ctrl addmultiple_icon onhover" value={props.nid} onClick={addMultipleNode}></p>
                <hr className='separator'/>
                {/* <p data-test="record"  className="ct-ctrl record_icon ct-ctrl-inactive onhover" onClick={()=>{window.localStorage['navigateScreen'] = "genius";setRedirectTo(`/genius`)}}  ></p > */}
                <div className='CursorPoint'><p data-test="record" className={"ct-ctrl record_icon onhover "+(appType!=="Web"?"ct-ctrl-disabled":"ct-ctrl-inactive")} onClick={props.Avodialog}></p ></div>
                <p data-test="debug"  className="ct-ctrl debug_icon onhover"></p >
                <hr className='separator'/>
                <p data-test="edit" className="ct-ctrl edit_icon onhover" onClick={editNode}></p>
                <p data-test="delete"  className="ct-ctrl delete_icon ct-ctrl-inactive onhover"  onClick={deleteNode}></p>
            </div> : ""} </ClickAwayListener>
        <ClickAwayListener onClickAway={(e)=>{if(e.target.className.baseVal !== "ct-nodeIcon")props.setCtrlBox(false)}}>     
            {t ==='screens'? <div id="ct-ctrlBox" className={(isEnE ?'end-to-end':'')}>
               <p data-test="add" className="ct-ctrl add_icon onhover" value={props.nid} onClick={addNode}> </p>
               <p data-test="addMultiple" className="ct-ctrl addmultiple_icon onhover" value={props.nid} onClick={addMultipleNode}></p>
               <hr className='separator'/>
               <p data-test="captureelements" className="ct-ctrl capture_icon onhover" onClick={()=>props.openScrapeScreen('displayBasic')}  ><> Capture Element </></p>
               <hr className='separator'/>
               <p data-test="edit" className="ct-ctrl edit_icon onhover" onClick={editNode}></p>
               <p data-test="delete"  className="ct-ctrl delete_icon ct-ctrl-inactive onhover" onClick={deleteNode}></p>
            </div>   : ""}</ClickAwayListener>
            <ClickAwayListener onClickAway={(e)=>{if(e.target.className.baseVal !== "ct-nodeIcon")props.setCtrlBox(false)}}> 
            {t ==='testcases'? <div id="ct-ctrlBox"  className={(isEnE ?'end-to-end':'')}>
               <p data-test="designteststeps" className="ct-ctrl design_icon onhover"  onClick={()=>props.openScrapeScreen('displayBasic2') }> <> Design Test Steps </></p>
               <hr className='separator'/>
               <p data-test="edit" className="ct-ctrl edit_icon onhover"  onClick={editNode}></p>
               <p data-test="delete"  className="ct-ctrl delete_icon onhover"  onClick={deleteNode}></p>
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