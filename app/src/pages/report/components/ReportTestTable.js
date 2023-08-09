import React, {useEffect, useRef, useState} from 'react'; 
import { Column } from 'primereact/column';
import { TreeTable } from 'primereact/treetable';
import { Button } from 'primereact/button';
import { getDetails_JIRA, viewReport} from '../api';
import { InputText } from 'primereact/inputtext';
import "../styles/ReportTestTable.scss"
import { OverlayPanel } from 'primereact/overlaypanel';
import { Checkbox } from 'primereact/checkbox';
import CollapsibleCard from './CollapsibleCard';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { FooterTwo } from '../../global';
import { getStepIcon } from "../containers/ReportUtils";
import AvoModal from '../../../globalComponents/AvoModal';

export default function BasicDemo() {
    const [reportData,setReportData] = useState([]);
    const [reportViewData, setReportViewData] = useState([]);
    const [expandedKeys, setExpandedKeys] = useState(null);
    const [searchTest, setSearchTest] = useState('');
    const [visibleBug, setVisibleBug] = useState(false);
    const [reportSummaryCollaps, setReportSummaryCollaps] = useState(true);
    const filterRef = useRef(null);
    const [reportid, setReportId] = useState(null)
    const filterValues = [
        { name: 'Pass', key: 'P' },
        { name: 'Fail', key: 'F' },
        { name: 'Terminated', key: 'T' }
    ];
    const [selectedFilter, setSelectedFilter] = useState([]);
    useEffect(() => {
      const getQueryParam = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get("reportID");
        return id;
      };
      const id = getQueryParam();
      setReportId(id);
    }, []);

    useEffect(()=>{
        (async()=>{
            const view = await viewReport(reportid);
            setReportData(JSON.parse(view))
        })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[reportid])
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

    const onBugBtnClick = (getBtn) => {
      if(getBtn==="Cancel") setVisibleBug(false);
      else if(getBtn==="Connect") {

      }
    }

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

  const handleBug = (getRowData) => {
    setVisibleBug(true);
    (async () => {
      const resp = await getDetails_JIRA();
      console.log(resp);
    })();
  };

    const getTableHeader = (
      <div className="grid">
        <div className="col-12 lg:col-4 xl:col-4 md:col-4 sm:col-12 flex align-items-center">
            <img src="static/imgs/chrome_icon.svg" alt='chrome icon' style={{width:'25px',height:'25px', margin: '0.5rem'}} />
            <img src="static/imgs/edge_icon.svg" alt='edge icon' style={{width:'25px',height:'25px', margin: '0.5rem'}}/>
            <img src="static/imgs/safari_icon.svg" alt='safari icon' style={{width:'25px',height:'25px', margin: '0.5rem'}}/>
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
        return hasChildren ? null :  <img src='static/imgs/bug.svg' alt='bug defect' onClick={() => handleBug(rowData)}/>;
    }
    const convertDataToTree = (data) => {
      const treeDataArray = [];
      for (let i = 0; i < data.length; i++) {
        const rootNode = {
          key: data[i].id,
          data: { StepDescription: data[i].StepDescription, slno: data[i].slno, key: data[i].id },
          children: [],
        };
        data[i].children?.forEach((child) => {
          const modifiedChild = { ...child }; // Create a new object with the same properties as child
          if (modifiedChild?.EllapsedTime) {
            modifiedChild.EllapsedTime = modifiedChild.EllapsedTime.split(":").slice(0, 3).join(":");
          }
          if(modifiedChild?.Keyword){
            const stepIcon = getStepIcon(modifiedChild.Keyword);
            const stepDesc = modifiedChild.StepDescription;
            if (stepDesc) {
              modifiedChild.StepDescription = (
                <div key={modifiedChild.key} style={{ display: 'flex' }}>
                  <img src={stepIcon} alt='' style={{ width: '25px',position: 'sticky',height: '25px',top: '0rem'}} />
                  <p>{stepDesc}</p>
                </div>
              );
            }
          }
          const statusIcon = modifiedChild.status === 'Pass' ?'static/imgs/pass.png':modifiedChild.status === 'Fail'?'static/imgs/fail.png':'static/imgs/treminated.png';
          const statusDesc = modifiedChild.status;
          modifiedChild.status = (
            <div key={modifiedChild.key} style={{ display: 'flex' }}>
                  <img src={statusIcon} alt='' style={{width: '12px',height: '12px',position: 'relative',top: '0.3rem'}} />
                  <p>{statusDesc}</p>
                </div>
          );
          rootNode.children.push({
            data: modifiedChild, // Push the new object with modified properties
          });
        });
        treeDataArray.push(rootNode); // Add the rootNode to the array
      }
      return treeDataArray; // Return the array of treeData
    };    
      
    const treeData = convertDataToTree(reportViewData)

    return (
      <div className="reportsTable_container">
        <div className="reportSummary">
          <Accordion
            activeIndex={0}
            tabIndex={0}
            onTabOpen={() => setReportSummaryCollaps(false)}
            onTabClose={() => setReportSummaryCollaps(true)}
          >
            <AccordionTab className="content" header="Result Summary">
              <CollapsibleCard
                collapsible={false}
                width="100%"
                className={"card"}
                type="Execution"
                summaryValues={reportData?.overallstatus}
              />
            </AccordionTab>
          </Accordion>
        </div>
        <br></br>
        <TreeTable
          globalFilter={searchTest}
          header={getTableHeader}
          value={treeData}
          className={reportSummaryCollaps ? "viewTable" : "ViewTable"}
          expandedKeys={expandedKeys}
          dataKey="id"
          onToggle={(e) => handdleExpend(e)}
          tableStyle={{ minWidth: "50rem" }}
        >
          <Column
            field="slno"
            header="S No."
            style={{ width: "8rem", padding: "0rem" }}
            align="center"
            expander
          />
          <Column
            field="Step"
            header="Steps"
            style={{ width: "8rem", padding: "0rem" }}
          />
          <Column
            field="StepDescription"
            header="Description"
            style={{ width: "18rem", padding: "0rem" }}
          />
          <Column
            field="EllapsedTime"
            header="Time Elapsed"
            style={{ width: "10rem", padding: "0rem" }}
          />
          <Column
            field="status"
            header="Status"
            style={{ width: "8rem", padding: "0rem" }}
          />
          <Column
            field="Comments"
            header="Comments"
            style={{ width: "18rem", padding: "0rem" }}
          />
          <Column
            header="No. Defect ID"
            body={defectIDForJiraAndAzure}
            style={{ padding: "0rem" }}
          />
          <Column header="Action" style={{ padding: "0rem" }} />
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
        <div>
          <FooterTwo />
        </div>
        <AvoModal
          visible={visibleBug}
          setVisible={setVisibleBug}
          onModalBtnClick={onBugBtnClick}
          content={
            <div className='flex flex-column'>
              <div className='jira_user'>Username</div>
              <InputText className="jira_credentials" />
              <div className='jira_user'>Password/API Key</div>

              <InputText className="jira_credentials" />
              <div className='jira_user'>URL</div>
              <InputText className="jira_credentials" />
            </div>
          }
          customClass="jira_modal"
          headerTxt="JIRA Login"
          modalSytle={{
            width: "40vw",
            height: "50vh",
            background: "#FFFFFF",
          }}
          footerType="Connect"
        />
      </div>
    );
}