import React, { useEffect, useRef } from 'react';
import ClickAwayListener from 'react-click-away-listener';
import * as d3 from 'd3';

const InputBox = (props) => {
    const InpBox = useRef()
    var p = props.node
    useEffect(()=>{
        props.setCtrlBox(false)
        var ctScale = props.ctScale
        var t = p.attr('data-nodetype');
        var l = p.attr('transform').slice(10, -1).split(',');
        l = [(parseFloat(l[0]) - 20) * ctScale.k + ctScale.x, (parseFloat(l[1]) + 42) * ctScale.k + ctScale.y];
        d3.select('#ct-inpBox').style('top', l[1] + 'px').style('left', l[0] + 'px').classed('no-disp', !1)
        InpBox.current.focus()
    })
    const onEnter = (val) =>{
        var scrList = []
        var dNodes = props.dNodes
        var reuseDict = getReuseDetails(dNodes);
        if (val == 'Screen_0' || val == 'Scenario_0' || val == 'Testcase_0') {
            d3.select('#ct-inpAct').classed('errorClass',!0);
            return;
        }
        if (!validNodeDetails(val)) return; 
        var pi = p.attr('id').split('node_')[1];
        var pt = p.select('.ct-nodeLabel');
        var t = p.attr('data-nodetype');
        var inp = d3.select('#ct-inpAct');
        // if (!d3.select('#ct-inpSugg').classed('no-disp') && temp && temp.length > 0) return;
        if (dNodes[pi]._id) {
            dNodes[pi].original_name = pt.attr('title');
            dNodes[pi].rnm = !0;
        }
        // if (t == 'screens' && scrList[inp.attr('data-nodeid')] !== undefined) {
        //     dNodes[pi].name = scrList[inp.attr('data-nodeid')].name;
        // } else if (t == 'testcases' && tcList[inp.attr('data-nodeid')] !== undefined) {
        //     dNodes[pi].name = tcList[inp.attr('data-nodeid')].name;
        // } else 
        {
            dNodes[pi].name = val;
        }
        if (dNodes[pi].original_name != val) {
            d3.select('.node_' + pi + '>image').attr('style', 'opacity:0.6')
        }
        // d3.select('#ct-inpBox').classed('no-disp', !0);
        var tmp = dNodes[pi].name;
        if (tmp.length > 15) var tmp = tmp.slice(0, 15) + "...";
        pt.text(tmp);
        // zoom.event(d3.select('#ct-mapSvg'));

        function replicateName(pi) {
            //replicate task to reused node
            if (reuseDict[pi].length > 0) {
                reuseDict[pi].forEach(function(e, i) {
                    dNodes[e].name = dNodes[pi].name;
                    dNodes[e].original_name = dNodes[pi].original_name;
                    dNodes[e].rnm = dNodes[pi].rnm;
                    // d3.select('.node_' + e + ' > text').text(tmp);
                });
            }
        }
        replicateName(pi);
        props.setInpBox(false)
    }
    // if ($event !== true && d3.select($event.target).classed('ct-ctrl-inactive')) return;
    // if (node == undefined) {
    //     childNode = null;
    // } else {
    //     var p = d3.select(childNode);
    //     activeNode = childNode;
    // }
    // var t = p.attr('data-nodetype');
    // if(dNodes[pi]["taskexists"]!=null)
    // {
    //     openDialogMindmap('Rename Error',"Unassign the task to rename");
    //     return;
    // }
    // if (p && dNodes[pi].taskexists) {
    //     var msg = 'Unassign the task to rename';
    //     if (t == 'screens') {
    //         msg = 'Unassign the task to rename. And unassign the corresponding testcases tasks';
    //     }
    //     openDialogMindmap('Rename Error', msg);
    //     return;
    // }
    // cSize = getElementDimm(d3.select(".mp__canvas_svg"));
    // d3.select('#ct-ctrlBox').classed('no-disp', !0);
    // var name = dNodes[pi].name;
    // d3.select('#ct-inpPredict').property('value', '');
    // d3.select('#ct-inpAct').attr('data-nodeid', null).property('value', name).node().focus();
    // d3.select('#ct-inpSugg').classed('no-disp', !0);
    return(
        <ClickAwayListener onClickAway={(e)=>{
            onEnter(document.getElementById("ct-inpAct").value)
            if(e.target.className.baseVal !== "ct-nodeIcon")props.setInpBox(false);
            }}>
            <div id="ct-inpBox" className='no-disp'>
                <input autoFocus={true} ref={InpBox} id="ct-inpAct" maxLength="255" className="ct-inp" onKeyPress={(e)=>{if(e.key==='Enter')onEnter(e.target.value)}}/>
            </div>
        </ClickAwayListener>
    )
}

function validNodeDetails(value) {
    d3.select('#ct-inpAct').classed('errorClass',!1);
    var nName, flag = !0;
    nName = value;
    var regex = /^[a-zA-Z0-9_]*$/;;
    if (nName.length == 0 || nName.length > 255 || nName.indexOf('_') < 0 || !(regex.test(nName)) || nName== 'Screen_0' || nName == 'Scenario_0' || nName == 'Testcase_0') {
        d3.select('#ct-inpAct').classed('errorClass',!0);
        flag = !1;
    }
    return flag;
};

function getReuseDetails(dNodes) {
    // reuse details within the same module
    var dictTmp = {};
    dNodes.forEach(function(e, i) {
        dictTmp[i] = [];
        if (e.reuse) {
            dNodes.forEach(function(f, j) {
                if (e.type == f.type && e.type == 'screens' && e.name == f.name && i != j && f.reuse)
                    dictTmp[i].push(j);
                else if (e.type == f.type && e.type == 'testcases' && e.name == f.name && i != j && e.parent && f.parent && e.parent.name == f.parent.name && f.reuse)
                    dictTmp[i].push(j);
                else if (e.type == f.type && e.type== 'scenarios' && e.name==f.name && i!=j && f.reuse)
                    dictTmp[i].push(j);
            })
        }
    })
    return dictTmp;
}

export default InputBox;