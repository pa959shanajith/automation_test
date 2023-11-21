import React, { useEffect, useRef, useState } from "react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import {Dialog} from "primereact/dialog";
import { Accordion, AccordionTab } from 'primereact/accordion';
import { TabMenu } from "primereact/tabmenu";
import { Toast } from "primereact/toast";
import "../styles/NetworkOperation.scss"


const NetworkOperation = (props) => {
    const [expandedRows, setExpandedRows] = useState(null);
    const toast = useRef();
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    
    let items = [
        {label: 'Headers'},
    ];


    const headerTemplate = (
        <>
        <div className="flex flex-column">
            <span className="NetworkData__header1">
                Network Analysis
            </span>
            <span className="NetworkData__header2">
               {props.description}
            </span>
        </div>
        </>
    );



    const getStatusCode = (statusCode) => {
        switch (true) {
            case statusCode >= 200 && statusCode < 300:
                return <div className="status_code__div agent_state__idle"></div>
            case statusCode >= 300 && statusCode < 400:
                return <div className="status_code__div agent_state__in-progress"></div>
            case statusCode >= 400 && statusCode < 500:
                return <div className="status_code__div agent_state__busy"></div>
            case statusCode >= 500 && statusCode < 600:
                return <div className="status_code__div agent_state__offline"></div>
            default:
                return <div className="status_code__div agent_state__inactive"></div>
        }
    };
    
    const statusCode = (rowData) =>{
     return <span>
      {getStatusCode(rowData["Status Code"])}<span className="code__text">{rowData["Status Code"]}</span>
    </span>;
    }

    const networkDataName =(rowData)=>{
        return <span title={rowData.Name}>
            {rowData.Name?rowData.Name:rowData["Request URL"]}
        </span>
    }    

    
    const rowExpansionTemplate = (data) => {
         function isJson(item) {  
            try {
                const value = typeof item === "string" ? JSON.parse(item) : item;
                return typeof value === "object" && value !== null;
            } catch (e) {
              return false;
            }
          }
        
        const parsedObject = isJson(data["Response Content"])?JSON.stringify(data["Response Content"], null, 2) : data["Response Content"] ;

        if(parsedObject && Object.keys(parsedObject).length){
            items.push({ label: 'Response' });
        }

        return (
            <div className="p-3">
            <TabMenu model={items} activeIndex={activeTabIndex} onTabChange={(e) => setActiveTabIndex(e.index)} />
            {activeTabIndex===0?<Accordion activeIndex={0}>
                <AccordionTab header="General">
                    <div className="grid">
                        <div className="col-3 accordion__txt">
                        Request URL:
                        </div>
                        <div className="col-9 accordion__txt">
                         {data["Request URL"]}
                        </div>
                        {data["Request Method"] && (
                          <>
                            <div className="col-3 accordion__txt">
                            Request Method:
                            </div>
                            <div className="col-9 accordion__txt">
                            {data["Request Method"]}
                            </div>
                          </> 
                          )
                        }
                        <div className="col-3 accordion__txt">
                        Status Code:
                        </div>
                        <div className="col-9 accordion__txt">
                        {getStatusCode(data["Status Code"])}
                        <div className="code__text">{data["Status Code"]}</div>
                        </div>
                        {data.Duration && (
                            <>
                        <div className="col-3 accordion__txt">
                        Time:
                        </div>
                        <div className="col-9 accordion__txt">
                        {data.Duration} ms
                        </div>
                        </>)}
                    </div>

                </AccordionTab>
                {data["Response Headers"] &&
                <AccordionTab header="Response Headers">
                <div className="grid">
                    {Object.entries(data["Response Headers"]).map(([key,value])=>(
                        <>
                        <div className="col-2 accordion__txt">
                        {key}:
                        </div>
                        <div className="col-10 accordion__txt">
                         {value}
                        </div>
                        </>))}
                    </div>
                </AccordionTab>
                }{data["Request Headers"] &&
                <AccordionTab header="Request Headers">
                    <div className="grid">
                        {Object.entries(data["Request Headers"]).map(([key,value])=>(
                            <>
                            <div className="col-2 accordion__txt">
                            {key}:
                            </div>
                            <div className="col-10 accordion__txt">
                             {value}
                            </div>
                            </>
                        ))}
                    </div>
                </AccordionTab>}
                </Accordion> :
                <card className="response__txt">
                    <pre>{parsedObject}</pre>
                </card>
                }
            </div>
        );
    };

   
return(
    <>
    <Dialog className="Network_Dialog" header={headerTemplate} visible={props.visible} onHide={props.onHide}>
    <div className="card">
            <Toast ref={toast} />
            <DataTable className="networkData__table" size="small" scrollable scrollHeight="530px" value={props.networkData.map((el, ind) => ({ ...el, slno: ind+1}))} showGridlines expandedRows={expandedRows} onRowToggle={(e) => setExpandedRows(e.data)}
                 rowExpansionTemplate={rowExpansionTemplate}
                    dataKey="slno">
                <Column expander style={{ width: '0.5rem' }}/>
                <Column field="slno" header="Sl.No" style={{ width: '2rem' }}/>
                <Column field="Name" header="Name" bodyClassName={"ellipsis-column"} body={networkDataName}/>
                <Column field="Status Code" header="Status Code" body={statusCode} style={{ width: '8rem' }} />
                {/* <Column body={expandTemplate} style={{ height: 'auto' }} /> */}
            </DataTable>
        </div>
    </Dialog>
    </>
)

}
export default NetworkOperation;