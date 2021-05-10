import React, { useEffect } from 'react';
import ClickAwayListener from 'react-click-away-listener';
import '../styles/ControlBox.scss'
import * as d3 from 'd3';
import PropTypes from 'prop-types'

/*Component ControlBox
  use: returns node control options 
  props={nid:'nodeid',clickAdd:function to add node,ctScale:{x:1,y:1,k:1}
*/

const ControlBox = (props) => {
    var faRef = {
        "plus": "fa-plus",
        "plus1": "fa-hand-peace-o",
        "edit": "fa-pencil-square-o",
        "delete": "fa-trash-o"
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
        var c = d3.select('#ct-ctrlBox').style('top', l[1] + 'px').style('left', l[0] + 'px')
        if(isEnE){
            if(t==='endtoend'){
                c.select('p.' + faRef.plus).classed('ct-ctrl-hide', !0);
                c.select('p.' + faRef.plus1).classed('ct-ctrl-hide', !0);
                c.select('p.' + faRef.edit).classed('ct-ctrl-inactive', !1);
                c.select('p.' + faRef.edit + ' .ct-tooltiptext').html('Edit End to End Module');
                c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !0);
            }else{
                c.select('p.' + faRef.plus).classed('ct-ctrl-hide', !0);
                c.select('p.' + faRef.plus1).classed('ct-ctrl-hide', !0);
                c.select('p.' + faRef.edit).classed('ct-ctrl-inactive', !0);
                c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !1);
                c.select('p.' + faRef.delete + ' .ct-tooltiptext').html('Delete Scenario');
            }
        }else if (t === 'modules') {
            c.select('p.' + faRef.plus).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.plus + ' .ct-tooltiptext').html('Create Scenarios');
            c.select('p.' + faRef.plus1).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.plus1 + ' .ct-tooltiptext').html('Create Multiple Scenarios');
            c.select('p.' + faRef.edit + ' .ct-tooltiptext').html('Edit Module');
            c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !0);
        } else if (t === 'scenarios') {
            c.select('p.' + faRef.plus).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.plus + ' .ct-tooltiptext').html('Create Screens');
            c.select('p.' + faRef.plus1).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.plus1 + ' .ct-tooltiptext').html('Create Multiple Screens');
            c.select('p.' + faRef.edit + ' .ct-tooltiptext').html('Edit Scenario');
            c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.delete + ' .ct-tooltiptext').html('Delete Scenario');
        } else if (t === 'screens') {
            c.select('p.' + faRef.plus).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.plus + ' .ct-tooltiptext').html('Create Testcases');
            c.select('p.' + faRef.plus1).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.plus1 + ' .ct-tooltiptext').html('Create Multiple Testcases');
            c.select('p.' + faRef.edit + ' .ct-tooltiptext').html('Edit Screen');
            c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.delete + ' .ct-tooltiptext').html('Delete Screen');
        } else if (t === 'testcases') {
            c.select('p.' + faRef.plus).classed('ct-ctrl-inactive', !0);
            c.select('p.' + faRef.plus1).classed('ct-ctrl-inactive', !0);
            c.select('p.' + faRef.edit).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.edit + ' .ct-tooltiptext').html('Edit Testcase');
            c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !1);
            c.select('p.' + faRef.delete + ' .ct-tooltiptext').html('Delete Testcase');
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
    return(
        <ClickAwayListener onClickAway={(e)=>{if(e.target.className.baseVal !== "ct-nodeIcon")props.setCtrlBox(false)}}>
            <div id="ct-ctrlBox" className={(isEnE?'end-to-end':'')}>
                <p data-test="add" className="ct-ctrl fa fa-plus" value={props.nid} onClick={addNode}><span className="ct-tooltiptext">Create Scenarios</span></p>
                <p data-test="addMultiple" className="ct-ctrl fa fa-hand-peace-o" value={props.nid} onClick={addMultipleNode}><span className="ct-tooltiptext">Create Multiple Scenarios</span></p>
                <p data-test="edit" className="ct-ctrl fa fa-pencil-square-o"onClick={editNode} ><span className="ct-tooltiptext">Edit Module</span></p>
                <p data-test="delete"  className="ct-ctrl fa fa-trash-o ct-ctrl-inactive" onClick={deleteNode} ><span className="ct-tooltiptext"></span></p>
            </div>
        </ClickAwayListener>
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