import React, {useEffect, useRef, useState} from 'react'; 
import { TabView, TabPanel } from 'primereact/tabview';
import { Chart } from 'primereact/chart';
import { Column } from 'primereact/column';
import { TreeTable } from 'primereact/treetable';
import { Button } from 'primereact/button';
import { useLocation } from 'react-router-dom';
import { viewReport} from '../api';
import { InputText } from 'primereact/inputtext';
import "../styles/ReportTestTable.scss"
import { OverlayPanel } from 'primereact/overlaypanel';
import { Checkbox } from 'primereact/checkbox';
import CollapsibleCard from './CollapsibleCard';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { FooterTwo } from '../../global';

export default function BasicDemo() {
    const location = useLocation();
    const [reportData,setReportData] = useState([]);
    const [reportViewData, setReportViewData] = useState([]);
    const [expandedKeys, setExpandedKeys] = useState(null);
    const [searchTest, setSearchTest] = useState('');
    const [reportSummaryCollaps, setReportSummaryCollaps] = useState(true);
    const filterRef = useRef(null);
    const filterValues = [
        { name: 'Pass', key: 'P' },
        { name: 'Fail', key: 'F' },
        { name: 'Terminated', key: 'T' }
    ];
    const [selectedFilter, setSelectedFilter] = useState([]);
    
    useEffect(()=>{
        (async()=>{
            const view = await viewReport(location?.state?.id);
            setReportData(JSON.parse(view))
        })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[location])
    useEffect(() => {
        const parent = [];
        if (reportData && Array.isArray(reportData.rows)) {
            for (const obj of reportData.rows) {
                if (obj.hasOwnProperty('Step') && obj?.Step !== "Terminated") {
                    if (!parent[parent.length - 1]?.children) {
                        parent[parent.length - 1].children = [obj];  // Push the new object into parent array
                    } else {
                        parent[parent.length - 1]?.children.push(obj); // Push the object into existing children array
                    }
                } else {
                    parent.push(obj); // Push the object into parent array
                }
            }
        } else {
            // Handle the case when reportData or reportData.rows is not as expected.
            console.error('reportData.rows is not defined or not an array.');
        }
        setReportViewData(parent);
    },[reportData])

    const handdleExpend = (e) => {
      setExpandedKeys(e.value);
    };

    const onFilterChange = (e) => {
        let _selectedFilters = [...selectedFilter];
        
        if (e.checked)
        _selectedFilters.push(e.value);
        else {
            _selectedFilters = _selectedFilters.filter(category => category.key !== e.value.key);
        }
        setSelectedFilter(_selectedFilters);
        setSearchTest(_selectedFilters[0]?.name ? _selectedFilters[0].name : "");
    };

    const getTableHeader = (
      <div className="grid">
        <div className="col-12 lg:col-4 xl:col-4 md:col-4 sm:col-12">
            <img src="static/imgs/chrome_icon.svg" alt='chrome icon' />
            <img src="static/imgs/edge_icon.svg" alt='edge icon' />
            <img src="static/imgs/safari_icon.svg" alt='safari icon' />
        </div>
        <div className="col-12 lg:col-4 xl:col-4 md:col-4 sm:col-12 flex justify-content-center align-items-center">
          <div className="p-input-icon-left">
            <i className="pi pi-search"></i>
            <InputText
              type="search"
              className='search_testCase'
              onInput={(e) => setSearchTest(e.target.value)}
              placeholder="Search for Test Cases"
            />
          </div>
        </div>
        <div className="col-12 lg:col-4 xl:col-4 md:col-4 sm:col-12 flex justify-content-end">
            <Button type="button" icon="pi pi-filter" label="Add Filter" outlined onClick={(e) => {filterRef.current.toggle(e)}} />
        </div>
      </div>
    );
    const defectIDForJiraAndAzure = (rowData) => {
        const hasChildren = rowData?.children && rowData?.children?.length > 0;
        return hasChildren ? null :  <img src='static/imgs/bug.svg' alt='bug defect'/>;
    }
    const convertDataToTree = (data) => {
        const treeDataArray = [];
        for (let i = 0; i < data.length; i++) {
          const rootNode = {
            key:data[i].id,
            data: { StepDescription: data[i].StepDescription, slno: data[i].slno, key:data[i].id },
            children: [],
          };
          data[i].children?.forEach((child) => {
            rootNode.children.push({
              data: child,
            });
          });
          treeDataArray.push(rootNode); // Add the rootNode to the array
        }
        return treeDataArray; // Return the array of treeData
      };
      
    const treeData = convertDataToTree(reportViewData)
    
    // const [expandedRows, setExpandedRows] = useState([]);

    // const allowExpansion = (rowData) => {
    //     return rowData.children.length > 0;
    // };
    // const rowExpansionTemplate = (data) => {
    //     return (
    //             <DataTable value={data.children}>
    //                 <Column style={{width:'2rem'}}/>
    //                 <Column field="slno" header='S No.'></Column>
    //                 <Column field="Step" header='Steps' ></Column>
    //                 <Column field='Keyword'  header='Description'/>
    //                 <Column field="EllapsedTime"  header='Time Elapsed' ></Column>
    //                 <Column field="status"  header='Status' ></Column>
    //                 <Column field='comments'  header='Comments' />
    //                 <Column field='jira_defect_id'  header='Jira' />
    //                 <Column field='azure_defect_id' header='Azure'  />
    //                 <Column field='action'  header='Action' />
    //             </DataTable>
    //     );
    // };

    return (
        <div className="reportsTable_container">
            <div className="reportSummary">
                <Accordion tabIndex={0} onTabOpen={()=>setReportSummaryCollaps(false)} onTabClose={()=>setReportSummaryCollaps(true)}>
                    <AccordionTab className='content' header="Result Summary">
                        <CollapsibleCard collapsible={false} width="100%" className={"card"}  type ="Execution" summaryValues={reportData?.overallstatus}/> 
                    </AccordionTab>
                </Accordion>
            </div>
            <br></br>
            {/* <DataTable value={reportViewData} expandedRows={expandedRows}  onRowToggle={(e) => setExpandedRows(e.data)}
                rowExpansionTemplate={rowExpansionTemplate}
                dataKey="id" tableStyle={{ minWidth: '60rem' }}>
                <Column expander={allowExpansion} style={{ width: '2rem' }} />
                <Column field="slno" header="S No."/>
                <Column field='Step' header='Steps'/>
                <Column field='StepDescription' header="Description" />
                <Column field="EllapsedTime" header="Time Elapsed"/>
                <Column field="Status" header="Status"/>
                <Column field='comments' header='Comments'/>
                <Column  header="Jira Defect ID"/>
                <Column  header="Azure Defect ID"/>
                <Column header='Action'/>
            </DataTable> */}
            <TreeTable globalFilter={searchTest} header={getTableHeader} value={treeData} className={reportSummaryCollaps?'viewTable':'ViewTable'} expandedKeys={expandedKeys} dataKey='id' onToggle={(e) => handdleExpend(e)} tableStyle={{ minWidth: '50rem' }} >
                <Column field="slno" header="S No." style={{width:'8rem'}} expander/>
                <Column field='Step' header='Steps' style={{width:'10rem'}}/>
                <Column field='StepDescription' header="Description" style={{width:'15rem'}} />
                <Column field="EllapsedTime" header="Time Elapsed"/>
                <Column field="status" header="Status"/>
                <Column field='Comments' header='Comments'/>
                <Column header="No. Defect ID" body={defectIDForJiraAndAzure}/>
                <Column header='Action'/>
            </TreeTable>
            <OverlayPanel ref={filterRef} className="reports_download">
          {filterValues.map((category) => {
            return (
              <div key={category.key} className="flex align-items-center">
                <Checkbox
                  inputId={category.key}
                  name="category"
                  value={category}
                  onChange={onFilterChange}
                  checked={selectedFilter.some(
                    (item) => item?.key === category?.key
                  )}
                />
                <label htmlFor={category.key} className="ml-2">
                  {category.name}
                </label>
              </div>
            );
          })}
        </OverlayPanel>
        <div><FooterTwo/></div>
        </div>
    )
}