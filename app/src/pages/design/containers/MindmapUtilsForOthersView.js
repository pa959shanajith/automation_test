/*eslint eqeqeq: "off"*/
import * as d3 from 'd3';
import { v4 as uuid } from 'uuid'
import { readCtScale } from './CanvasNew';
import { Button } from 'primereact/button';
import { ContextMenu } from 'primereact/contextmenu';

function unfoldtree(d) {
    // d3.select('#node_' + d.id).classed('no-disp', !1).select('.ct-cRight').classed('ct-nodeBubble', !0); 
    if (d.parent && (d.parent.revertChild || d.parent.revertChild1)) d.revertChild1 = true;
    if (d._children) {
        d.children = d._children;
        d._children = null;
        d.revertChild = true;
    }
    if (d.children) d.children.forEach(unfoldtree);
}

function foldtree(d) {
    if (d.children) d.children.forEach(foldtree);
    if (d.revertChild1) delete d.revertChild1;
    if (d.revertChild) {
        d._children = d.children;
        d.children = null;
        delete d.revertChild;
    }
}

const recurseTogChild = (nodeDisplay, linkDisplay, d, v, dLinks) => {
    if (d.children) d.children.forEach(function (e) {
        recurseTogChild(nodeDisplay, linkDisplay, e, v, dLinks);
        nodeDisplay[e.id].hidden = v;
        for (var j = dLinks.length - 1; j >= 0; j--) {
            var lid = 'link-' + dLinks[j].source.id + '-' + dLinks[j].target.id
            if (linkDisplay[lid] && dLinks[j].source.id === d.id) {
                linkDisplay[lid].hidden = v
            }
        }
    });
    else if (d._children) d._children.forEach(function (e) {
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

const getNewPosition = (dNodes, node, pi, arr_co, layout_vertical, sections) => {
    //dNodes[pi].children are arranged in increasing
    // order of x/y disance depending on layout
    var index;
    var new_one;
    if (dNodes[pi].children.length > 0) { // new node has siblings
        if (dNodes[pi].type === "scenarios") {
            if (dNodes[pi].children[0].id !== node.id) {
                index = node.parentID
                new_one = {
                    x: sections[node.type] + 200,
                    y: parseInt(dNodes[index].y)
                };
            } else {
                index = dNodes[pi].children.length - 1
                new_one = {
                    x: sections[node.type],
                    y: parseInt(dNodes[pi].y)
                };
            }

            node = getNonOverlappingPosition(node, arr_co, new_one, layout_vertical);
        } else if (dNodes[pi].type === 'teststepsgroups' && dNodes[pi].children.length > 0) {
            var index1 = dNodes[pi].id
            var new_one1 = {
                x: sections[node.type],
                y: parseInt(dNodes[index1].y)
            };
            // node = getNonOverlappingPosition_1(node, arr_co, new_one1,layout_vertical);
            if (node.children.length > 0) {
                var index2 = node.children[0].id - 1
                var new_one2 = {
                    x: sections[node.type],
                    y: parseInt(dNodes[index2].y)
                };
                // node = getNonOverlappingPosition_2(node.children[0], arr_co, new_one2,layout_vertical);
            } else {
                index2 = node.id - 1
                new_one2 = {
                    x: parseInt(dNodes[index2].x) + 200,
                    y: parseInt(dNodes[index2].y)
                };
                node = getNonOverlappingPosition_2(node, arr_co, new_one2, layout_vertical);
            }
        }
        else {
            index = dNodes[pi].children.length - 1
            new_one = {
                x: sections[node.type],
                y: parseInt(dNodes[pi].children[index].y)
            };
            node = getNonOverlappingPosition(node, arr_co, new_one, layout_vertical);
        }
        if (layout_vertical) {
            if ((dNodes[pi].type === "scenarios") && (dNodes[pi]?.parent?._id !== null)) {
                new_one = {
                    x: parseInt(dNodes[pi].children[index].x) + 100,
                    y: sections[node.type] - 100
                };// Go beside last sibling node
            } else if ((dNodes[pi].type === "teststepgroups") && (dNodes[pi]?.parent?.parent?._id !== null)) {
                new_one = {
                    x: parseInt(dNodes[pi].children[index].x) + 100,
                    y: sections[node.type] - 90
                };// Go beside last sibling node
            } else if ((dNodes[pi].type === "modules") && (dNodes[pi]?._id !== null)) {
                new_one = {
                    x: parseInt(dNodes[pi].children[index].x) + 100,
                    y: sections[node.type] - 120
                };// Go beside last sibling node
            } else {
                new_one = {
                    x: parseInt(dNodes[pi].children[index].x) + 100,
                    y: sections[node.type]
                }; // Go beside last sibling node
            }
        }
        else {
            // new_one = {
            //     x: sections[node.type],
            //     y: parseInt(dNodes[pi].children[index].y)
            // };
        }
        // node = getNonOverlappingPosition(node, arr_co, new_one,layout_vertical);
    } else { //first kid of any node
        if (dNodes[pi].parent != null) { //if kid of scenario/testcase/screen
            // var arr = dNodes[pi].parent.children;
            index = dNodes[pi].parent.children.length - 1; //number of parents siblings - 1
            //new_one={x:parseInt(arr[index].x),y:parseInt(arr[index].y)+125};
            if (layout_vertical) {
                new_one = {
                    x: parseInt(dNodes[pi].x),
                    y: parseInt(sections[node.type])
                }; // go directly below parent
            } else {
                new_one = {
                    x: parseInt(sections[node.type]),
                    y: parseInt(dNodes[pi].y)
                }; // go directly below parent
            }
            node = getNonOverlappingPosition(node, arr_co, new_one, layout_vertical);
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

const getNonOverlappingPosition = (node, arr_co, new_one, verticalLayout) => {
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
const getNonOverlappingPosition_1 = (node, arr_co, new_one, verticalLayout) => {
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
const getNonOverlappingPosition_2 = (node, arr_co, new_one, verticalLayout) => {
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

const checkparenttask = (parentNode, parent_flag) => {
    if (parent_flag) return parent_flag;
    if (parentNode != null) {
        if (parentNode.taskexists != null && parentNode.taskexists.status !== 'complete') {
            parent_flag = true;
        }
        parentNode = parentNode.parent || null;
        parent_flag = checkparenttask(parentNode, parent_flag);
    }
    return parent_flag;
}

const checkchildrentask = (childNode, children_flag) => {
    if (children_flag) return children_flag;
    if (childNode.taskexists != null) {
        children_flag = true;
        return children_flag;
    }
    if (childNode.children) {
        childNode.children.forEach((e) => { children_flag = checkchildrentask(e, children_flag) })
    }
    return children_flag;
}

const recurseDelParent = (d, d1, linkDisplay, nodeDisplay, dNodes, dLinks, tab, deletedNodes) => {
    if (d.children) d.children.forEach((e) => { recurseDelParent(d1, e, linkDisplay, nodeDisplay, dNodes, dLinks, tab, deletedNodes) });
    if (d.state === "deleted") return;
    if (d._id) {
        var parentid = d.parent._id;
        deletedNodes.push([d._id, d.type, parentid]);
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
const recurseDelChild = (d, linkDisplay, nodeDisplay, dNodes, dLinks, tab, deletedNodes) => {
    if (d.children) d.children.forEach((e) => { recurseDelChild(e, linkDisplay, nodeDisplay, dNodes, dLinks, tab, deletedNodes) });
    if (d.state === "deleted") return;
    if (d._id) {
        var parentid = d.parent._id;
        deletedNodes.push([d._id, d.type, parentid]);
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

export const generateTreeOfView = (tree, sections, count, verticalLayout, screenData, isAssign, cycleID) => {
    unfoldtree(tree)
    var translate;
    var nodeDisplay = {}
    var linkDisplay = {}
    var s = d3.select('.mp__canvas_svg');
    let cSize = [parseFloat(s.style("width")), parseFloat(s.style("height"))];
    var typeNum = {
        'modules': 0,
        'endtoend': 0,
        'scenarios': 1,
        'teststepsgroups': 2,
    };
    var levelCount = [1]
    function childCounter(l, s) {
        if (levelCount.length <= l) levelCount.push(0);
        if (s.children) {
            levelCount[l] += s.children.length;
            s.children.forEach(function (d) {
                childCounter(l + 1, d);
            });
        }
    };
    childCounter(1, tree);
    if (tree.type !== "endtoend") {
        var newHeight = d3.max(levelCount) * 90;
        const d3Tree = d3.tree().size([newHeight * 2, cSize[0]]);
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
                            parent: child.parent ? child.data.parent : null,
                            children: [{ ...child.data, id: child.id ? child.id : generateId(parentId, childIdx + 1) }] // Use the parent's ID as the unique identifier
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
                id: d.id ? d.id : idx,
                parent: d.parent ? d.data.parent ? {
                    ...d.data.parent,
                } : {
                    ...d.parent.data,
                    id: d.parent.id ? d.parent.id : generateId(idx - 1, 0),
                    parent: d.parent ? { ...d.parent.data } : null
                } : null
            };

            if (d.children) {
                newData.children = mapChildren(d.children, newData.id); // Pass the parent's ID as the initial parent ID for children mapping
            }

            return newData;
        });
        dNodes.forEach((d, ind) => {
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
            d.x = dNodesArray[ind].y
            d.y = dNodesArray[ind].x
            // d.parent = dNodesArray[ind].parent?dNodesArray[ind].parent.data:null
            var node = addNode(d, screenData);
            nodeDisplay[d.id] = node
            nodeDisplay[d.id].task = false;
            nodeDisplay[d.id].hidden = ((d.parent) ? (d.parent.revertChild || d.parent.revertChild1) : false) || false;
        })
        dLinks.forEach(function (d) {
            d.id = uuid();
            var lid = 'link-' + d.source.id + '-' + d.target.id
            var link = addLink(d.source, d.target, verticalLayout);
            linkDisplay[lid] = link
            linkDisplay[lid].hidden = (d.source.revertChild || d.source.revertChild1) || false;
        });
        if (verticalLayout) {
            translate = [(cSize[0] / 2) - dNodes[0].x, (cSize[1] / 5) - dNodes[0].y - 100]
        } else {
            translate = [(cSize[0] / 3) - dNodes[0].x, (cSize[1] / 2) - dNodes[0].y]
        }
        foldtree(tree)
        return { nodes: nodeDisplay, links: linkDisplay, translate: translate, dNodes, dLinks, sections, count }
    } else {
        var newHeights = d3.max(levelCount) * 90;
        const d3Tree = d3.tree().size([newHeights * 2, cSize[0] / 9]);
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
            };

            if (d.children) {
                newData.children = mapChildren(d.children, newData.id); // Pass the parent's ID as the initial parent ID for children mapping
            }

            return newData;
        });
        dNodes.forEach((d, ind) => {
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
            d.x = cSize[0] * 0.1 * (0.9 + typeNum[d.type]);
            sections[d.type] = d.x;
            d.y = dNodesArray[ind].x
            // d.parent = dNodesArray[ind].parent?dNodesArray[ind].parent.data:null
            var node = addNode(d);
            nodeDisplay[d.id] = node
            nodeDisplay[d.id].task = false;
            nodeDisplay[d.id].hidden = ((d.parent) ? (d.parent.revertChild || d.parent.revertChild1) : false) || false;
        })
        dLinks.forEach(function (d) {
            d.id = uuid();
            var lid = 'link-' + d.source.id + '-' + d.target.id
            var link = addLink(d.source, d.target, verticalLayout);
            linkDisplay[lid] = link
            linkDisplay[lid].hidden = (d.source.revertChild || d.source.revertChild1) || false;
        });
        if (verticalLayout) {
            translate = [(cSize[0] / 2) - dNodes[0].x, (cSize[1] / 5) - dNodes[0].y]
        } else {
            translate = [(cSize[0] / 3) - dNodes[0].x, (cSize[1] / 2) - dNodes[0].y]
        }
        foldtree(tree)
        return { nodes: nodeDisplay, links: linkDisplay, translate: translate, dNodes, dLinks, sections, count }

    }
}

export const createNewMap = (verticalLayout, types, name, sections) => {
    var nodeDisplay = {}
    var dNodes = []
    var translate
    var s = d3.select('.mp__canvas_svg');
    var cSize = [parseFloat(s.style("width")), parseFloat(s.style("height"))];
    var node = {
        id: 0,
        childIndex: 0,
        name: name ? name : 'TestSuite0',
        type: types ? types : 'modules',
        children: [],
        parent: null,
        state: 'created',
        _id: null
    };
    if (verticalLayout) {
        node.x = cSize[0] * 0.4;
        node.y = sections[node.type]
    } else {
        node.y = cSize[1] * 0.4
        node.x = sections[node.type]
    }
    dNodes.push(node);
    nodeDisplay[0] = addNode(dNodes[0]);
    nodeDisplay[0].task = false;
    if (verticalLayout) {
        translate = [(cSize[0] / 2) - dNodes[0].x, (cSize[1] / 5) - dNodes[0].y]
    }
    else {
        translate = [(cSize[0] / 3) - dNodes[0].x, (cSize[1] / 2) - dNodes[0].y]
    }
    return { nodes: nodeDisplay, dNodes, translate, sections }
}

export const addNode = (n, screenData) => {
    n.display_name = n.name;
    var ch = 10;
    let currentScreen
    let statusCode
    if (n.display_name.length > 10) {
        n.display_name = n.display_name.slice(0, ch) + '...';
    }
    if (n.type === "screens" && n.name !== "" && screenData !== undefined) {

        currentScreen = screenData.screenList.filter(screen => screen.name === n.name)

        statusCode = currentScreen[0]?.statusCode !== undefined ? currentScreen[0].statusCode : null
    }
    var img_src = 'static/imgs/node-' + n.type + '.png';
    if (n.type === 'scenarios') img_src = 'static/imgs/node-' + n.type + '.svg';
    if (n.reuse && (n.type === 'teststepsgroups')) img_src = img_src = 'static/imgs/' + n.type + '-reuse.svg';
    if (n.type === 'teststepsgroups' && n.objLen === 0) img_src = 'static/imgs/node-' + n.type + '.png';
    if (n.type === 'teststepsgroups' && n.objLen === 0 && n.reuse) img_src = 'static/imgs/node-' + n.type + '.png';
    if (n.type === 'teststepsgroups' && n.stepsLen === 0) img_src = 'static/imgs/' + n.type + '-teststepsgroups.svg';
    if (n.type === 'teststepsgroups' && n.stepsLen === 0 && n.reuse) img_src = 'static/imgs/' + n.type + '-reuseteststepsgroups.svg';
    var accessibility = 'Disable'
    if (n.task && n.task.tasktype == 'Execute Scenario Accessibility Only') accessibility = 'Exclusive'
    else if (n.task && n.task.tasktype == 'Execute Scenario with Accessibility') accessibility = 'Enable'
    var nodeDisplay = {
        'type': n.type,
        'transform': "translate(" + (n.x) + "," + (n.y) + ")",
        'opacity': !(n._id === null || n._id === undefined) ? 1 : 0.5,
        'title': n.name,
        'ac': accessibility,
        'hidden': false,
        'name': n.display_name,
        'img_src': img_src,
        '_id': n._id || null,
        'state': n.state || "created",
        'reuse': n.reuse || false,
    };
    if (statusCode) {
        nodeDisplay['statusCode'] = statusCode
        if (Math.round(window.devicePixelRatio * 100) > 90) {


            nodeDisplay['transformImpact'] = statusCode == "SI" ? "translate(" + (-24) + "," + (n.y - 122) + ")" : "translate(" + (5) + "," + (n.y - 92) + ")"
        }
        else {
            nodeDisplay['transformImpact'] = statusCode == "SI" ? "translate(" + (-24) + "," + (n.y - 153) + ")" : "translate(" + (5) + "," + (n.y - 123) + ")"

        }
        if (statusCode == "SI") {
            nodeDisplay['titleImpact'] = "No impact on this screen."
        }
        else {
            nodeDisplay['titleImpact'] = "Screen is being impacted.Needs your action."
        }
    }
    return nodeDisplay;
}
export const addNode_1 = (n, screenData) => {
    n.display_name = n.name;
    var ch = 10;
    let currentScreen
    let statusCode
    if (n.display_name.length > 10) {
        n.display_name = n.display_name.slice(0, ch) + '...';
    }
    if (n.type === "screens" && n.name !== "" && screenData !== undefined) {

        currentScreen = screenData.screenList.filter(screen => screen.name === n.name)

        statusCode = currentScreen[0]?.statusCode !== undefined ? currentScreen[0].statusCode : null
    }
    var img_src = 'static/imgs/node-' + n.type + '.png';
    if (n.type === 'scenarios') img_src = 'static/imgs/node-' + n.type + '.svg';
    if (n.reuse && (n.type === 'teststepsgroups')) img_src = img_src = 'static/imgs/' + n.type + '-reuse.svg';
    if (n.type === 'teststepsgroups' && n.objLen === 0) img_src = 'static/imgs/node-' + n.type + '.png';
    if (n.type === 'teststepsgroups' && n.objLen === 0 && n.reuse) img_src = 'static/imgs/node-' + n.type + '.png';
    if (n.type === 'teststepsgroups' && n.stepsLen === 0) img_src = 'static/imgs/' + n.type + '-teststepsgroups.svg';
    if (n.type === 'teststepsgroups' && n.stepsLen === 0 && n.reuse) img_src = 'static/imgs/' + n.type + '-reuseteststepsgroups.svg';
    var accessibility = 'Disable'
    if (n.task && n.task.tasktype == 'Execute Scenario Accessibility Only') accessibility = 'Exclusive'
    else if (n.task && n.task.tasktype == 'Execute Scenario with Accessibility') accessibility = 'Enable'
    var nodeDisplay = {
        'type': n.type,
        'transform': "translate(" + (n.y) + "," + (n.x) + ")",
        'opacity': !(n._id === null || n._id === undefined) ? 1 : 0.5,
        'title': n.name,
        'ac': accessibility,
        'hidden': false,
        'name': n.display_name,
        'img_src': img_src,
        '_id': n._id || null,
        'state': n.state || "created",
        'reuse': n.reuse || false,
    };
    if (statusCode) {
        nodeDisplay['statusCode'] = statusCode
        if (Math.round(window.devicePixelRatio * 100) > 90) {


            nodeDisplay['transformImpact'] = statusCode == "SI" ? "translate(" + (-24) + "," + (n.y - 122) + ")" : "translate(" + (5) + "," + (n.y - 92) + ")"
        }
        else {
            nodeDisplay['transformImpact'] = statusCode == "SI" ? "translate(" + (-24) + "," + (n.y - 153) + ")" : "translate(" + (5) + "," + (n.y - 123) + ")"

        }
        if (statusCode == "SI") {
            nodeDisplay['titleImpact'] = "No impact on this screen."
        }
        else {
            nodeDisplay['titleImpact'] = "Screen is being impacted.Needs your action."
        }
    }
    return nodeDisplay;
}

export const addLink = (p, c, verticalLayout) => {
    var s;
    var t;
    function genPathData(s, t, vl) {
        const pth = (vl) ? (s[0] + ',' + (s[1] + t[1]) / 2 + ' ' + t[0] + ',' + (s[1] + t[1]) / 2) : ((s[0] + t[0]) / 2 + ',' + s[1] + ' ' + (s[0] + t[0]) / 2 + ',' + t[1]);
        return ('M' + s[0] + ',' + s[1] + 'C' + pth + ' ' + t[0] + ',' + t[1]);
    };
    if (verticalLayout) {
        s = [(p.x + 20), (p.y + 55)];
        t = [(c.x + 20), (c.y - 3)];
    } else {
        s = [p.y + 43, p.x + 20];
        t = [c.y - 3, c.x + 20];
    }
    var d = genPathData(s, t, verticalLayout);
    return { 'd': d }
}
export const addLinkNew = (p, c, verticalLayout) => {
    var s;
    var t;
    function genPathData(s, t, vl) {
        const pth = (vl) ? (s[0] + ',' + (s[1] + t[1]) / 2 + ' ' + t[0] + ',' + (s[1] + t[1]) / 2) : ((s[0] + t[0]) / 2 + ',' + s[1] + ' ' + (s[0] + t[0]) / 2 + ',' + t[1]);
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
export const addLinkNew_1 = (p, c, verticalLayout) => {
    var s;
    var t;
    function genPathData(s, t, vl) {
        const pth = (vl) ? (s[0] + ',' + (s[1] + t[1]) / 2 + ' ' + t[0] + ',' + (s[1] + t[1]) / 2) : ((s[0] + t[0]) / 2 + ',' + s[1] + ' ' + (s[0] + t[0]) / 2 + ',' + t[1]);
        return ('M' + s[0] + ',' + s[1] + 'C' + pth + ' ' + t[0] + ',' + t[1]);
    };
    if (verticalLayout) {
        s = [(p.x + 20), (p.y + 55)];
        t = [(c.x + 20), (c.y - 3)];
    } else {
        s = [p.x + 43, p.y + 20];
        t = [c.y - 3, c.x + 20];
    }
    var d = genPathData(s, t, verticalLayout);
    return { 'd': d }
}

export const moveNodeBegin = (idx, linkDisplay, dLinks, temp, pos, verticalLayout, CanvasFlag) => {
    dLinks.forEach(function (d, i) {
        if (d.source.id === parseInt(idx)) {
            if (!linkDisplay['link-' + d.source.id + '-' + d.target.id]) {
                temp.deleted.push(i)
            }
            else if (linkDisplay['link-' + d.source.id + '-' + d.target.id].hidden === true) {
                temp.hidden.push(i)
                temp.s.push(i);
                delete linkDisplay['link-' + d.source.id + '-' + d.target.id];
            } else {
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
    svg.on('mousemove.nodemove', (event) => {
        event.stopImmediatePropagation();
        var t = {};
        if (CanvasFlag === 'createnew') pos = readCtScale();
        // else if(CanvasFlag==='assign')pos=readCtScaleAssign();
        // else if(CanvasFlag==='endtoend')pos=readCtScaleEnE();
        const cSpan = [pos.x, pos.y];
        const cScale = pos.k;
        const svgOff = document.getElementById('mp__canvas_svg').getBoundingClientRect();
        if (verticalLayout) {
            t.x = parseFloat((event.x - svgOff.left - cSpan[0]) / cScale - 20)
            t.y = parseFloat((event.y - svgOff.top - cSpan[1]) / cScale + 2)
        } else {
            t.x = parseFloat((event.x - svgOff.left - cSpan[0]) / cScale + 2)
            t.y = parseFloat((event.y - svgOff.top - cSpan[1]) / cScale - 20)
        }
        d3.select('.ct-movable').attr('transform', "translate(" + t.x + "," + t.y + ")");
    })
    return { linkDisplay, temp }
}

export const moveNodeEnd = (pi, dNodes, dLinks, linkDisplay, temp, verticalLayout) => {
    const svg = d3.select(`.mp__canvas_svg`);
    svg.on('mousemove.nodemove', null);
    // svg.on('zoom', null);
    var p = d3.select("#node_" + pi);
    var l = p.attr('transform').slice(10, -1).split(',');
    dNodes[pi].x = parseFloat(l[0]);
    dNodes[pi].y = parseFloat(l[1]);
    let f;
    if (dNodes[pi].type === 'teststepgroups') {
        for (let d = 0; d < dNodes.length; d++) {
            if (dNodes[d].name === dNodes[pi].parent.name) {
                f = d
                break
            }
        }
        var link = addLink(dNodes[f], dNodes[pi], verticalLayout);
        var lid = 'link-' + dLinks[temp.t].source.id + '-' + dLinks[temp.t].target.id
        linkDisplay[lid] = link
    } else {
        var links = addLink(dLinks[temp.t].source, dNodes[pi], verticalLayout);
        var lids = 'link-' + dLinks[temp.t].source.id + '-' + dLinks[temp.t].target.id
        linkDisplay[lids] = links
    }
    temp.s.forEach(function (d) {
        // if (deletednode_info.indexOf(dLinks[d].target) == -1) {
        var link = addLink(dNodes[pi], dLinks[d].target, verticalLayout);
        var lid = 'link-' + dLinks[d].source.id + '-' + dLinks[d].target.id
        linkDisplay[lid] = link
        if (temp.hidden.indexOf(d) !== -1) {
            linkDisplay[lid].hidden = true
        }
        //}
    });
    p.classed('ct-movable', !1);
    return { linkDisplay }
}
export const moveNodeBeginForJourney = (idx, linkDisplay, dLinks, temp, pos, verticalLayout, CanvasFlag) => {
    dLinks.forEach(function (d, i) {
        if (d.source.id === parseInt(idx)) {
            if (!linkDisplay['link-' + d.source.id + '-' + d.target.id]) {
                temp.deleted.push(i)
            }
            else if (linkDisplay['link-' + d.source.id + '-' + d.target.id].hidden === true) {
                temp.hidden.push(i)
                temp.s.push(i);
                delete linkDisplay['link-' + d.source.id + '-' + d.target.id];
            } else {
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
    svg.on('mousemove.nodemove', (event) => {
        event.stopImmediatePropagation();
        var t = {};
        if (CanvasFlag === 'createnew') pos = readCtScale();
        // else if(CanvasFlag==='assign')pos=readCtScaleAssign();
        // else if(CanvasFlag==='endtoend')pos=readCtScaleEnE();
        const cSpan = [pos.x, pos.y];
        const cScale = pos.k;
        const svgOff = document.getElementById('mp__canvas_svg').getBoundingClientRect();
        if (verticalLayout) {
            t.x = parseFloat((event.x - svgOff.left - cSpan[0]) / cScale - 20)
            t.y = parseFloat((event.y - svgOff.top - cSpan[1]) / cScale + 2)
        } else {
            t.x = parseFloat((event.x - svgOff.left - cSpan[0]) / cScale + 2)
            t.y = parseFloat((event.y - svgOff.top - cSpan[1]) / cScale - 20)
        }
        d3.select('.ct-movable').attr('transform', "translate(" + t.x + "," + t.y + ")");
    })
    return { linkDisplay, temp }
}

export const moveNodeEndForJourney = (pi, dNodes, dLinks, linkDisplay, temp, verticalLayout) => {
    const svg = d3.select(`.mp__canvas_svg`);
    svg.on('mousemove.nodemove', null);
    // svg.on('zoom', null);
    var p = d3.select("#node_" + pi);
    var l = p.attr('transform').slice(10, -1).split(',');
    dNodes[pi].x = parseFloat(l[0]);
    dNodes[pi].y = parseFloat(l[1]);
    let f;
    let g;
    let h;
    if (dNodes[pi].type === 'teststepsgroups') {
        for (let d = 0; d < dNodes.length; d++) {
            if (dNodes[d].children.length > 0 && dNodes[d].children[0].name === dNodes[pi].name) {
                g = d
                // const newData = {...dNodes[g], children:[{...dNodes[pi].children[0],parent:{...dNodes[pi].children[0].parent.parent, childIndex:dNodes[g].children[0].parent.parent.childIndex},children:[{...dNodes[g].children[0],parent:{...dNodes[pi].parent, childIndex:dNodes[pi].children[0].parent.parent.childIndex},children:[]}]}]}
                // for(let f = 0; f<dNodes[0].children.length;f++){
                //     if(dNodes[0].children[f].id === newData.id){
                //         dNodes[0].children[f] = newData
                //     }  
                // }
                continue;
            }
            else if (dNodes[pi].children.length > 0) {
                if (dNodes[d].name === dNodes[pi].children[0].name) {
                    f = d
                    var link = addLinkNew(dNodes[d], dNodes[pi], verticalLayout);
                    var lid = 'link-' + dNodes[d].id + '-' + dNodes[pi].id
                    linkDisplay[lid] = link
                    // const newData1 = [{...dNodes[f], children:dNodes[0].children[0].children[0].parent.children.filter(child=>child._id !== dNodes[d]._id),childIndex:dNodes[0].children[0].children[0].parent.children.filter(child=>child._id === dNodes[d]._id)[0].childIndex,parent:dNodes[0].children[0].children[0].parent}]
                    // const newData2 = [{...newData1[0],children:[{...newData1[0].children[0], parent:dNodes[0].children[0].children[0].parent}]}]
                    // dNodes[0].children[0].children = newData2
                    continue;
                }
            }
            else if (dNodes[d].name === dNodes[pi].name) {
                h = d;
                link = addLinkNew(dNodes[d].children[0], dNodes[pi], verticalLayout);
                lid = 'link-' + dNodes[d].children[0].id + '-' + dNodes[pi].id
                linkDisplay[lid] = link
                break;
            }
        }
    } else {
        var links = addLink(dLinks[temp.t].source, dNodes[pi], verticalLayout);
        var lids = 'link-' + dLinks[temp.t].source.id + '-' + dLinks[temp.t].target.id
        linkDisplay[lids] = links
    }
    temp.s.forEach(function (d) {
        // if (deletednode_info.indexOf(dLinks[d].target) == -1) {
        var link = addLinkNew_1(dNodes[g], dLinks[d].target, verticalLayout);
        var lid = 'link-' + dLinks[d].source.id + '-' + dLinks[d].target.id
        linkDisplay[lid] = link
        if (temp.hidden.indexOf(d) !== -1) {
            linkDisplay[lid].hidden = true
        }
        //}
    });
    p.classed('ct-movable', !1);
    return { linkDisplay }
};

export const toggleNode = (nid, nodeDisplay, linkDisplay, dNodes, dLinks) => {
    var id = nid.split("node_")[1]
    if (dNodes[id]._children && dNodes[id]._children.length > 0) {
        // p.select('.ct-cRight').classed('ct-nodeBubble', !0);
        dNodes[id].children = dNodes[id]._children;
        dNodes[id]._children = null;
        recurseTogChild(nodeDisplay, linkDisplay, dNodes[id], !1, dLinks);
    } else if (dNodes[id].children && dNodes[id].children.length > 0) {
        // p.select('.ct-cRight').classed('ct-nodeBubble', !1);  //d._childern 
        dNodes[id]._children = dNodes[id].children;
        dNodes[id].children = null;
        recurseTogChild(nodeDisplay, linkDisplay, dNodes[id], !0, dLinks);
    }
    return { dLinks, dNodes, nodeDisplay, linkDisplay }
}
const generateScenarioData = (data, item) => {
    let target = data;
    while (target.children.length > 0) {
        // Traverse to the last child with an empty 'children' array
        target = target.children[target.children.length - 1];
    }
    // Add the newData to the last empty 'children' array
    target.children.push({ ...item, parentID: target.id, parent: { ...item.parent, children: [item] } });

    return data;
}
const updateScenarioData = (dataUpdate, item) => {
    let node = dataUpdate;
    let nodeItem;

    // Use forEach to iterate over the children
    if (node.children) {
        node.children.forEach((child, index) => {
            // Check if the current child's id matches the target ID (item.id)
            if (child.id === item.id) {
                // Update the child's properties with the data from 'item'
                nodeItem = { ...item, parentID: node.children[index].parentID, parent: { ...item.parent, children: [item] } };
            } else {
                // If the child has children, recursively update them
                if (child.children && child.children.length > 0) {
                    // Corrected argument to the recursive call
                    nodeItem = updateScenarioData(child, item);
                }
            }
        });
    }

    return nodeItem;
};
const getChildUpdate = (data, item) => {
    if (!data || !data[0] || !data[0].children) {
        return; // Handle the case when the data structure is not as expected
    }

    const updateChild = (children) => {
        for (let i = 0; i < children.length; i++) {
            const child = children[i];

            if (child.id === item.id) {
                // Update logic goes here
                // For example, you can update child properties
                child.children = [item.children[0]];
                return;
            }

            if (child.children && child.children.length > 0) {
                updateChild(child.children);
            }
        }
    };

    updateChild(data[0].children);
};

export const createNodeForJourneyView = (activeNode, nodeDisplay, linkDisplay, dNodes, dLinks, sections, count, obj, verticalLayout, nodeID) => {
    //if nodeID ene then
    var uNix = dNodes.length
    var pi = activeNode;
    var pt = nodeDisplay[pi].type;
    // if (pt === 'teststepgroups') return;
    if (false && nodeDisplay[pi]._children != null)
        return;// openDialogMindmap('Error', 'Expand the node');
    if (dNodes[pi].children === undefined) dNodes[pi]['children'] = [];
    var nNext = {
        'endtoend': ['Scenario', 1],
        'modules': ['Scenario', 1],
        'scenarios': ['Teststepsgroup', 2],
        'teststepsgroups': ['Teststepsgroup', 4]
    };
    var mapSvg = d3.select('.mp__canvas_svg');
    var w = parseFloat(mapSvg.style('width'));
    var h = parseFloat(mapSvg.style('height'));
    var arr_co = [];
    dNodes.forEach(function (d) {
        if (d.state !== 'deleted') {
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
        tempName = (nNext[pt][0] === 'Scenario' ? 'TestCase' : 'Teststepsgroup') + (nNext[pt][0] === 'Scenario' ? count[(nNext[pt][0]).toLowerCase() + 's'] : count[(nNext[pt][0]).toLowerCase() + 's']);
    }
    var node = {
        id: uNix,
        children: [],
        y: h * (0.15 * (1.34 + nNext[pt][1]) + Math.random() * 0.1),
        x: 90 + 30 * Math.floor(Math.random() * (Math.floor((w - 150) / 80))),
        state: 'created',
        path: '',
        name: nNext[pt][0] === 'Scenario' ? tempName : tempName,
        parent: nNext[pt][0] === 'Scenario' ? dNodes[pi] : {
            id: uNix,
            children: [],
            y: h * (0.15 * (1.34 + nNext[pt][1]) + Math.random() * 0.1),
            x: 90 + 30 * Math.floor(Math.random() * (Math.floor((w - 150) / 80))),
            parent: dNodes[pi],
            state: 'created',
            path: '',
            name: tempName,
            childIndex: '',
            type: 'screens'
        },
        childIndex: '',
        type: (nNext[pt][0]).toLowerCase() + 's'
    };
    if (nodeID) {
        node._id = nodeID
    }
    dNodes.push(node);
    if (Object.isExtensible(dNodes[pi])) {
        if (dNodes[pi].type === 'scenarios') {
            dNodes[pi] = generateScenarioData(dNodes[pi], dNodes[uNix])
            dNodes[uNix] = updateScenarioData(dNodes[pi], dNodes[uNix])
        } else if (dNodes[pi].type === 'teststepsgroups' && dNodes[pi].children.length > 0) {
            // Recursive function to update IDs
            function updateIdsRecursive(node, level) {
                // Update the id of the current node
                node.id = node.id + level;
                if (level === 1) {
                    node.y = node.y + 150
                }
                if (node.children && node.children.length > 0) {
                    // Update IDs in the children array
                    node.children.forEach(child => {
                        updateIdsRecursive(child, 1);
                    });
                }
            }

            const new_obj_data = {
                ...dNodes[pi],
                children: [{
                    ...dNodes[uNix],
                    id: dNodes[pi].children[0].id,
                    x: dNodes[pi].children[0].x,
                    y: dNodes[pi].children[0].y,
                    children: [...dNodes[pi].children],
                    parent: { ...dNodes[uNix].parent, parent: dNodes[pi].parent.parent, children: [{ ...dNodes[uNix], id: dNodes[pi].children[0].id }] }
                }]
            };

            // Update IDs recursively for all descendants
            updateIdsRecursive(new_obj_data.children[0], 0);

            // Assign the updated object back to dNodes[pi]
            dNodes[pi] = new_obj_data;
            const new_obj_data_for_uNix = { ...dNodes[pi].children[0], children: dNodes[pi].children[0].children }
            dNodes[uNix] = new_obj_data_for_uNix
        } else {
            if (dNodes[pi].type === 'teststepsgroups') {
                const newObject = { ...dNodes[pi], children: [...dNodes[pi].children, { ...dNodes[uNix], parent: { ...dNodes[uNix].parent, parent: dNodes[pi].parent.parent, children: [dNodes[uNix]] } }], parent: { ...dNodes[pi].parent, children: [{ ...dNodes[pi].parent.children[0], children: [dNodes[uNix]] }, dNodes[uNix]] } };
                getChildUpdate(dNodes, newObject)
                const new_obj_data_for_uNix = newObject.children[0]
                dNodes[uNix] = new_obj_data_for_uNix
                dNodes[pi] = newObject;
            } else {
                const newObject = { ...dNodes[pi], children: [...dNodes[pi].children, { ...dNodes[uNix], parent: { ...dNodes[uNix].parent, children: [dNodes[uNix]] } }] };
                getChildUpdate(dNodes, newObject)
                dNodes[pi] = newObject;
            }
        }
    }
    else dNodes[pi].children.push(dNodes[uNix]);
    if (dNodes[pi].type === 'scenarios' && dNodes[uNix].childIndex === "") {
        dNodes[uNix].childIndex = dNodes[pi].children[0].parent.children.length > 0 ? dNodes[pi].children[0].parent.children[0].parent.childIndex : 1;
        dNodes[uNix].parent.childIndex = dNodes[pi].children[0].parent.children.length > 0 ? dNodes[pi].children[0].parent.children[0].parent.childIndex + 1 : 1;
    } else if (dNodes[uNix].childIndex === "") {
        dNodes[uNix].childIndex = dNodes[pi].children.length;
    }
    dNodes[uNix].cidxch = 'true'; // child index updated
    getNewPosition(dNodes, dNodes[uNix], pi, arr_co, verticalLayout, sections);
    if (dNodes[pi].type === 'modules') {
        for (let r = 0; r < dNodes[0].children.length; r++) {
            if (dNodes[0].children[r].id === dNodes[uNix].id) {
                dNodes[0].children[r] = dNodes[uNix]
            }
        }
    }
    dNodes[uNix].cidxch = 'true'; // child index updated
    getNewPosition(dNodes, dNodes[uNix], pi, arr_co, verticalLayout, sections);
    var currentNode;
    if (dNodes[pi].type === "scenarios") {
        if (dNodes[pi].children[0] === dNodes[uNix].id) {
            var link = {
                id: uuid(),
                source: dNodes[pi],
                target: dNodes[uNix]
            };
            var lid = 'link-' + link.source.id + '-' + link.target.id
            dLinks.push(link);
            var currentLink = addLinkNew(dNodes[pi], dNodes[uNix], verticalLayout)
            linkDisplay[lid] = currentLink;
            currentNode = addNode(dNodes[uNix]);
            nodeDisplay[uNix] = currentNode;
        } else {
            link = {
                id: uuid(),
                source: dNodes[dNodes[uNix].parentID],
                target: dNodes[uNix]
            };
            lid = 'link-' + link.source.id + '-' + link.target.id
            dLinks.push(link);
            currentLink = addLinkNew(dNodes[dNodes[uNix].parentID], dNodes[uNix], verticalLayout)
            linkDisplay[lid] = currentLink;
            currentNode = addNode(dNodes[uNix]);
            nodeDisplay[uNix] = currentNode;
        }
    } else if (dNodes[pi].type === 'teststepsgroups' && dNodes[pi].children.length > 0) {
        // Assuming dNodes is an array of nodes
        if (dNodes[uNix].children.length > 0) {
            getChildUpdate(dNodes, dNodes[pi])
            createNodesAndLinks(dNodes[pi], dNodes[pi].children[0], verticalLayout, true);
            function createNodesAndLinks(node, parentLinkTarget, verticalLayout, sel) {
                var link = {
                    id: uuid(),
                    source: node,
                    target: parentLinkTarget
                };
                var linkId = 'link-' + link.source.id + '-' + link.target.id;
                dLinks.push(link);
                if (sel) {
                    var currentLink = addLinkNew_1(link.source, link.target, verticalLayout);
                } else {
                    currentLink = addLink(link.source, link.target, verticalLayout);
                }


                var currentNode = addNode_1(parentLinkTarget);
                nodeDisplay[parentLinkTarget.id] = currentNode;
                linkDisplay[linkId] = currentLink;

                if (node.children && node.children[0].children.length > 0) {
                    for (var i = 0; i < node.children.length; i++) {
                        createNodesAndLinks(node.children[i], node.children[i].children[i], verticalLayout, false);
                    }
                }
            }
        } else {
            link = {
                id: uuid(),
                source: dNodes[pi],
                target: dNodes[uNix]
            };
            lid = 'link-' + link.source.id + '-' + link.target.id
            dLinks.push(link);
            currentLink = addLinkNew(dNodes[pi], dNodes[uNix], verticalLayout);
            linkDisplay[lid] = currentLink;
            currentNode = addNode(dNodes[uNix]);
            nodeDisplay[uNix] = currentNode;
        }

    } else {
        link = {
            id: uuid(),
            source: dNodes[pi],
            target: dNodes[uNix]
        };
        lid = 'link-' + link.source.id + '-' + link.target.id
        dLinks.push(link);
        currentLink = addLinkNew(dNodes[pi], dNodes[uNix], verticalLayout);
        linkDisplay[lid] = currentLink;
        currentNode = addNode(dNodes[uNix]);
        nodeDisplay[uNix] = currentNode;
    }
    return { nodeDisplay, linkDisplay, dNodes, dLinks, count }
}

export const deleteNodeForJourneyView = (activeNode, dNodes, dLinks, linkDisplay, nodeDisplay) => {
    var deletedNodes = []
    var sid = parseFloat(activeNode.split('node_')[1])
    var s = d3.select('#' + activeNode);
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
    if (dNodes[sid].type === 'teststepsgroups') {
        if (dNodes[sid].children.length > 0) {
            dNodes[sid].children = []
        }
        if (dNodes[sid].parent.children.length > 1) {
            for (let w = 0; w < dNodes[sid].parent.children.length; w++) {
                if (dNodes[sid].parent.children[w]._id === dNodes[sid]._id) {
                    recurseDelChild(dNodes[sid].parent.children[w], linkDisplay, nodeDisplay, dNodes, dLinks, undefined, deletedNodes);
                } else {
                    recurseDelChild(dNodes[sid].parent.children[w], linkDisplay, nodeDisplay, dNodes, dLinks, undefined, deletedNodes);
                }
            }
        } else {
            recurseDelParent(dNodes[sid].parent, dNodes[sid], linkDisplay, nodeDisplay, dNodes, dLinks, undefined, deletedNodes);
        }
    } else {
        recurseDelChild(dNodes[sid], linkDisplay, nodeDisplay, dNodes, dLinks, undefined, deletedNodes);
    }
    for (var j = dLinks.length - 1; j >= 0; j--) {
        if (dLinks[j].target.id === sid) {
            dLinks[j].deleted = !0;
            delete linkDisplay['link-' + dLinks[j].source.id + '-' + dLinks[j].target.id];
            break;
        }
    }
    if (p.children !== null) {
        p.children.some((d, i) => {
            if (d.id === sid) {
                p.children.splice(i, 1);
                return !0;
            }
            return !1;
        });
    }

    if (dNodes[sid].type === 'scenarios') {
        dNodes[0].children = dNodes[0].children.filter(child => child.name !== dNodes[sid].name);
    } else if (dNodes[sid].type === 'teststepsgroups') {
        function upDataDeletedChild(children) {
            children.forEach(child => {
                if (child.children.length > 0) {
                    if (child.children[0].id === dNodes[sid].id) {
                        if (child.children.length > 0) {
                            child.children = child.children[0].children;
                            if (child.parent.children.length > 1) {
                                child.parent.children = [child]
                            } else {
                                child.parent.children[0].children = child.children
                            }
                        } else {
                            child.children = [];
                            child.parent.children[0].children = [];
                        }
                    }else if(child.children.length>0 && child.children !== null && child.id === dNodes[sid].id){
                        child.children = dNodes[sid].children
                    }
                }
                if (child.children && child.children.length > 0) {
                    upDataDeletedChild(child.children);
                }
            });
            return children;
        }

        // Call the function with the appropriate data
        dNodes[0].children = upDataDeletedChild(dNodes[0].children);
    }
    if (p["_id"] == null && p["state"] == "created" && p["type"] == "endtoend") { deletedNodes = [] }
    return { dNodes, dLinks, linkDisplay, nodeDisplay, deletedNodes }
}

export const ClickSwitchLayout = (verticalLayout, setVerticalLayout, moduleSelect, setBlockui, dispatch) => {
    if (verticalLayout) {
        setBlockui({ show: true, content: 'Switching Layout...' })
        // dispatch({type:actionTypes.SELECT_MODULE,payload:{switchlayout:true}})
        setVerticalLayout(false)
        return;
    }
    if (Object.keys(moduleSelect).length < 1) {
        return;
    }
    setBlockui({ show: true, content: 'Switching Layout...' })
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

export const getApptypePD = (data) => {
    var cdata;
    var file = JSON.parse(data);
    var doc = new DOMParser().parseFromString(file.data, 'text/xml');
    var activityJSON = JSON.parse(xml2json(doc).replace("\nundefined", ""));
    if (activityJSON["mxGraphModel"]["root"]["Task"].length > 1) {
        cdata = JSON.parse(activityJSON["mxGraphModel"]["root"]["Task"][0]["#cdata"]);
    } else {
        cdata = JSON.parse(activityJSON["mxGraphModel"]["root"]["Task"]["#cdata"]);
    }
    return cdata[0]['apptype'].toLowerCase()
}

export const getJsonPd = (orderMatrix) => {
    var dataJSON = [{
        name: 'Module_' + uuid(),
        type: 1
    }];
    orderMatrix.forEach((orderList) => {
        dataJSON.push({
            name: 'Scenario_' + uuid(),
            type: 2
        });
        orderList.forEach((data) => {
            dataJSON.push({
                name: "Screen_" + data.label,
                type: 3
            });
            dataJSON.push({
                name: "Testcase_" + data.label,
                type: 4
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
export function restructureData(data) {
    // Find scenarios types under the "modules" level
    const scenarioIndices = data.children.reduce((indices, item, index) => {
        if (item.type === 'scenarios') {
            indices.push(index);
        }
        return indices;
    }, []);

    // Process each scenarios type
    scenarioIndices.forEach(scenariosIndex => {
        const scenariosChildren = data.children[scenariosIndex].children;
        // Recursively move "parent" data from all nested "teststepsgroups" types
        function moveParentData(teststepsgroup) {
            if (teststepsgroup.type === 'teststepsgroups') {
                const parentData = teststepsgroup.parent.type === 'screens' ? teststepsgroup.parent : teststepsgroup.parent.parent;
                // Clear existing children of the first "scenarios" type
                if (scenariosChildren.length > 0 && scenariosChildren[0].type !== "screens") {
                    scenariosChildren.length = 0;
                }
                if (scenariosChildren.length >= 1 && scenariosChildren[0].type === "screens") {
                    function findChildrenIndicesWithId(parent, childId) {
                        const indices = [];

                        function searchChildren(children, path = []) {
                            children.forEach((child, index) => {
                                const currentPath = path.concat(index);

                                if (child.id === childId) {
                                    indices.push(currentPath);
                                }

                                if (child.children && child.children.length > 0) {
                                    searchChildren(child.children, currentPath.concat('children'));
                                }
                            });
                        }

                        searchChildren(parent.children);
                        return indices;
                    }

                    const parentIdToUpdate = parentData.id;

                    // Find the parent with the specified id
                    const parentToUpdate = scenariosChildren.find(item => item.id === parentIdToUpdate);

                    if (parentToUpdate) {
                        // Iterate over the children array
                        parentData.children.forEach(child => {
                            if (child.state === 'created') {
                                // Find all occurrences of children with the specified id
                                const existingChildrenIndices = findChildrenIndicesWithId(parentToUpdate, child.id);

                                if (existingChildrenIndices.length > 0) {
                                    // Update all occurrences of the child
                                    existingChildrenIndices.forEach(path => {
                                        let currentObject = parentToUpdate;
                                        path.forEach(step => {
                                            if (step === 'children') {
                                                currentObject = currentObject.children;
                                            } else {
                                                currentObject = currentObject[step];
                                            }
                                        });

                                        // Update the child
                                        const data = parentToUpdate.children.some((child1) => child1.name !== child.name)
                                        if (data) {
                                            parentToUpdate.children.push({
                                                ...child,
                                                children: [],
                                                type: 'testcases',
                                            });
                                        }
                                    });
                                } else {
                                    // Add the new child
                                    const data = parentToUpdate.children.some((child1) => child1.name !== child.name)
                                    if (data) {
                                        parentToUpdate.children.push({
                                            ...child,
                                            children: [],
                                            type: 'testcases',
                                        });
                                    }
                                }
                            }
                        });
                    } else {
                        scenariosChildren.push({
                            ...parentData,
                            cidxch: true,
                            projectID: parentData.parent.projectID,
                            childIndex: scenariosChildren.length + 1,
                            children: [...parentData.children.map((child, inx) => ({
                                ...child,
                                cidxch: true,
                                id: parentData.id + 1,
                                projectID: parentData.parent.projectID,
                                childIndex: (child.childIndex === "") ? inx + 1 : child.childIndex,
                                children: [],
                                type: "testcases"
                            }))]
                        });
                    }
                } else if (parentData.childIndex !== "") {
                    scenariosChildren.push({
                        ...parentData,
                        cidxch: true,
                        id: parentData.id,
                        projectID: parentData.parent.projectID,
                        children: [...parentData.children.map((child, inx) => ({
                            ...child,
                            cidxch: true,
                            id: child.id,
                            projectID: parentData.parent.projectID,
                            childIndex: (child.childIndex !== "") ? inx + 1 : child.childIndex,
                            children: [],
                            type: "testcases"
                        }))]
                    });
                } else {
                    scenariosChildren.push({
                        ...parentData,
                        cidxch: true,
                        projectID: parentData.parent.projectID,
                        childIndex: scenariosChildren.length + 1,
                        children: [...parentData.children.map((child, inx) => ({
                            ...child,
                            cidxch: true,
                            id: parentData.id + 1,
                            projectID: parentData.parent.projectID,
                            childIndex: (child.childIndex === "") ? inx + 1 : child.childIndex,
                            children: [],
                            type: "testcases"
                        }))]
                    });
                }
                // Recursively process nested "teststepsgroups"
                teststepsgroup.children.forEach(moveParentData);
            }
        }

        data.children[scenariosIndex].children.forEach(moveParentData);
    });

    return data;
}
export function transformDataFromTreetoJourney(data) {
    let fullData = data
    function updateParentKeyWithScenariosChildren(data) {
        // Create a deep copy of the 'data' object
        const newData = JSON.parse(JSON.stringify(data));

        for (let m = 0; m < newData.children.length; m++) {
            for (let s = 0; s < newData.children[m].children.length; s++) {
                for (let s1 = 0; s1 < newData.children[m].children[s].children.length; s1++) {
                    const newObject = {
                        ...newData.children[m].children[s].children[s1],
                        parent: { ...newData.children[m].children[s], parent: { ...newData.children[m], id: m + 1 }, id: newData.children.length + s + 1 }, type: "teststepsgroups"
                    };

                    // Make changes in the deep copy
                    newData.children[m].children[s].children[s1] = newObject;
                }
            }
        }
        fullData = newData
        return data; // Return the updated object
    }

    function updateData(document) {
        if (document.children) {
            const updatedChildren = [];
            document.children.forEach(child => {
                if (child.type === "screens") {
                    updatedChildren.push(...child.children);
                } else {
                    updatedChildren.push(child);
                }
            });
            document.children = updatedChildren;
        }
        document.children.forEach(child => updateData(child));
        return document;
    }

    function journeyData(fullData, newItem) {
        if (!fullData.children) {
            fullData.children = [];
        }

        function findParent(parentIndex, currentNode) {
            if (parentIndex === 1) {
                return currentNode;
            }
            if (currentNode.children) {
                for (let i = 0; i < currentNode.children.length; i++) {
                    const child = currentNode.children[i];
                    if (child.childIndex === parentIndex) {
                        return child;
                    }
                    const foundInChild = findParent(parentIndex, child);
                    if (foundInChild) {
                        return foundInChild;
                    }
                }
            }
            return null;
        }

        let parent = [];
        for (let i = 0; i < newItem.children.length; i++) {
            const childItem = newItem.children[i];

            if (childItem.parent && childItem.parent.childIndex === 1 && childItem.childIndex === 1) {
                const parentIndex = childItem.parent.childIndex;
                const parentData = findParent(parentIndex, newItem);

                if (parentData) {
                    if (!parentData.children) {
                        parentData.children = [];
                    }
                    parent.push(childItem);
                }
            } else {
                if (parent[0].children.length === 0) {
                    parent[parent.length - 1].children.push(childItem);
                } else {
                    newItem.children[i - 1].children.push(childItem);
                }
            }
        }

        newItem.children = parent;
    }

    updateParentKeyWithScenariosChildren(fullData);
    updateData(fullData);

    fullData.children.forEach((item) => {
        journeyData(fullData, item);
    });

    return fullData;
}
export function transformDataFromTreetoFolder(data) {
    let fullData = data
    function updateParentKeyWithScenariosChildren(data) {
        // Create a deep copy of the 'data' object
        let newObject = {};
        const newData = JSON.parse(JSON.stringify(data));

        for (let m = 0; m < newData?.children?.length; m++) {
            let objectArray = [];
            for (let s = 0; s < newData.children[m].children.length; s++) {
                newObject = {}
                if (newData.children[m].children.length > 0) {
                    for (let s1 = 0; s1 < newData.children[m].children[s].children.length; s1++) {
                        newObject = {
                            ...newData.children[m].children[s].children[s1], id: newData.children[m].children.length + 2,
                            parent: { ...newData.children[m].children[s], id: newData.children.length + 1, parent: newData.children[m], children: [{ ...newData.children[m].children[s].children[s1], id: newData.children[m].children.length + 2, parent: { ...newData.children[m].children[s], id: newData.children.length + 1 } }] }, type: "teststepsgroups"
                        };
                        objectArray.push(newObject)
                    }
                }
            }
            const updateNewObject = {
                ...newData.children[m], id: m + 1, parent: newData, children: objectArray.length > 0 ? objectArray : []
            }

            // Make changes in the deep copy
            newData.children[m] = updateNewObject;
        }
        fullData = newData
        return data; // Return the updated object
    }

    function updateData(document) {
        if (document.children) {
            const updatedChildren = [];
            document.children?.forEach(child => {
                if (child?.type === "screens") {
                    updatedChildren.push(...child?.children);
                } else {
                    updatedChildren.push(child);
                }
            });
            document.children = updatedChildren;
        }
        document?.children?.forEach(child => updateData(child));
        return document;
    }
    updateParentKeyWithScenariosChildren(fullData);
    updateData(fullData);

    return fullData;
}
// to show tree structure data when clicked on suite to show its child case and stepgroup
export function handlingTreeOfTestSuite(key, modifiedData, operationOnCases, operationOnTestSteps, renameTC, recievingRenamingData, selectedTSGInfo) {
    let keyForRenamingTC;
    if (selectedTSGInfo?.data[0]?.layer === 'layer_2') {
        if (renameTC && renameTC?.length) {
            keyForRenamingTC = key;
            key = key.slice(0, 1)
            const keyTCForModifiedData = keyForRenamingTC.slice(2 - 3)
            //    if(valueOfRenamingTC !== null){

            modifiedData.children[keyTCForModifiedData].name = recievingRenamingData;
            // }
        }
    }
    let keyForRenamingTSG;
    if (selectedTSGInfo?.data[0]?.layer === 'layer_3') {
        const renameTSG = renameTC;
        if (renameTSG && renameTSG?.length) {
            keyForRenamingTSG = key;
            key = key.slice(0, 1)
            const keyOfTC = keyForRenamingTSG.slice(2, 3)
            const keyTSGForModifiedData = keyForRenamingTSG.slice(3 - 4)
            modifiedData.children[keyOfTC].children[keyTSGForModifiedData].name = recievingRenamingData;
        }

    }
    const testCases = [];
    const childData = modifiedData.children;
    // testCase loop
    for (let i = 0; i < childData?.length; i++) {
        const childComponent = childData[i];
        const children = [];
        // testStep loop
        for (let j = 0; j < childComponent.children.length; j++) {
            const child = childComponent.children[j];
            const stepChild = [];
            children.push({
                key: `${key}-${i}-${j}`,
                label: [
                    <img src="static/imgs/testStepGroup.png" alt="modules" />,
                    <div style={{
                        width: '10rem',
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                    }} className='teststepName'>{child.name}</div>, <Button onMouseDownCapture={(e) => operationOnTestSteps.current.show(e)} className='buttonForMoreTestSteps' label="..." text />
                ],
                data: [{ layer: "layer_3", testSuitName: modifiedData.name, testSuitId: modifiedData._id, testCaseName: childComponent.name, testStepGroupId: child._id, testStepGroupName: child.name, parentScreenName: child.parent.name, parentScreenId: child.parent._id }],
                // featchData:[child,"2rdloop"],
                // children: stepChild, // Added stepChild here
            });
        }

        testCases.push({
            key: `${key}-${i}`,
            label: [
                <img src="static/imgs/node-scenarios.svg" alt="modules" />,
                <div style={{
                    width: '10rem',
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                }}>{childComponent.name}</div>, <Button onMouseDownCapture={(e) => { operationOnCases.current.show(e) }} className='buttonForMoreTestCases' label="..." text />
            ],
            data: [{ layer: "layer_2", testSuitName: modifiedData.name, testSuitId: modifiedData._id, testCaseName: childComponent.name, testCaseId: childComponent._id }],
            children: children,
        });
    }
    if (selectedTSGInfo?.data[0]?.layer === 'layer_2') {
        if (renameTC && renameTC?.length) {
            const indexToRenameTC = keyForRenamingTC
            const TSIndex = indexToRenameTC.slice(0, 1);
            const TCIndex = indexToRenameTC.slice(2 - 3);
            testCases[TCIndex].label = renameTC

        }
    }
    if (selectedTSGInfo?.data[0]?.layer === 'layer_3') {
        const renameTSG = renameTC
        if (renameTSG && renameTSG?.length) {
            const indexToRenameTSG = keyForRenamingTSG
            const TCIndex = indexToRenameTSG.slice(2, 3);
            const TSGIndex = indexToRenameTSG.slice(3 - 4);
            testCases[TCIndex].children[TSGIndex].label = renameTC

        }
    }

    return (testCases);
}

/*function parseProjList
    use:  parses input value to list of project props
*/

export const parseProjList = (res) => {
    var proj = {};
    res.projectId.forEach((e, i) => {
        proj[res.projectId[i]] = {
            'apptype': res.appType[i],
            'name': res.projectName[i],
            'apptypeName': res.appTypeName[i],
            'id': res.projectId[i],
            'releases': res.releases[i],
            'domains': res.domains[i]
        };
    });
    return proj
}

/* function paste node data
      use: paste input value to the dNodes list
 */

export const pasteNodeData = (activeNode, nodeDisplay, linkDisplay, dNodes, dLinks, sections, count, obj, verticalLayout) => {

    var uNix = dNodes.length
    var pi = activeNode.attr('id').split('node_')[1];;
    var pt = nodeDisplay[pi].type;
    var lt = false;
    if (false && nodeDisplay[pi]._children != null)
        return;// openDialogMindmap('Error', 'Expand the node');
    if (dNodes[pi].children === undefined) dNodes[pi]['children'] = [];
    if (dNodes[pi].type === 'scenarios') {
        if (dNodes[pi]._id === obj[0].parent.parent._id) {
            lt = true
        }
    } else {
        if (dNodes[pi].parent.parent._id === obj[0].parent.parent._id) {
            lt = true
        }
    }
    var nNext = {
        'endtoend': ['Scenario', 1],
        'modules': ['Scenario', 1],
        'scenarios': ['Teststepsgroup', 2],
        'teststepsgroups': ['Teststepsgroup', 4]
    };
    var mapSvg = d3.select('.mp__canvas_svg');
    var w = parseFloat(mapSvg.style('width'));
    var h = parseFloat(mapSvg.style('height'));
    var arr_co = [];
    dNodes.forEach(function (d) {
        if (d.state !== 'deleted') {
            var objj = {
                x: parseInt(d.x),
                y: parseInt(d.y)
            };
            arr_co.push(objj);
        }
    });
    count[(nNext[pt][0]).toLowerCase() + 's'] += 1
    const pasetNode = lt === false ? {
        ...obj[0],
        childIndex: 1,
        children: [],
        id: uNix,
        parent: {
            ...obj[0].parent,
            childIndex: 1,
            children: [{ ...obj[0], children: [] }],
            state: 'created',
            path: '',
            parent: dNodes[pi].type === 'scenarios' ? dNodes[pi] : obj[0].parent.parent,
            reuse: true,
            id: uNix,
            y: h * (0.15 * (1.34 + nNext[pt][1]) + Math.random() * 0.1),
            x: 90 + 30 * Math.floor(Math.random() * (Math.floor((w - 150) / 80))),
            _id: null
        },
        state: 'created',
        path: '',
        reuse: true,
        y: h * (0.15 * (1.34 + nNext[pt][1]) + Math.random() * 0.1),
        x: 90 + 30 * Math.floor(Math.random() * (Math.floor((w - 150) / 80))),
        _id: null
    } : {
        ...obj[0],
        parent: {
            ...obj[0].parent,
            childIndex: dNodes[pi].type === 'scenarios' ? 1 : dNodes[pi].children.length > 0 ? dNodes[pi].children[0].parent.parent.childIndex : dNodes[pi].parent.childIndex
        }
    }
    if (lt === true) {
        for (let p = 0; p < dNodes.length; p++) {
            if (dNodes[p]._id === pasetNode._id) {
                uNix = p
                dNodes[p] = pasetNode

            }
        }
    } else {
        dNodes.push(pasetNode);
    }
    if (Object.isExtensible(dNodes[pi])) {
        if (dNodes[pi].type === 'scenarios') {
            if (dNodes[pi].children.length > 0) {
                // Recursive function to update IDs
                function updateIdsRecursive(node, level) {
                    // Update the id of the current node
                    node.id = node.id + level;
                    if (level === 1) {
                        node.y = node.y + 150
                    }
                    if (lt === true && node.children.length > 0 && node.children[0]._id === obj[0]._id) {
                        node.children = obj[0].children
                    }
                    if (node.children && node.children.length > 0) {
                        // Update IDs in the children array
                        node.children.forEach(child => {
                            updateIdsRecursive(child, 1);
                        });
                    }
                }

                const new_obj_data =
                // lt===true?{
                //     ...dNodes[pi],
                //     children: [{
                //         ...dNodes[uNix],
                //         id: dNodes[pi].children[0].id,
                //         x:dNodes[pi].children[0].x,
                //         y:dNodes[pi].children[0].y,
                //         children: [{...dNodes[pi].children[0],id:dNodes[pi].children[0].id+1}]
                //     }]
                // }:
                {
                    ...dNodes[pi],
                    children: [{
                        ...dNodes[uNix],
                        id: dNodes[pi].children[0].id,
                        x: dNodes[pi].children[0].x,
                        y: dNodes[pi].children[0].y,
                        children: [...dNodes[pi].children]
                    }]
                };

                // Update IDs recursively for all descendants
                updateIdsRecursive(new_obj_data.children[0], 0);

                // Assign the updated object back to dNodes[pi]
                dNodes[pi] = new_obj_data;
                const new_obj_data_for_uNix = { ...dNodes[pi].children[0], children: dNodes[pi].children[0].children }
                dNodes[uNix] = new_obj_data_for_uNix
            } else {
                const pasteData = { ...dNodes[pi], children: [{ ...dNodes[uNix], children: dNodes[pi].children, parent: { ...dNodes[uNix].parent, children: [{ ...dNodes[uNix], children: dNodes[pi].children }] } }] }
                dNodes[uNix] = { ...dNodes[uNix], children: [{ ...dNodes[pi].children[0], parent: { ...dNodes[uNix].parent, children: [{ ...dNodes[uNix], children: dNodes[pi].children }] } }] }
                dNodes[pi] = pasteData
                getChildUpdate(dNodes, pasteData)
            }
        } else if (dNodes[pi].type === 'teststepsgroups' && dNodes[pi].children.length > 0) {
            // Recursive function to update IDs
            function updateIdsRecursive(node, level) {
                // Update the id of the current node
                node.id = node.id + level;
                if (level === 1) {
                    node.y = node.y + 150
                }
                if (lt === true && node.children.length > 0 && node.children[0]._id === obj[0]._id) {
                    node.children = obj[0].children
                }
                if (node.children && node.children.length > 0) {
                    // Update IDs in the children array
                    node.children.forEach(child => {
                        updateIdsRecursive(child, 1);
                    });
                }
            }

            const new_obj_data_1 = {
                ...dNodes[pi],
                children: [{
                    ...dNodes[uNix],
                    id: dNodes[pi].children[0].id,
                    x: dNodes[pi].children[0].x,
                    y: dNodes[pi].children[0].y,
                    children: [...dNodes[pi].children]
                }]
            };

            // Update IDs recursively for all descendants
            updateIdsRecursive(new_obj_data_1.children[0], 0);

            // Assign the updated object back to dNodes[pi]
            dNodes[pi] = new_obj_data_1;
            const new_obj_data_for_uNix_1 = { ...dNodes[pi].children[0], children: dNodes[pi].children[0].children }
            dNodes[uNix] = new_obj_data_for_uNix_1
        }else{
            if(lt === true && dNodes[pi].type === 'teststepsgroups'){
                const newObject = { ...dNodes[pi], children: [...dNodes[pi].children, {...dNodes[uNix],children:[], parent:{...dNodes[uNix].parent, children:[dNodes[uNix]]}}] };
                getChildUpdate(dNodes, newObject)
                dNodes[pi] = newObject;
            }else if(dNodes[pi].type === 'teststepsgroups'){
                const newObject = { ...dNodes[pi], children: [...dNodes[pi].children, {...dNodes[uNix],children:[], parent:{...dNodes[uNix].parent, children:[dNodes[uNix]]}}] };
                getChildUpdate(dNodes, newObject)
                dNodes[pi] = newObject;
            }else{
                const newObject = { ...dNodes[pi], children: [...dNodes[pi].children, {...dNodes[uNix], parent:{...dNodes[uNix].parent, children:[dNodes[uNix]]}}] };
                getChildUpdate(dNodes, newObject)
                dNodes[pi] = newObject;
            }

        }

    }
    dNodes[uNix].cidxch = 'true'; // child index updated
    getNewPosition(dNodes, dNodes[uNix], pi, arr_co, verticalLayout, sections);
    if (dNodes[pi].type === "scenarios") {
        if (dNodes[uNix].children.length > 0) {
            getChildUpdate(dNodes, dNodes[pi])
            createNodesAndLinks(dNodes[pi], dNodes[pi].children[0], verticalLayout, true);
            function createNodesAndLinks(node, parentLinkTarget, verticalLayout, sel) {
                var link = {
                    id: uuid(),
                    source: node,
                    target: parentLinkTarget
                };
                var linkId = 'link-' + link.source.id + '-' + link.target.id;
                dLinks.push(link);
                if (sel) {
                    var currentLink = addLinkNew_1(link.source, link.target, verticalLayout);
                } else {
                    currentLink = addLink(link.source, link.target, verticalLayout);
                }


                var currentNode = addNode_1(parentLinkTarget);
                nodeDisplay[parentLinkTarget.id] = currentNode;
                linkDisplay[linkId] = currentLink;

                if (node.children && node.children[0].children.length > 0) {
                    for (var i = 0; i < node.children.length; i++) {
                        createNodesAndLinks(node.children[i], node.children[i].children[i], verticalLayout, false);
                    }
                }
            }
        } else {
            var link = {
                id: uuid(),
                source: dNodes[pi],
                target: dNodes[uNix]
            };
            var lid = 'link-' + link.source.id + '-' + link.target.id
            dLinks.push(link);
            var currentLink = addLinkNew(dNodes[pi], dNodes[uNix], verticalLayout);
            linkDisplay[lid] = currentLink;
            var currentNode = addNode(dNodes[uNix]);
            nodeDisplay[uNix] = currentNode;
        }
    } else if (dNodes[pi].type === 'teststepsgroups' && dNodes[pi].children.length > 0) {
        // Assuming dNodes is an array of nodes
        if (dNodes[uNix].children.length > 0) {
            getChildUpdate(dNodes, dNodes[pi])
            createNodesAndLinks(dNodes[pi], dNodes[pi].children[0], verticalLayout, true);
            function createNodesAndLinks(node, parentLinkTarget, verticalLayout, sel) {
                var link = {
                    id: uuid(),
                    source: node,
                    target: parentLinkTarget
                };
                var linkId = 'link-' + link.source.id + '-' + link.target.id;
                dLinks.push(link);
                if (sel) {
                    var currentLink = addLinkNew_1(link.source, link.target, verticalLayout);
                } else {
                    currentLink = addLink(link.source, link.target, verticalLayout);
                }


                var currentNode = addNode_1(parentLinkTarget);
                nodeDisplay[parentLinkTarget.id] = currentNode;
                linkDisplay[linkId] = currentLink;

                if (node.children && node.children[0].children.length > 0) {
                    for (var i = 0; i < node.children.length; i++) {
                        createNodesAndLinks(node.children[i], node.children[i].children[i], verticalLayout, false);
                    }
                }
            }
        } else {
            link = {
                id: uuid(),
                source: dNodes[pi],
                target: dNodes[uNix]
            };
            lid = 'link-' + link.source.id + '-' + link.target.id
            dLinks.push(link);
            currentLink = addLinkNew(dNodes[pi], dNodes[uNix], verticalLayout);
            linkDisplay[lid] = currentLink;
            currentNode = addNode(dNodes[uNix]);
            nodeDisplay[uNix] = currentNode;
        }

    } else {
        link = {
            id: uuid(),
            source: dNodes[pi],
            target: dNodes[uNix]
        };
        lid = 'link-' + link.source.id + '-' + link.target.id
        dLinks.push(link);
        currentLink = addLinkNew(dNodes[pi], dNodes[uNix], verticalLayout);
        linkDisplay[lid] = currentLink;
        currentNode = addNode(dNodes[uNix]);
        nodeDisplay[uNix] = currentNode;
    }
    return { nodeDisplay, linkDisplay, dNodes, dLinks, count }
}