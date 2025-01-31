/*eslint eqeqeq: "off"*/
import * as d3 from 'd3';
import {v4 as uuid} from 'uuid'
import { readCtScale } from './CanvasNew';

function unfoldtree(d){
    // d3.select('#node_' + d.id).classed('no-disp', !1).select('.ct-cRight').classed('ct-nodeBubble', !0); 
    if (d.parent && (d.parent.revertChild || d.parent.revertChild1)) d.revertChild1 = true;
    if (d._children) {
        d.children = d._children;
        d._children = null;
        d.revertChild = true;
    }
    if (d.children) d.children.forEach(unfoldtree);
}

function foldtree(d){   
    if (d.children) d.children.forEach(foldtree);
    if (d.revertChild1) delete d.revertChild1;
    if (d.revertChild) {
        d._children = d.children;
        d.children = null;
        delete d.revertChild;
    }
}

const recurseTogChild = (nodeDisplay, linkDisplay, d, v, dLinks) => {
    if (d.children) d.children.forEach(function(e) {
        recurseTogChild(nodeDisplay, linkDisplay, e, v, dLinks);
        nodeDisplay[e.id].hidden = v;
        for (var j = dLinks.length - 1; j >= 0; j--) {
            var lid = 'link-' + dLinks[j].source.id + '-' + dLinks[j].target.id
            if (linkDisplay[lid] && dLinks[j].source.id === d.id) {
                linkDisplay[lid].hidden = v
            } 
        }
    });
    else if (d._children) d._children.forEach(function(e) {
        recurseTogChild(nodeDisplay, linkDisplay, e, !0, dLinks);
        nodeDisplay[e.id].hidden = !0;
        for (var j = dLinks.length - 1; j >= 0; j--) {
            var lid = 'link-' + dLinks[j].source.id + '-' + dLinks[j].target.id
            if (linkDisplay[lid] && dLinks[j].source.id === d.id) {
                linkDisplay[lid].hidden = !0
            }
        }
    });
};

const getNewPosition = (dNodes,node, pi, arr_co ,layout_vertical,sections) => {
    //dNodes[pi].children are arranged in increasing
    // order of x/y disance depending on layout
    var index;
    var new_one;
    if (dNodes[pi].children.length > 0) { // new node has siblings
        index = dNodes[pi].children.length - 1;
        if (layout_vertical){
            if((dNodes[pi].type === "scenarios") && (dNodes[pi]?.parent?._id !== null) && (dNodes[pi].state!=="created")){
                new_one = {
                    x: parseInt(dNodes[pi].children[index].x) + 100,
                    y: sections[node.type] - 100
                };// Go beside last sibling node
            }else if ((dNodes[pi].type === "screens") && (dNodes[pi]?.parent?.parent?._id !== null) && (dNodes[pi].state!=="created")){
                new_one = {
                    x: parseInt(dNodes[pi].children[index].x) + 100,
                    y: sections[node.type] - 90
                };// Go beside last sibling node
            }else if ((dNodes[pi].type === "modules") && (dNodes[pi]?._id !== null)){
                new_one = {
                    x: parseInt(dNodes[pi].children[index].x) + 100,
                    y: sections[node.type] - 120
                };// Go beside last sibling node
            }else{
                new_one = {
                    x: parseInt(dNodes[pi].children[index].x) + 100,
                    y: sections[node.type]
                }; // Go beside last sibling node
            } 
        }
        else{
            new_one = {
                x: sections[node.type],
                y: parseInt(dNodes[pi].children[index].y + 80)
            };
        }
        node = getNonOverlappingPosition(node, arr_co, new_one,layout_vertical);
    } else { //first kid of any node
        if (dNodes[pi].parent != null) { //if kid of scenario/testcase/screen
            // var arr = dNodes[pi].parent.children;
            index = dNodes[pi].parent.children.length - 1; //number of parents siblings - 1
            //new_one={x:parseInt(arr[index].x),y:parseInt(arr[index].y)+125};
            if (layout_vertical) {
                if((dNodes[pi].type === "scenarios") && (dNodes[pi]?.parent?._id !== null)){
                    if(dNodes[pi].childIndex === 1){
                        new_one = {
                            x: parseInt(dNodes[pi].x),
                            y: parseInt(sections[node.type])
                        };
                    }else{
                        new_one = {
                            x: parseInt(dNodes[pi].x),
                            y: parseInt(sections[node.type])-100
                        };
                    }
                }
                else if((dNodes[pi].type === "screens") && (dNodes[pi]?.parent?._id !== null)){
                    new_one = {
                        x: parseInt(dNodes[pi].x),
                        y: parseInt(sections[node.type])
                    };
                }
                else{
                    new_one = {
                        x: parseInt(dNodes[pi].x),
                        y: parseInt(sections[node.type])
                    };
                } // go directly below parent
            } else {
                new_one = {
                    x: parseInt(sections[node.type]),
                    y: parseInt(dNodes[pi].y)
                }; // go directly below parent
            }
            node = getNonOverlappingPosition(node, arr_co, new_one,layout_vertical);
        } else {
            //Module's kid
            //layout_change
            if (layout_vertical) {
                node.x = parseInt(dNodes[pi].x);
                node.y = parseInt(sections[node.type]);
            } else {
                node.y = parseInt(dNodes[pi].y);
                node.x = parseInt(sections[node.type]);
            }
        }

    }
    return node;
}

const getNonOverlappingPosition = (node, arr_co, new_one,verticalLayout) => {
    var dist = 0;
    dist = closestCord(arr_co, new_one);
    while (dist < 60) {
        if (verticalLayout) {
            new_one.x = new_one.x + 80;
        } else {
            new_one.y = new_one.y + 80;
        }
        dist = closestCord(arr_co, new_one);
    }
    node.x = new_one.x;
    node.y = new_one.y;
    return node;
}

function closestCord(arr_co, new_one) {
    var dmin = 1000;
    for (var i = 0; i < arr_co.length; i++) {
        var a = new_one.x - arr_co[i].x;
        var b = new_one.y - arr_co[i].y;
        var c = Math.sqrt(a * a + b * b);
        if (c < dmin)
                dmin = c;
    }
    return dmin;
}

const checkparenttask = (parentNode,parent_flag)=>{
    if (parent_flag) return parent_flag;
    if(parentNode!=null){
        if (parentNode.taskexists!=null && parentNode.taskexists.status !== 'complete') {
            parent_flag=true;
        }
        parentNode=parentNode.parent || null;
        parent_flag=checkparenttask(parentNode,parent_flag);
    }
    return parent_flag;
}

const checkchildrentask = (childNode,children_flag)=>{
    if(children_flag) return children_flag;
    if (childNode.taskexists != null) {
        children_flag=true;
        return children_flag;
    }
    if (childNode.children) {
        childNode.children.forEach((e)=>{children_flag=checkchildrentask(e, children_flag)})
    }
    return children_flag;
}

const recurseDelChild = (d, linkDisplay, nodeDisplay, dNodes, dLinks, tab , deletedNodes) =>{
    if (d.children) d.children.forEach((e)=>{recurseDelChild(e, linkDisplay, nodeDisplay, dNodes, dLinks, tab, deletedNodes)});
    if(d.state === "deleted")return;
    if(d._id){  
        var parentid=dNodes[d.parent.id]._id;
        deletedNodes.push([d._id,d.type,parentid]);
    }
    d.parent = null;
    d.children = null;
    d.task = null;
    delete nodeDisplay[d.id];
    // deletednode_info.push(d);
    dNodes[d.id].state = 'deleted';
    var temp = dLinks;
    for (var j = temp.length - 1; j >= 0; j--) {
        if (temp[j].source.id === d.id) {
            delete linkDisplay['link-' + temp[j].source.id + '-' + temp[j].target.id];
            temp[j].deleted = !0;
        }
    }
};
function propagateAssignedUserTotestStep(data, assignedUser) {
    if (Array.isArray(data) && data.length>0) {
        data = data.map(child => {
            const updatedChild = { ...child };
            updatedChild.assigneduser = assignedUser; 
            return updatedChild; 
        });
    }
    return data;
}

function propagateAssignedUserToChildren(data, assignedUser) {
    if (Array.isArray(data) && data.length>0) {
        data = data.map(child => {
            var updatedChild = { ...child };
             updatedChild = {
                ...child,
                children: propagateAssignedUserTotestStep(child.children, assignedUser)
            };
            updatedChild.assigneduser = assignedUser; 
            return updatedChild;
        });
    }
    return data;
}
export const generateTree = (tree,sections,count,verticalLayout,screenData,geniusMindmap,isAssign,cycleID) =>{
    unfoldtree(tree)
    if (Array.isArray(tree?.children)) {
        const updatedChildren = tree.children.map(child => {
            const assignedUser = child.assigneduser;
            const updatedChild = {
                ...child,
                children: propagateAssignedUserToChildren(child.children, assignedUser)
            };
            return updatedChild;
        });
        tree = {
            ...tree,
            children: updatedChildren
        };
    }
    var translate;
    var nodeDisplay = {}
    var linkDisplay = {}
    var s = geniusMindmap?d3.select(`.mp__canvas_svg_genius`):d3.select(`.mp__canvas_svg`)
    let  cSize= [parseFloat(s.style("width")), parseFloat(s.style("height"))];
    var typeNum = {
        'modules': 0,
        'endtoend': 0,
        'scenarios': 1,
        'screens': 2,
        'testcases': 3
    };
    var levelCount = [1]
    function childCounter(l, s) {
        if (levelCount.length <= l) levelCount.push(0);
        if (s.children) {   
            levelCount[l] += s.children.length;
            s.children.forEach(function(d) {
                childCounter(l + 1, d);
            });
        }
    };
    childCounter(1, tree);
    if(tree.type!== "endtoend"){
        var newHeight = d3.max(levelCount) * 90;
        const d3Tree = d3.tree().size([newHeight * 2, cSize[0]/3]);
        const hierarchyLayout = d3.hierarchy(tree);
        const data = d3Tree(hierarchyLayout);
        data.each((node, idx) => {
            node.id = idx;
          });
        const dNodesArray = data.descendants();
        const dLinks = data.links();
        const dNodes = dNodesArray.map((d, idx) => {
            const generateId = (parentId, childIndex) => childIndex;
          
            const mapChildren = (children, parentId) => {
              return children.map((child, childIdx) => {
                const newChild = {
                  ...child.data,
                  x: child.x,
                  y: child.y,
                  id: child.id ? child.id : generateId(parentId, childIdx + 1),
                  parent: {
                    ...child.parent.data,
                    id: child.parent.id ? child.parent.id : parentId,
                    parent: child.parent? child.parent.parent !== null? child.parent.parent.data:child.parent.data:null // Use the parent's ID as the unique identifier
                  }
                };
          
                if (child.children) {
                  newChild.children = mapChildren(child.children, newChild.id); // Pass the child's ID as the parent ID for the recursive call
                }
          
                return newChild;
              });
            };
          
            const newData = {
                ...d.data,
                x: d.x,
                y: d.y,
                id: idx,
                parent: d.parent ? {
                  ...d.parent.data,
                  id: d.parent ? d.parent.id : generateId(idx - 1, 0),
                  parent: d.parent.parent ? { ...d.parent.parent.data } : null
                } : null
              };
          
            if (d.children) {
              newData.children = mapChildren(d.children, newData.id); // Pass the parent's ID as the initial parent ID for children mapping
            }
          
            return newData;
          });
          dNodes.forEach((d,ind)=>{
            if (verticalLayout) {
                    d.y = cSize[0] * 0.1 * (0.9 + typeNum[d.type]);
                    sections[d.type] = d.y;
            } else {
                    d.y = d.x;
                    d.x = cSize[0] * 0.1 * (0.9 + typeNum[d.type]);
                    sections[d.type] = d.x;
            }
            d.id = ind
            count[d.type] += 1; 
            d.x = dNodesArray[ind].x
            d.y = dNodesArray[ind].y
            // d.parent = dNodesArray[ind].parent?dNodesArray[ind].parent.data:null
            var node = addNode(d,screenData);
            nodeDisplay[d.id] = node
            nodeDisplay[d.id].task = false;
            nodeDisplay[d.id].hidden = ((d.parent)? (d.parent.revertChild || d.parent.revertChild1):false) || false;
            if(isAssign){
                if (d.task != null) {
                    //[]convert from date string to %d-%m-%y
                    ['startdate','enddate'].forEach((e)=>{
                        if (d.task[e] != '' && d.task[e].indexOf('-')==-1) {
                            var t=new Date(d.task[e]);
                            d.task[e]=t.getDate()+"-"+(t.getMonth()+1)+"-"+t.getFullYear();
                        }
                    })
                    if (d.task.cycleid == cycleID) {
                        nodeDisplay[d.id].task = true;
                        nodeDisplay[d.id].taskOpacity = 1;
                    }
                    if(d.type=="screens" || d.type=="testcases"){
                        if (d.task.cycleid !=cycleID) {
                            nodeDisplay[d.id].task = true;
                            nodeDisplay[d.id].taskOpacity = 0.5;
                        }
                    }
                    if(d.parent && d.parent.type == 'endtoend'){
                        nodeDisplay[d.id].task = true;
                        nodeDisplay[d.id].taskOpacity = 1;
                    }
                }//showing the task assigned icon little transperent to indicate that task originally do not belongs to this release and cycle but task exists in some other release and cycle
                else if (d.taskexists && d.type !="modules" && d.type !="scenarios") {
                    nodeDisplay[d.id].task = true;
                    nodeDisplay[d.id].taskOpacity = 0.5;
                    }
                }
            })
        dLinks.forEach(function(d) {
            d.id = uuid();
            var lid = 'link-' + d.source.id + '-' + d.target.id
            var link = addLink(d.source, d.target,verticalLayout);
            linkDisplay[lid] = link
            linkDisplay[lid].hidden = (d.source.revertChild || d.source.revertChild1) || false;
        });
        if (verticalLayout){
            translate = [(cSize[0] / 2) - dNodes[0].x, (cSize[1] / 5) - dNodes[0].y-100]
        } else{
            translate = [(cSize[0] / 3) - dNodes[0].x, (cSize[1] / 2) - dNodes[0].y]
        }
        foldtree(tree)
        return {nodes:nodeDisplay,links:linkDisplay,translate:translate,dNodes,dLinks,sections,count}
    }else{
    var newHeights = d3.max(levelCount) * 90;
    const d3Tree = d3.tree().size([newHeights * 2, cSize[0]/9]);
    const hierarchyLayout = d3.hierarchy(tree);
    const data = d3Tree(hierarchyLayout);
    data.each((node, idx) => {
        node.id = idx;
      });
    const dNodesArray = data.descendants();
    const dLinks = data.links();
    const dNodes = dNodesArray.map((d, idx) => {
        const generateId = (parentId, childIndex) => childIndex;
      
        const mapChildren = (children, parentId) => {
          return children.map((child, childIdx) => {
            const newChild = {
              ...child.data,
              x: child.x,
              y: child.y,
              id: child.id ? child.id : generateId(parentId, childIdx + 1),
              parent: {
                ...child.parent.data,
                id: child.parent.id ? child.parent.id : parentId,
                parent: child.parent? child.parent.data:null // Use the parent's ID as the unique identifier
              }
            };
      
            if (child.children) {
              newChild.children = mapChildren(child.children, newChild.id); // Pass the child's ID as the parent ID for the recursive call
            }
      
            return newChild;
          });
        };
      
        const newData = {
            ...d.data,
            x: d.x,
            y: d.y,
            id: idx,
            parent: d.parent ? {
              ...d.parent.data,
              id: d.parent.parent ? d.parent.parent.id : generateId(idx - 1, 0),
              parent: d.parent.parent ? { ...d.parent.parent.data } : null
            } : null
          };
      
        if (d.children) {
          newData.children = mapChildren(d.children, newData.id); // Pass the parent's ID as the initial parent ID for children mapping
        }
      
        return newData;
        });
        dNodes.forEach((d,ind)=>{
            if (verticalLayout) {
                    d.y = cSize[0] * 0.1 * (0.9 + typeNum[d.type]);
                    sections[d.type] = d.y;
            } else {
                    d.y = d.x;
                    d.x = cSize[0] * 0.1 * (0.9 + typeNum[d.type]);
                    sections[d.type] = d.x;
            }
            d.id = ind
            count[d.type] += 1; 
            d.x = dNodesArray[ind].x
            d.y = dNodesArray[ind].y
            // d.parent = dNodesArray[ind].parent?dNodesArray[ind].parent.data:null
            var node = addNode(d);
            nodeDisplay[d.id] = node
            nodeDisplay[d.id].task = false;
            nodeDisplay[d.id].hidden = ((d.parent)? (d.parent.revertChild || d.parent.revertChild1):false) || false;
            if(isAssign){
                if (d.task != null) {
                    //[]convert from date string to %d-%m-%y
                    ['startdate','enddate'].forEach((e)=>{
                        if (d.task[e] != '' && d.task[e].indexOf('-')==-1) {
                            var t=new Date(d.task[e]);
                            d.task[e]=t.getDate()+"-"+(t.getMonth()+1)+"-"+t.getFullYear();
                        }
                    })
                    if (d.task.cycleid == cycleID) {
                        nodeDisplay[d.id].task = true;
                        nodeDisplay[d.id].taskOpacity = 1;
                    }
                    if(d.type=="screens" || d.type=="testcases"){
                        if (d.task.cycleid !=cycleID) {
                            nodeDisplay[d.id].task = true;
                            nodeDisplay[d.id].taskOpacity = 0.5;
                        }
                    }
                    if(d.parent && d.parent.type == 'endtoend'){
                        nodeDisplay[d.id].task = true;
                        nodeDisplay[d.id].taskOpacity = 1;
                    }
                }//showing the task assigned icon little transperent to indicate that task originally do not belongs to this release and cycle but task exists in some other release and cycle
                else if (d.taskexists && d.type !="modules" && d.type !="scenarios") {
                    nodeDisplay[d.id].task = true;
                    nodeDisplay[d.id].taskOpacity = 0.5;
                    }
                }
            })
        dLinks.forEach(function(d) {
            d.id = uuid();
            var lid = 'link-' + d.source.id + '-' + d.target.id
            var link = addLink(d.source, d.target,verticalLayout);
            linkDisplay[lid] = link
            linkDisplay[lid].hidden = (d.source.revertChild || d.source.revertChild1) || false;
        });
        if (verticalLayout){
            translate = [(cSize[0] / 2) - dNodes[0].x, (cSize[1] / 5) - dNodes[0].y]
        } else{
            translate = [(cSize[0] / 3) - dNodes[0].x, (cSize[1] / 2) - dNodes[0].y]
        }
        foldtree(tree)
        return {nodes:nodeDisplay,links:linkDisplay,translate:translate,dNodes,dLinks,sections,count}
    
    }
    // var newHeight = d3.max(levelCount) * 90;
    // const d3Tree = d3.tree().size([newHeight * 2, cSize[0]/3]);
    // const hierarchyLayout = d3.hierarchy(tree);
    // const data = d3Tree(hierarchyLayout);
    // data.each((node, idx) => {
    //     node.id = idx;
    //   });
    // const dNodesArray = data.descendants();
    // const dLinks = data.links();
    // const dNodes = dNodesArray.map((d, idx) => {
    //     const generateId = (parentId, childIndex) => childIndex;
      
    //     const mapChildren = (children, parentId) => {
    //       return children.map((child, childIdx) => {
    //         const newChild = {
    //           ...child.data,
    //           x: child.x,
    //           y: child.y,
    //           id: child.id ? child.id : generateId(parentId, childIdx + 1),
    //           parent: {
    //             ...child.parent.data,
    //             id: child.parent.data.id ? child.parent.data.id : parentId,
    //             // parent: child.parent.parent.data? child.parent.parent.data:null // Use the parent's ID as the unique identifier
    //           }
    //         };
      
    //         if (child.children) {
    //           newChild.children = mapChildren(child.children, newChild.id); // Pass the child's ID as the parent ID for the recursive call
    //         }
      
    //         return newChild;
    //       });
    //     };
      
    //     const newData = {
    //         ...d.data,
    //         x: d.x,
    //         y: d.y,
    //         id: idx,
    //         parent: d.parent ? {
    //           ...d.parent.data,
    //           id: d.parent.data.id ? d.parent.data.id : generateId(idx - 1, 0),
    //           parent: d.parent.parent ? { ...d.parent.parent.data } : null
    //         } : null
    //       };
      
    //     if (d.children) {
    //       newData.children = mapChildren(d.children, newData.id); // Pass the parent's ID as the initial parent ID for children mapping
    //     }
      
    //     return newData;
    //   });
      
    // dNodes.sort(function(a, b) {
    //     return a.childIndex - b.childIndex;
    // });  
    // dNodes.forEach((d,ind)=>{
    //     if (verticalLayout) {
    //             d.y = cSize[0] * 0.1 * (0.9 + typeNum[d.type]);
    //             sections[d.type] = d.y;
    //     } else {
    //             d.y = d.x;
    //             d.x = cSize[0] * 0.1 * (0.9 + typeNum[d.type]);
    //             sections[d.type] = d.x;
    //     }
    //     d.id = ind
    //     count[d.type] += 1; 
    //     d.x = dNodesArray[ind].x
    //     d.y = dNodesArray[ind].y
    //     // d.parent = dNodesArray[ind].parent?dNodesArray[ind].parent.data:null
    //     var node = addNode(d);
    //     nodeDisplay[d.id] = node
    //     nodeDisplay[d.id].task = false;
    //     nodeDisplay[d.id].hidden = ((d.parent)? (d.parent.revertChild || d.parent.revertChild1):false) || false;
    //     if(isAssign){
    //         if (d.task != null) {
    //             //[]convert from date string to %d-%m-%y
    //             ['startdate','enddate'].forEach((e)=>{
    //                 if (d.task[e] != '' && d.task[e].indexOf('-')==-1) {
    //                     var t=new Date(d.task[e]);
    //                     d.task[e]=t.getDate()+"-"+(t.getMonth()+1)+"-"+t.getFullYear();
    //                 }
    //             })
    //             if (d.task.cycleid == cycleID) {
    //                 nodeDisplay[d.id].task = true;
    //                 nodeDisplay[d.id].taskOpacity = 1;
    //             }
    //             if(d.type=="screens" || d.type=="testcases"){
    //                 if (d.task.cycleid !=cycleID) {
    //                     nodeDisplay[d.id].task = true;
    //                     nodeDisplay[d.id].taskOpacity = 0.5;
    //                 }
    //             }
    //             if(d.parent && d.parent.type == 'endtoend'){
    //                 nodeDisplay[d.id].task = true;
    //                 nodeDisplay[d.id].taskOpacity = 1;
    //             }
    //         }//showing the task assigned icon little transperent to indicate that task originally do not belongs to this release and cycle but task exists in some other release and cycle
    //         else if (d.taskexists && d.type !="modules" && d.type !="scenarios") {
    //             nodeDisplay[d.id].task = true;
    //             nodeDisplay[d.id].taskOpacity = 0.5;
    //             }
    //         }
    //     })
    // dLinks.forEach(function(d) {
    //     d.id = uuid();
    //     var lid = 'link-' + d.source.id + '-' + d.target.id
    //     var link = addLink(d.source, d.target,verticalLayout);
    //     linkDisplay[lid] = link
    //     linkDisplay[lid].hidden = (d.source.revertChild || d.source.revertChild1) || false;
    // });
    // if (verticalLayout){
    //     translate = [(cSize[0] / 2) - dNodes[0].x, (cSize[1] / 5) - dNodes[0].y]
    // } else{
    //     translate = [(cSize[0] / 3) - dNodes[0].x, (cSize[1] / 2) - dNodes[0].y]
    // }
    // foldtree(tree)
    // return {nodes:nodeDisplay,links:linkDisplay,translate:translate,dNodes,dLinks,sections,count}
}

export const createNewMap = (verticalLayout,types,name,sections) => {
    var nodeDisplay = {}
    let selectedProject = JSON.parse(localStorage.getItem("DefaultProject"));
    var dNodes = []
    var translate
    var s = d3.select('.mp__canvas_svg');
    var  cSize= [parseFloat(s.style("width")), parseFloat(s.style("height"))];
    var node = {
        id: 0,
        childIndex: 0,
        name: selectedProject.appType === "Webservice" ? 'Collection0' : name ? name :'TestSuite0',
        type: types?types:'modules',
        children: [],
        parent: null,
        state: 'created',
        _id: null
    };
    if (verticalLayout) {
        node.x = cSize[0] * 0.4;
        node.y = sections[node.type]
    }else{
        node.y = cSize[1] * 0.4
        node.x = sections[node.type]
    }
    dNodes.push(node);
    nodeDisplay[0] = addNode(dNodes[0]);
    nodeDisplay[0].task = false;
    if (verticalLayout){
        translate = [(cSize[0] / 2) - dNodes[0].x, (cSize[1] / 5) - dNodes[0].y]
    }
    else{
        translate = [(cSize[0] / 3) - dNodes[0].x, (cSize[1] / 2) - dNodes[0].y]
    }
    return{nodes:nodeDisplay,dNodes,translate,sections}
}

export const addNode = (n,screenData) =>{
    n.display_name = n.name;
    var ch = 10;
    let currentScreen
    let statusCode
    if (n.display_name.length > 10) {
        n.display_name = n.display_name.slice(0, ch) + '...';
    }
    if(n.type==="screens" && n.name !== "" && screenData !== undefined){

        currentScreen=screenData.screenList.filter(screen=>screen.name===n.name)

        statusCode=currentScreen[0]?.statusCode!==undefined ?currentScreen[0].statusCode:null
    }
    var img_src = 'static/imgs/node-' + n.type + '.png';
    if (n.type === 'scenarios') img_src = 'static/imgs/node-' + n.type + '.svg';
    if (n.reuse && (n.type === 'testcases' || n.type === 'screens')) img_src = 'static/imgs/' + n.type + '-reuse.png';
    if (n.type === 'screens' && n.objLen===0) img_src = 'static/imgs/' + n.type + '-capture.png';
    if (n.type === 'screens' && n.objLen===0 && n.reuse) img_src = 'static/imgs/' + n.type + '-reusecapture.png';
    if (n.type === 'testcases' && n.stepsLen===0) img_src = 'static/imgs/' + n.type + '-teststep.png';
    if (n.type === 'testcases' && n.stepsLen===0 && n.reuse) img_src = 'static/imgs/' + n.type + '-reuseteststep.png';
    var accessibility = 'Disable'
    if(n.task && n.task.tasktype == 'Execute Scenario Accessibility Only') accessibility = 'Exclusive'
    else if(n.task && n.task.tasktype == 'Execute Scenario with Accessibility') accessibility = 'Enable'
    var nodeDisplay= {
        'type': n.type,
        'transform': "translate(" + (n.x) + "," + (n.y) + ")",
        'opacity': !( n._id === null || n._id === undefined) ? 1 : 0.5,
        'title': n.name,
        'ac': accessibility,
        'hidden': false,
        'name': n.display_name,
        'img_src': img_src,
        '_id': n._id || null,
        'state':n.state || "created",
        'reuse':n.reuse || false,
        'assignedUser':n.assigneduser|| '',
    };
    if(statusCode){
        nodeDisplay['statusCode']=statusCode
        if(Math.round(window.devicePixelRatio * 100)>90){

        
        nodeDisplay['transformImpact']=statusCode=="SI"?"translate(" + (-24) + "," + (n.y-122) + ")":"translate(" + (5) + "," + (n.y-92) + ")"
        }
        else{
        nodeDisplay['transformImpact']=statusCode=="SI"?"translate(" + (-24) + "," + (n.y-153) + ")":"translate(" + (5) + "," + (n.y-123) + ")"

        }
        if(statusCode=="SI"){
        nodeDisplay['titleImpact']="No impact on this screen."
        }
        else{
            nodeDisplay['titleImpact']="Screen is being impacted.Needs your action."
        }
    }
    return nodeDisplay;
}

export const addLink = (p, c,verticalLayout) => {
        var s;
        var t;
        function genPathData(s, t, vl) {
                const pth = (vl)? (s[0] + ',' + (s[1] + t[1]) / 2 + ' ' + t[0] + ',' + (s[1] + t[1]) / 2):((s[0] + t[0]) / 2 + ',' + s[1] + ' ' + (s[0] + t[0]) / 2 + ',' + t[1]);
                return ('M' + s[0] + ',' + s[1] + 'C' + pth + ' ' + t[0] + ',' + t[1]);
        };
        if (verticalLayout) {
                s = [(p.x + 20), (p.y + 55)];
                t = [(c.x + 20), (c.y - 3)];
        } else {
                s = [p.x + 43, p.y + 20];
                t = [c.x - 3, c.y + 20];
        }
        var d = genPathData(s, t, verticalLayout);
        return { 'd': d }
}

export const moveNodeBegin = (idx,linkDisplay,dLinks,temp,pos,verticalLayout,CanvasFlag) => {
        dLinks.forEach(function(d, i) {
                if (d.source.id === parseInt(idx)) {      
                        if(!linkDisplay['link-' + d.source.id + '-' + d.target.id]){
                                temp.deleted.push(i)
                        }
                        else if(linkDisplay['link-' + d.source.id + '-' + d.target.id].hidden === true){
                                temp.hidden.push(i)
                                temp.s.push(i);
                                delete linkDisplay['link-' + d.source.id + '-' + d.target.id];
                        }else{
                                temp.s.push(i);
                                delete linkDisplay['link-' + d.source.id + '-' + d.target.id];
                        }
                } else if (d.target.id === parseInt(idx)) {
                        temp.t = i;
                        delete linkDisplay['link-' + d.source.id + '-' + d.target.id];
                }
        });
        const svg = d3.select(`.mp__canvas_svg`);
        d3.select('#node_' + idx).classed('ct-movable', !0);
        svg.on('mousemove.nodemove', (event)=>{
                event.stopImmediatePropagation();
                var t = {} ;
                if(CanvasFlag==='createnew')pos=readCtScale();
                // else if(CanvasFlag==='assign')pos=readCtScaleAssign();
                // else if(CanvasFlag==='endtoend')pos=readCtScaleEnE();
                const cSpan = [pos.x, pos.y];
                const cScale = pos.k;
                const svgOff = document.getElementById('mp__canvas_svg').getBoundingClientRect();
                if(verticalLayout){
                        t.x = parseFloat((event.x - svgOff.left - cSpan[0]) / cScale - 20)
                        t.y = parseFloat((event.y - svgOff.top - cSpan[1]) / cScale + 2)
                }else{
                        t.x = parseFloat((event.x - svgOff.left - cSpan[0]) / cScale + 2)
                        t.y = parseFloat((event.y - svgOff.top - cSpan[1]) / cScale - 20)
                }
                d3.select('.ct-movable').attr('transform', "translate(" + t.x + "," + t.y + ")");
        })
        return {linkDisplay,temp}
}

export const moveNodeEnd = (pi,dNodes,dLinks,linkDisplay,temp,verticalLayout) => {
        const svg = d3.select(`.mp__canvas_svg`);
        svg.on('mousemove.nodemove', null);
        // svg.on('zoom', null);
        var p = d3.select("#node_" + pi);
        var l = p.attr('transform').slice(10, -1).split(',');
        dNodes[pi].x = parseFloat(l[0]);
        dNodes[pi].y = parseFloat(l[1]);
        let f;
        if (dNodes[pi].type === 'testcases'){
            for(let d = 0; d<dNodes.length; d++){
                if(dNodes[d].id === dNodes[pi].parent.id){
                    f = d
                    break
                }
            }
            var link = addLink(dNodes[f], dNodes[pi],verticalLayout);
            var lid = 'link-' + dLinks[temp.t].source.id + '-' + dLinks[temp.t].target.id
            linkDisplay[lid] = link
        }else {
            var links = addLink(dLinks[temp.t].source, dNodes[pi],verticalLayout);
            var lids= 'link-' + dLinks[temp.t].source.id + '-' + dLinks[temp.t].target.id
            linkDisplay[lids] = links
        }
        temp.s.forEach(function(d) {
                // if (deletednode_info.indexOf(dLinks[d].target) == -1) {
                        var link = addLink(dNodes[pi], dLinks[d].target,verticalLayout);
                        var lid = 'link-' + dLinks[d].source.id + '-' + dLinks[d].target.id
                        linkDisplay[lid] = link
                        if(temp.hidden.indexOf(d) !== -1){
                                linkDisplay[lid].hidden =  true
                        }
                //}
        });
        p.classed('ct-movable', !1);
        return {linkDisplay}
};

export const toggleNode = (nid, nodeDisplay, linkDisplay, dNodes, dLinks) => {
        var id = nid.split("node_")[1]
        if (dNodes[id]._children && dNodes[id]._children.length > 0) {
                // p.select('.ct-cRight').classed('ct-nodeBubble', !0);
                dNodes[id].children = dNodes[id]._children;
                dNodes[id]._children = null;
                recurseTogChild(nodeDisplay, linkDisplay, dNodes[id], !1, dLinks);
        }  else  if (dNodes[id].children && dNodes[id].children.length > 0) {
                // p.select('.ct-cRight').classed('ct-nodeBubble', !1);  //d._childern 
                dNodes[id]._children = dNodes[id].children;
                dNodes[id].children = null;
                recurseTogChild(nodeDisplay, linkDisplay, dNodes[id], !0, dLinks);
        } 
        return {dLinks,dNodes,nodeDisplay,linkDisplay}
}

export const createNode = (activeNode,nodeDisplay,linkDisplay,dNodes,dLinks,sections,count,obj,verticalLayout,nodeID) => {
        //if nodeID ene then
        let selectedProject = JSON.parse(localStorage.getItem("DefaultProject"));
        var uNix = dNodes.length
        var pi = activeNode;
        var pt = nodeDisplay[pi].type;
        if (pt === 'testcases') return;
        if (false && nodeDisplay[pi]._children != null)
                return ;// openDialogMindmap('Error', 'Expand the node');
        if (dNodes[pi].children === undefined) dNodes[pi]['children'] = [];
        var nNext = {
                'endtoend': ['Scenario', 1],
                'modules': ['Scenario', 1],
                'scenarios': ['Screen', 2],
                'screens': ['Testcase', 4]
        };
        var mapSvg = d3.select('.mp__canvas_svg');
        var w = parseFloat(mapSvg.style('width'));
        var h = parseFloat(mapSvg.style('height'));
        var arr_co = [];
        dNodes.forEach(function(d) {
                if(d.state !== 'deleted'){
                        var objj = {
                                x: parseInt(d.x),
                                y: parseInt(d.y)
                        };
                        arr_co.push(objj);
                }
        });
        count[(nNext[pt][0]).toLowerCase() + 's'] += 1
        var tempName;
        if (obj) {
                tempName = obj;
        } else {
                tempName = (nNext[pt][0]==='Scenario'? selectedProject.appType === "Webservice" ? 'API' :'TestCase': nNext[pt][0]==='Testcase'?'TestSteps':  selectedProject.appType === "Webservice" ? 'Request' :'Screen')+count[(nNext[pt][0]).toLowerCase() + 's'];
        }
        var node = {
                id: uNix,
                children: [],
                y: h * (0.15 * (1.34 + nNext[pt][1]) + Math.random() * 0.1),
                x: 90 + 30 * Math.floor(Math.random() * (Math.floor((w - 150) / 80))),
                parent: dNodes[pi],
                state: 'created',
                path: '',
                name: tempName,
                childIndex: '',
                type: (nNext[pt][0]).toLowerCase() + 's'
        }; 
        getNewPosition(dNodes,node, pi, arr_co,verticalLayout,sections);
        if(nodeID){
                node._id=nodeID
        }
        dNodes.push(node);
        if(Object.isExtensible(dNodes[pi])){
            const newObject = { ...dNodes[pi], children: [...dNodes[pi].children, dNodes[uNix]] };
            dNodes[pi] = newObject;
        }
        else dNodes[pi].children.push(dNodes[uNix]);
        dNodes[uNix].childIndex = dNodes[pi].children.length;
        dNodes[uNix].cidxch = 'true'; // child index updated
        if( dNodes[uNix].type === 'screens')
        for(var i =0; dNodes[0].children.length>i; i++){
            if(dNodes[0].children[i].id === dNodes[uNix].parent.id){
                  const newObject = { ...dNodes[0].children[i], children: [...dNodes[0].children[i].children, dNodes[uNix]] };
                  dNodes[0].children[i] = newObject;
            }
        }
        else if (dNodes[uNix].type === 'testcases') {
            for (var k = 0; k < dNodes[0].children.length; k++) {
              for (var j = 0; j < dNodes[0].children[k].children.length; j++) {
                if (dNodes[0].children[k].children[j].id === dNodes[uNix].parent.id) {
                  const newObject = { ...dNodes[0].children[k].children[j], children: [...dNodes[0].children[k].children[j].children, dNodes[uNix]] };
                  dNodes[0].children[k].children[j] = newObject;
                  for (var m = 0; dNodes.length>m;m++){
                    if(newObject.parent.id === dNodes[m].id){
                        dNodes[m].children = [newObject]
                    }
                  } 
                }
              }
            }
          }
        var currentNode = addNode(dNodes[uNix]);
        var link = {
                id: uuid(),
                source: dNodes[pi],
                target: dNodes[uNix]
        };
        var lid = 'link-' + link.source.id + '-' + link.target.id
        dLinks.push(link);
        var currentLink = addLink(dNodes[pi], dNodes[uNix],verticalLayout);
        nodeDisplay[uNix] = currentNode;
        linkDisplay[lid] = currentLink;
        if(dNodes[uNix].type === 'screens'){
            createNode(uNix, nodeDisplay, linkDisplay,dNodes, dLinks, sections, count, obj, verticalLayout, nodeID)
        }
        return {nodeDisplay,linkDisplay,dNodes,dLinks,count}
}
export const createNodeSingle = (activeNode,nodeDisplay,linkDisplay,dNodes,dLinks,sections,count,obj,verticalLayout,nodeID) => {
    //if nodeID ene then
    let selectedProject = JSON.parse(localStorage.getItem("DefaultProject"));
    var uNix = dNodes.length
    var pi = activeNode;
    var pt = nodeDisplay[pi].type;
    if (pt === 'testcases') return;
    if (false && nodeDisplay[pi]._children != null)
            return ;// openDialogMindmap('Error', 'Expand the node');
    if (dNodes[pi].children === undefined) dNodes[pi]['children'] = [];
    var nNext = {
            'endtoend': ['Scenario', 1],
            'modules': ['Scenario', 1],
            'scenarios': ['Screen', 2],
            'screens': ['Testcase', 4]
    };
    var mapSvg = d3.select('.mp__canvas_svg');
    var w = parseFloat(mapSvg.style('width'));
    var h = parseFloat(mapSvg.style('height'));
    var arr_co = [];
    dNodes.forEach(function(d) {
            if(d.state !== 'deleted'){
                    var objj = {
                            x: parseInt(d.x),
                            y: parseInt(d.y)
                    };
                    arr_co.push(objj);
            }
    });
    count[(nNext[pt][0]).toLowerCase() + 's'] += 1
    var tempName;
    if (obj) {
            tempName = obj;
    } else {
            tempName = (nNext[pt][0]==='Scenario'? selectedProject.appType === "Webservice" ? 'API' :'TestCase': nNext[pt][0]==='Testcase'?'TestSteps':  selectedProject.appType === "Webservice" ? 'Request' :'Screen')+count[(nNext[pt][0]).toLowerCase() + 's'];
    }
    var node = {
            id: uNix,
            children: [],
            y: h * (0.15 * (1.34 + nNext[pt][1]) + Math.random() * 0.1),
            x: 90 + 30 * Math.floor(Math.random() * (Math.floor((w - 150) / 80))),
            parent: dNodes[pi],
            state: 'created',
            path: '',
            name: tempName,
            childIndex: '',
            type: (nNext[pt][0]).toLowerCase() + 's'
    }; 
    getNewPosition(dNodes,node, pi, arr_co,verticalLayout,sections);
    if(nodeID){
            node._id=nodeID
    }
    dNodes.push(node);
    if(Object.isExtensible(dNodes[pi])){
        const newObject = { ...dNodes[pi], children: [...dNodes[pi].children, dNodes[uNix]] };
        dNodes[pi] = newObject;
    }
    else dNodes[pi].children.push(dNodes[uNix]);
    dNodes[uNix].childIndex = dNodes[pi].children.length;
    dNodes[uNix].cidxch = 'true'; // child index updated
    if( dNodes[uNix].type === 'screens')
    for(var i =0; dNodes[0].children.length>i; i++){
        if(dNodes[0].children[i].id === dNodes[uNix].parent.id){
              const newObject = { ...dNodes[0].children[i], children: [...dNodes[0].children[i].children, dNodes[uNix]] };
              dNodes[0].children[i] = newObject;
        }
    }
    else if (dNodes[uNix].type === 'testcases') {
        for (var k = 0; k < dNodes[0].children.length; k++) {
          for (var j = 0; j < dNodes[0].children[k].children.length; j++) {
            if (dNodes[0].children[k].children[j].id === dNodes[uNix].parent.id) {
              const newObject = { ...dNodes[0].children[k].children[j], children: [...dNodes[0].children[k].children[j].children, dNodes[uNix]] };
              dNodes[0].children[k].children[j] = newObject;
              for (var m = 0; dNodes.length>m;m++){
                if(newObject.parent.id === dNodes[m].id){
                    dNodes[m].children = [newObject]
                }
              } 
            }
          }
        }
      }
    var currentNode = addNode(dNodes[uNix]);
    var link = {
            id: uuid(),
            source: dNodes[pi],
            target: dNodes[uNix]
    };
    var lid = 'link-' + link.source.id + '-' + link.target.id
    dLinks.push(link);
    var currentLink = addLink(dNodes[pi], dNodes[uNix],verticalLayout);
    nodeDisplay[uNix] = currentNode;
    linkDisplay[lid] = currentLink;
    return {nodeDisplay,linkDisplay,dNodes,dLinks,count}
}
export const deleteNode = (activeNode,dNodes,dLinks,linkDisplay,nodeDisplay) =>{
    var deletedNodes = []
    var sid = parseFloat(activeNode.split('node_')[1])
    var s = d3.select('#'+activeNode);
    // SaveCreateED('#ct-createAction', 1, 0);
    var t = s.attr('data-nodetype');
    if (t === 'modules' || t === 'endtoend') return;
    var p = dNodes[sid].parent;
    // if(dNodes[sid]['taskexists']!=null && dNodes[sid]['taskexists'].status !== 'complete'){
    //     setMsg(MSG.MINDMAP.WARN_TASK_ASSIGNED)
    //     return; 
    // }
    // var taskCheck=checkparenttask(dNodes[sid],false);
    // if(taskCheck){
    //     setMsg(MSG.MINDMAP.WARN_PARENT_TASK_ASSIGNED)
    //     return;
    // }
    // taskCheck=checkchildrentask(dNodes[sid],false);
    // if(taskCheck){
    //     setMsg(MSG.MINDMAP.WARN_CHILD_TASK_ASSIGNED)
    //     return;
    // }
    recurseDelChild(dNodes[sid],linkDisplay, nodeDisplay,dNodes,dLinks,undefined,deletedNodes);
    for (var j = dLinks.length - 1; j >= 0; j--) {
        if (dLinks[j].target.id === sid){
            dLinks[j].deleted = !0;
            delete linkDisplay['link-' + dLinks[j].source.id + '-' + dLinks[j].target.id];
            break;
        }
    }
    p.children.some((d, i)=>{
        if (d.id === sid) {
            p.children.splice(i, 1);
            return !0;
        }
        return !1;
    });
    if (dNodes[sid].type === 'scenarios') {
        dNodes[0].children = dNodes[0].children.filter(child=> child.id !== dNodes[sid].id)   
    } else if (dNodes[sid].type === 'screens') {
        for (var l = 0; l < dNodes[0].children.length; l++) {
            if (dNodes[0].children[l].name === p.name) {
                dNodes[0].children[l].children = dNodes[0].children[l].children.filter(child=>child.id !== sid)
            }
        }
    } else if (dNodes[sid].type === 'testcases') {
        for (var k = 0; k < dNodes[0].children.length; k++) {
            for (var m = 0; m < dNodes[0].children[k].children.length; m++) {
                if (dNodes[0].children[k].children[m].name === p.name) {
                    dNodes[0].children[k].children[m].children = dNodes[0].children[k].children[m].children.filter(child=>child.id !== sid)
                }
            }
        }
    }       
    if (p["_id"]== null && p["state"]=="created" && p["type"]=="endtoend") {deletedNodes=[]}
    return {dNodes,dLinks,linkDisplay,nodeDisplay,deletedNodes}
}

export const ClickSwitchLayout = (verticalLayout,setVerticalLayout,moduleSelect,setBlockui,dispatch) =>{
    if(verticalLayout){
      setBlockui({show:true,content:'Switching Layout...'})
      // dispatch({type:actionTypes.SELECT_MODULE,payload:{switchlayout:true}})
      setVerticalLayout(false)
      return;
    }
    if(Object.keys(moduleSelect).length<1){
      return;
    }
    setBlockui({show:true,content:'Switching Layout...'})
    // dispatch({type:actionTypes.SELECT_MODULE,payload:{switchlayout:true}})
    setVerticalLayout(true)
  }

//pd Utils
const xml2json = (xml, tab) => {
    var X = {
        toObj: function (xml) {
            var o = {};
            if (xml.nodeType == 1) {   // element node ..
                if (xml.attributes.length)   // element with attributes  ..
                    for (var i = 0; i < xml.attributes.length; i++)
                        o["@" + xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();
                if (xml.firstChild) { // element has child nodes ..
                    var textChild = 0, cdataChild = 0, hasElementChild = false;
                    for (var n = xml.firstChild; n; n = n.nextSibling) {
                        if (n.nodeType == 1) hasElementChild = true;
                        else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                        else if (n.nodeType == 4) cdataChild++; // cdata section node
                    }
                    if (hasElementChild) {
                        if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                            X.removeWhite(xml);
                            for (n = xml.firstChild; n; n = n.nextSibling) {
                                if (n.nodeType == 3)  // text node
                                    o["#text"] = X.escape(n.nodeValue);
                                else if (n.nodeType == 4)  // cdata node
                                    o["#cdata"] = X.escape(n.nodeValue);
                                else if (o[n.nodeName]) {  // multiple occurence of element ..
                                    if (o[n.nodeName] instanceof Array)
                                        o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                    else
                                        o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                                }
                                else  // first occurence of element..
                                    o[n.nodeName] = X.toObj(n);
                            }
                        }
                        else { // mixed content
                            if (!xml.attributes.length)
                                o = X.escape(X.innerXml(xml));
                            else
                                o["#text"] = X.escape(X.innerXml(xml));
                        }
                    }
                    else if (textChild) { // pure text
                        if (!xml.attributes.length)
                            o = X.escape(X.innerXml(xml));
                        else
                            o["#text"] = X.escape(X.innerXml(xml));
                    }
                    else if (cdataChild) { // cdata
                        if (cdataChild > 1)
                            o = X.escape(X.innerXml(xml));
                        else
                            for (n = xml.firstChild; n; n = n.nextSibling)
                                o["#cdata"] = X.escape(n.nodeValue);
                    }
                }
                if (!xml.attributes.length && !xml.firstChild) o = null;
            }
            else if (xml.nodeType == 9) { // document.node
                o = X.toObj(xml.documentElement);
            }
            else
                alert("unhandled node type: " + xml.nodeType);
            return o;
        },
        toJson: function (o, name, ind) {
            var json = name ? ("\"" + name + "\"") : "";
            if (o instanceof Array) {
                for (var i = 0, n = o.length; i < n; i++)
                    o[i] = X.toJson(o[i], "", ind + "\t");
                json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
            }
            else if (o == null)
                json += (name && ":") + "null";
            else if (typeof (o) == "object") {
                var arr = [];
                for (var m in o)
                    arr[arr.length] = X.toJson(o[m], m, ind + "\t");
                json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
            }
            else if (typeof (o) == "string")
                json += (name && ":") + "\"" + o.toString() + "\"";
            else
                json += (name && ":") + o.toString();
            return json;
        },
        innerXml: function (node) {
            var s = ""
            if ("innerHTML" in node)
                s = node.innerHTML;
            else {
                var asXml = function (n) {
                    var s = "";
                    if (n.nodeType == 1) {
                        s += "<" + n.nodeName;
                        for (var i = 0; i < n.attributes.length; i++)
                            s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
                        if (n.firstChild) {
                            s += ">";
                            for (var c = n.firstChild; c; c = c.nextSibling)
                                s += asXml(c);
                            s += "</" + n.nodeName + ">";
                        }
                        else
                            s += "/>";
                    }
                    else if (n.nodeType == 3)
                        s += n.nodeValue;
                    else if (n.nodeType == 4)
                        s += "<![CDATA[" + n.nodeValue + "]]>";
                    return s;
                };
                for (var c = node.firstChild; c; c = c.nextSibling)
                    s += asXml(c);
            }
            return s;
        },
        escape: function (txt) {
            return txt.replace(/[\\]/g, "\\\\")
                .replace(/[\"]/g, '\\"')
                .replace(/[\n]/g, '\\n')
                .replace(/[\r]/g, '\\r');
        },
        removeWhite: function (e) {
            e.normalize();
            for (var n = e.firstChild; n;) {
                if (n.nodeType == 3) {  // text node
                    if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                        var nxt = n.nextSibling;
                        e.removeChild(n);
                        n = nxt;
                    }
                    else
                        n = n.nextSibling;
                }
                else if (n.nodeType == 1) {  // element node
                    X.removeWhite(n);
                    n = n.nextSibling;
                }
                else                      // any other node
                    n = n.nextSibling;
            }
            return e;
        }
    };
    if (xml.nodeType == 9) // document node
        xml = xml.documentElement;
    var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
    return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
} 

export const getApptypePD = (data) =>{
    var cdata;
    var file = JSON.parse(data);
    var doc = new DOMParser().parseFromString(file.data,'text/xml');
    var activityJSON = JSON.parse(xml2json(doc).replace("\nundefined",""));
    if(activityJSON["mxGraphModel"]["root"]["Task"].length>1){
        cdata = JSON.parse(activityJSON["mxGraphModel"]["root"]["Task"][0]["#cdata"]);  
    }else{
        cdata = JSON.parse(activityJSON["mxGraphModel"]["root"]["Task"]["#cdata"]);
    }
    return cdata[0]['apptype'].toLowerCase()
}

export const getJsonPd = (orderMatrix) =>{
        var dataJSON = [{
            name:'Module_'+uuid(),
            type:1
        }];
        orderMatrix.forEach((orderList)=>{
            dataJSON.push({
                    name:'Scenario_'+uuid(),
                    type:2
            });
            orderList.forEach((data)=>{
                    dataJSON.push({
                            name:"Screen_"+data.label,
                            type:3
                    });     
                    dataJSON.push({
                            name:"Testcase_"+data.label,
                            type:4
                    });                                                             
            });    
        });
        return dataJSON
}

//reference bar items
export const ClickFullScreen = (setFullScreen) => {
    var elt = document.querySelector("html");
    if ((window.fullScreen) || (window.innerWidth == window.screen.width && (window.screen.height - window.innerHeight) <= 1)) {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
        setFullScreen(false)
    } else {
        if (elt.requestFullscreen) {
            elt.requestFullscreen();
        } else if (elt.msRequestFullscreen) {
            elt.msRequestFullscreen();
        } else if (elt.mozRequestFullScreen) {
            elt.mozRequestFullScreen();
        } else if (elt.webkitRequestFullscreen) {
            elt.webkitRequestFullscreen();
        } else {
            return;
        }
        setFullScreen(true)
    }
} 

/*function parseProjList
    use:  parses input value to list of project props
*/

export const parseProjList = (res) => {
    var proj = {};

    if (
        res.projectId &&
        res.appType &&
        res.projectName &&
        res.appTypeName &&
        res.releases &&
        res.domains &&
        res.projectlevelrole &&
        Array.isArray(res.projectlevelrole[0])
    ) {
        res.projectId.forEach((e, i) => {
            proj[res.projectId[i]] = {
                'apptype': res.appType[i],
                'name': res.projectName[i],
                'apptypeName': res.appTypeName[i],
                'id': res.projectId[i],
                'releases': res.releases[i],
                'domains': res.domains[i],
                'projectLevelRole': res?.projectlevelrole[0][i]["assignedrole"]
            };
        });
    } else {
        proj = {}
    }

    return proj;
};
