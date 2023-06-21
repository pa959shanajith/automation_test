import React,{useState,useEffect} from 'react';
import {  setMsg, Messages as MSG, VARIANT } from "../../global";
import {getQueueState,deleteExecutionListId} from '../api';
// import CheckboxTree from 'react-checkbox-tree';
import { Tree } from 'primereact/tree';
import "../styles/ExecutionPage.scss";



const ExecutionPage = () => {
    const [executionQueue, setExecutionQueue] = useState(false);

    const getCurrentQueueState = async () => {
        // setLoading('Please Wait...');
        const queueList = await getQueueState();
        if(queueList.error) {
            if(queueList.error.CONTENT) {
                setMsg(MSG.CUSTOM(queueList.error.CONTENT,VARIANT.ERROR));
            } else {
                setMsg(MSG.CUSTOM("Error While Fetching Execution Queue List",VARIANT.ERROR));
            }
        }else {
            let nodesCollection = [];
            for (let item in queueList) {
                //To handle empty execution List id key
                if(queueList && queueList[item] && queueList[item] && queueList[item][0] && queueList[item][0][0]){
                    let nodeItem = {
                        value: item,
                        label: queueList[item][0][0].configurename,
                        // label: item+'   :   '+queueList[item][0][0].configurename,
                        showCheckbox: false
                    }
                    let nodeItemChildren = [];
                    let nodeItemChildrenIndex = 1;
                    for (let executionNode of queueList[item]) {
                        let executionItem = {
                            value: item+nodeItemChildrenIndex,
                            label: <div className="devOps_terminate_icon">Execution {nodeItemChildrenIndex}   <img src={"static/imgs/cicd_terminate.png"} title="Terminate Execution" alt="Terminate icon" className='Terminate_Execution' onClick={async () => {
                                    const deleteExecutionFromQueue = await deleteExecutionListId({configurekey: item, executionListId: executionNode[0].executionListId});
                                    if(deleteExecutionFromQueue.status !== 'pass') {
                                        setMsg(MSG.CUSTOM("Error While Removing Execution from Execution Queue",VARIANT.ERROR));
                                    }else {
                                        getCurrentQueueState();
                                    }
                                }}/></div>,
                            showCheckbox: false,
                            // className: 'devOps_terminate_style',
                            children: executionNode.map((executionRequest) => ({
                                label: 'Module : '+executionRequest.modulename+',   Status: '+executionRequest.status,
                                value: executionRequest.executionListId+executionRequest.moduleid,
                                showCheckbox: false
                            }))
                        };
                        nodeItemChildrenIndex++;
                        nodeItemChildren.push(executionItem);
                    }
                    nodeItem['children'] = nodeItemChildren;
                    nodesCollection.push(nodeItem);
                }
            }
            setExecutionQueue({
                list: nodesCollection,
                expanded: []
            });
        }
        // setLoading(false);
    }
    useEffect(() => {
        getCurrentQueueState(); 
      }, []);
      
    return(
     
            <>
              <h4>Manage Execution Queue</h4>
              {console.log('executionQueue.list', executionQueue.list)}
              {executionQueue && (
                (executionQueue.list.length > 0) ? (
                    
                //   <CheckboxTree
                //     showNodeIcon={false}
                //     className='devOps_checkbox_tree'
                //     nodes={tryVar}
                //     expanded={executionQueue.expanded}
                //     onExpand={(expanded) => setExecutionQueue({...executionQueue, expanded: expanded})}
                //   />
                <Tree 
                    value={executionQueue.list}
                    selectionMode="multiple"
                    style={{ height: '22.66rem', overflowY: 'auto' }}
                />
                ) : (
                  <p>You have nothing pending to execute. Try to Execute any Configure Key and come here.</p>
                )
              )}
            </>
          );
    
}
export default ExecutionPage;