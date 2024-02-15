import React, { useState, useRef, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { fetch_git_exp_details } from '../../design/api';
import { importGitMindmap } from '../api';
import { Button } from 'primereact/button';
import { Toast } from "primereact/toast";
import { Dropdown } from 'primereact/dropdown';
import { Tooltip } from 'primereact/tooltip';
import { useDispatch, useSelector } from 'react-redux';
import { getModules, getScreens, updateTestSuiteInUseBy } from '../api';
import { screenData, moduleList, selectedModuleReducer, selectedProj, isCreateProjectVisible } from '../designSlice'
import CreateProject from '../../landing/components/CreateProject';
import { ResetSession, Messages as MSG } from '../../global';
const moment = require('moment');

const GitVersionHistory = (props) => {
  const [data, setData] = useState([]);
  const [sourceProjectId, setSourceProjectId] = useState('');
  const dispatch = useDispatch();
  const toast = useRef(null);
  const initProj = useSelector(state => state.design.selectedProj);
  const [dataLoading, setDataLoading] = useState(true);
  const [restorebtnDisable, setRestorebtnDisable] = useState(true);





useEffect(() => {
  const fetchData = async () => {
    try {
      const jsonData = await fetch_git_exp_details(props.projectId);
      const mappedData = jsonData.map((item, index) => ({
        "key": index,
        "sno": index + 1,
        "version": item.version,
        "datetime": item.modifiedon,
        "comments": item.commitmessage,
        "status": item.gittask,
        "selectedProject": {},
      }));
      setData(mappedData);
      setDataLoading(false);
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error Message',
        detail: ' Please select a Project which has no test suite.',
      });
      setDataLoading(false);
    }
  };
  fetchData();
}, [props.projectId]);

const panelFooterTemplate = () => {
  return (
    <div className="py-2 px-3">
      <Button label="create a project" icon="pi pi-plus" size="small" onClick={openCreateProjectModal} />
    </div>
  );
};
const openCreateProjectModal = () => {
  dispatch(isCreateProjectVisible(true));
}

const displayError = (error) => {
  toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 2000 })
}

const handleRestore = (rowdata) => {
  (async () => {
    try {
      var reqForNewModule = {
        "tab": "tabCreate", "projectid": rowdata.selectedProject.id, "moduleid": null, "query": "modLength"
      }
      var firstModld = await getModules(reqForNewModule)
      if (firstModld.length > 0) {
        toast.current.show({
          severity: 'error',
          summary: 'Error Message',
          detail: 'Please select a Project which has no test suite.',
        });
      }
      else {
        setRestorebtnDisable(true);
        let rowSelectedProject = props.allProjectlist.find(projectdetails => {
          if (projectdetails.projectId === rowdata.selectedProject.id) {
            return projectdetails
          }
        })
        ResetSession.start();
        let data = await importGitMindmap({
          "appType": rowSelectedProject.appType,
          "expProj": sourceProjectId,
          "gitVersion": rowdata.version,
          "projectId": rowdata.selectedProject.id,
          "projectName": rowdata.selectedProject.name
        });
        if (data.error) {
          // toast.current.show({ severity: 'error', summary: 'Error', detail: data.error, life: 3000 });
          if (data.error === "No entries") {
            displayError(data.error); ResetSession.end();
            return;
          }
          else {
            displayError(data.error.CONTENT);
          }
          ResetSession.end();
          return;
        }
        else if (data === "InProgress") { toast.current.show({ severity: 'warn', summary: 'Warning', detail: MSG.MINDMAP.WARN_IMPORT_INPROGRESS.CONTENT, life: 2000 });  ResetSession.end(); setRestorebtnDisable(false); return; }
        else if (data === "dupMod") { toast.current.show({ severity: 'error', summary: 'Error', detail: MSG.MINDMAP.ERR_DUPLI_ZIP_MOD_DATA.CONTENT, life: 2000 });  ResetSession.end(); setRestorebtnDisable(false); return; }
        else if (data === "dupSce") { toast.current.show({ severity: 'error', summary: 'Error', detail: MSG.MINDMAP.ERR_DUPLI_ZIP_SCE_DATA.CONTENT, life: 2000 });  ResetSession.end(); setRestorebtnDisable(false); return; }
        else if (data === "appType") { toast.current.show({ severity: 'error', summary: 'Error', detail: MSG.MINDMAP.ERR_DIFF_APP_TYPE.CONTENT, life: 2000 });  ResetSession.end(); setRestorebtnDisable(false); return; }

        var req = {
          "tab": "tabCreate",
          "projectid": rowdata.selectedProject.id,
          "moduleid": null,
          "query": "modLength"
        };
        var res = await getModules(req);
        var Screen = await getScreens(rowdata.selectedProject.id);

        if (Screen.error) {
          displayError(Screen.error);
          ResetSession.end();
          return;
        }
        if (res.error) {
          displayError(res.error.CONTENT);
          ResetSession.end();
          return;
        }
        toast.current.show({ severity: 'success', summary: 'Success', detail: ' Testsuites Restored sucessfully  ', life: 3000 });
        setRestorebtnDisable(false);
        // setBlockui({ show: false });
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  })()
};

const handleProjectSelect = (proj, rowData) => {
  let rowdatacopy = { ...rowData }
  rowdatacopy.selectedProject = proj;
  let newRowData = [];
  setSourceProjectId(initProj);
  for (let i = 0; i < data.length; i++) {
    if (data[i].key === rowData.key) {
      newRowData.push(rowdatacopy);
    } else {
      newRowData.push(data[i]);
    }
  }
  (async () => {
    try {
      var reqForNewModule = {
        "tab": "tabCreate", "projectid": proj.id, "moduleid": null, "query": "modLength"
      }
      var firstModld = await getModules(reqForNewModule)
      if (firstModld.length > 0) {
        toast.current.show({
          severity: 'error',
          summary: 'Error Message',
          detail: 'Please select a Project which has no test suite.',
        });
      }
      else {
        setRestorebtnDisable(false);
        setData(newRowData);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  })()

}

const customItemTemplate = (option) => {
  const icon = <img src="static/imgs/NoTestsuite.svg" alt="NoTestsuite" />;
  return (<>
    <div className={`git-config-custom-dropdown-item`}>
      {icon}
      <Tooltip target={`.project-name${option.name}`} content={option.name} position='bottom-center' />
      <span className={`project-name${option.name}`}>{option.name}</span>
    </div>
  </>

  );
};

const bodyTemplate = (rowData) => {
  return (
    <React.Fragment>
      <div className='desination_cls'>
        <Dropdown
          filter
          data-test="projectSelect"
          className='projectSelect'
          value={rowData.selectedProject}
          options={props.projectListDropdown}
          onChange={(e) => handleProjectSelect(e.value, rowData)}
          placeholder="Select a Project"
          panelFooterTemplate={panelFooterTemplate}
          itemTemplate={customItemTemplate}
          optionLabel="name"
        />
        <Button
          data-test="git-restore"
          label="Restore"
          title="restore"
          onClick={() => handleRestore(rowData)}
          className='restore_cls'
          disabled={restorebtnDisable}
        />
      </div>
    </React.Fragment>)
  }
  return (
    <div className="import_cls">
      <DataTable value={data}
        loading={dataLoading}
        size={"Normal"}
        emptyMessage={"No results found"}
        showGridlines
        scrollable
        scrollHeight="53vh"
        // virtualScrollerOptions={{ itemSize: 46 }}  
      >
        <Column field="sno" header='Sl.NO.'  />
        <Column field="version" header='Version' />
        <Column field="datetime" header='Date & Time'  />
        <Column field="comments" header='Comments' />
        <Column field="status" header='Status' />
        <Column field="SelectDestination" header='SelectDestination' body={bodyTemplate} />
      </DataTable>
      <Toast ref={toast} position="bottom-center" baseZIndex={1000} />
    </div>
  );
};

export default GitVersionHistory;
