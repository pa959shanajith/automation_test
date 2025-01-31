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
            let temp = 0;
            for (let item in queueList) {
                //To handle empty execution List id key
                if(queueList && queueList[item] && queueList[item] && queueList[item][0] && queueList[item][0][0]){
                    let nodeItem = {
                        key: temp++,
                        value: item,
                        label: queueList[item][0][0].configurename,
                        // label: item+'   :   '+queueList[item][0][0].configurename,
                        showCheckbox: false
                    }
                    let nodeItemChildren = [];
                    let nodeItemChildrenIndex = 1;
                    let nodechildtemp=0;
                    for (let executionNode of queueList[item]) {
                        let executionItem = {
                            key:`0-${nodechildtemp++}`,
                            value: item+nodeItemChildrenIndex,
                            label: <div className="devOps_terminate_icon">Execution {nodeItemChildrenIndex}   
                            <span style={{display: 'flex', alignItems: 'center',  marginLeft: "6rem",    marginTop: "-1.2rem"}}>
                            <img src={"static/imgs/cicd_terminate.png" } title="Terminate Execution" alt="Terminate icon" className='Terminate_Execution'  onClick={async () => {
                                    const deleteExecutionFromQueue = await deleteExecutionListId({configurekey: item, executionListId: executionNode[0].executionListId});
                                    if(deleteExecutionFromQueue.status !== 'pass') {
                                        setMsg(MSG.CUSTOM("Error While Removing Execution from Execution Queue",VARIANT.ERROR));
                                    }else {
                                        getCurrentQueueState();
                                    }
                                }}/>
                                </span>
                         </div>,
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
                    // console.log(queueList.indexOf(queueList[item]))\
                    console.log(queueList)
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
              <h4 className='Manage_execution_Queue'>Manage Execution Queue</h4>
              {console.log('executionQueue.list', executionQueue.list)}
              {executionQueue && (
                (executionQueue.list.length > 0) ? (
                    <div className='treeitems'>
                    <Tree 
                    value={executionQueue.list}
                    selectionMode="multiple"
                    style={{ height: '22.66rem', overflowY: 'auto',fontFamily:"Open Sans"  }}
                    
                />
                </div>
                ) : (
                  <p style={{fontFamily:"open Sans",marginLeft:"1.1rem"}}>You have nothing pending to execute. Try to Execute any Configure Key and come here.</p>
                )
              )}
            </>
          );
    
}
export default ExecutionPage;