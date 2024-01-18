

import React, { useState, useEffect, useRef } from 'react';
import '../styles/Ai_Output_styles.scss';
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputTextarea } from "primereact/inputtextarea";
import genarateIcon from '../../../../src/assets/imgs/genarate.svg';
import { ProgressSpinner } from 'primereact/progressspinner'; 
import axios from 'axios';
import { generate_testcase, getJSON_userstory, save_testcase } from '../../admin/api';
import { Dropdown } from 'primereact/dropdown';
import { useDispatch, useSelector } from 'react-redux';

export default function Output() {
  const selectedscreen = useSelector(state => state.setting.screenType);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [isJiraComponentVisible, setJiraComponentVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
  const [showGenarateIcon, setShowGenarateIcon] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toast = useRef(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [apiDataReceived, setApiDataReceived] = useState(false);
  const [userstoryLevel, setuserstoryLevel] = useState(true);
  const [selectedTestCases, setSelectedTestCases] = useState([]);
  const [userTestcase, setUserTestcase] = useState(null)
  const [buttonDisabled, setButtonDisabled] = useState(false);
   const [userlevel, setUserlevel] = useState(false);
  const [summaries, setSummaries] = useState([]);
  const [adoSummary, SetAdoSummary] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const dispatchAction = useDispatch();
  const [type, setType] = useState('');
  const [query, setQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const items = [
    { label: 'Jira', value: 'Jira' },
    { label: 'ADO (Azure DevOps)', value: 'ADO' },
  ];
  const ToastMessage = ({ message }) => (
    <Toast severity="success" life={3000}>
      {message}
    </Toast>
  );
  const moduleTestCase = (event) => {
    event.preventDefault();
    //console.log("----Module level  test case---")
    setShowSearchBox(true);
    setuserstoryLevel(true);
    setApiResponse(" ");
    setShowGenarateIcon(false)
    setButtonDisabled(true);
  }
  const toggleSearchBox = async (event) => {
    try {
      setType("module");
      event.preventDefault();
      setIsLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const username = userInfo.username;
      const email = userInfo.email_id;
      const instancename = "Avo Assure";
      const localStorageDefaultProject = JSON.parse(localStorage.getItem('DefaultProject'));
      const projectName = localStorageDefaultProject.projectName;

      const generateType = {
        typename: 'module',
        summary: query
      };

      const formData2 = {
        "name": username,
        "email": email,
        "projectname": projectName,
        "organization": instancename,
        "type": generateType
      };
      setApiResponse(" ");
      const response = await generate_testcase(formData2)
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Module level test cases generated successfully',
        life: 3000
      });
      setApiResponse(response.data.response);
      setButtonDisabled(false);
      setApiDataReceived(true);
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Message Content',
        life: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };
  const systemTestCase = async (event) => {
    try {
      setType("system");
      setButtonDisabled(true);
      event.preventDefault();
      setuserstoryLevel(true);
      setIsLoading(true);
      setShowSearchBox(false);
      setShowGenarateIcon(false);
      setApiResponse(" ");
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const username = userInfo.username;
      const email = userInfo.email_id;
      const instancename = "Avo Assure";
      const localStorageDefaultProject = JSON.parse(localStorage.getItem('DefaultProject'));
      const projectName = localStorageDefaultProject.projectName;
      const type = {
        "typename": "system",
        "summary": ""
      };
      const formData1 = {
        "name": username,
        "email": email,
        "projectname": projectName,
        "organization": instancename,
        "type": type
      };
      const response = await generate_testcase(formData1)
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'system level testcases genarate sucessfully', life: 3000 });
      setApiResponse(response.data.response);
      setButtonDisabled(false);
      setApiDataReceived(true);
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
    } finally {
      setIsLoading(false);
    }
  };
  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };
  const userStoryTestCase = async () => {
    try {
      setJiraComponentVisible(!isJiraComponentVisible);
      setShowGenarateIcon(true);
      setShowSearchBox(false);
      setApiResponse(null);
      setIsLoading(false);
      setApiDataReceived(false);
      setuserstoryLevel(false);
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const username = userInfo.username;
      const email = userInfo.email_id;
      const organization = "Avo Assure";
      const formData = {
        "name": username,
        "email": email,
        "organization": organization
      };
      const response = await getJSON_userstory(formData);
      if (response.data) {
        let testcases = [];
        if (Array.isArray(response.data)) {
          testcases = response.data;
        } else if (typeof response.data === 'object' && response.data !== null) {
          testcases = Object.keys(response.data).map(key => response.data[key]);
        }
        setSummaries(testcases);
      } else {
        console.error('Invalid API response format:', response.data);
      }
       //toast.current.show({ severity: 'success', summary: 'Success', detail: ' user story level testcases generate successfully', life: 3000 });
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
    }
  };
  useEffect(() => {
    setSelectedOption(selectedscreen.name);
  }, [selectedscreen]);
  const handleGenerateTestCase = async (e) => {
    setJiraComponentVisible(!isJiraComponentVisible);
    setShowGenarateIcon(true);
    setShowSearchBox(false);
    setApiResponse(" ");
    setIsLoading(false);
    setApiDataReceived(false);
    setuserstoryLevel(false);
    setSelectedItem(e.value);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const username = userInfo.username;
      const email = userInfo.email_id;
      const organization = "Avo Assure";

      const formData = {
        "name": username,
        "email": email,
        "organization": organization
      };
      if (e.value === 'Jira') {
        const jiraApiResponse = await axios.post('https://localhost:8443/getJSON_userstory', formData);
        if (jiraApiResponse.data && jiraApiResponse.data.success) {
          let testcases = [];
          if (Array.isArray(jiraApiResponse.data.data)) {
            testcases = jiraApiResponse.data.data;
          } else if (typeof jiraApiResponse.data.data === 'object' && jiraApiResponse.data.data !== null) {
            testcases = Object.keys(jiraApiResponse.data.data).map(key => jiraApiResponse.data.data[key]);
          }
          setSummaries(testcases);
        } else {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
        }
      }
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
    }
  };
  const testCaseGenaration = async () => {
    try {
      setType("userstories");
      const selectedSummaries = summaries
        .filter(testCase => selectedTestCases.includes(testCase.id))
        .map(selectedTestCase => selectedTestCase.summary)
        .join('.');
      setUserTestcase('');
      setButtonDisabled(true);
      setIsLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const username = userInfo.username;
      const email = userInfo.email_id;
      const localStorageDefaultProject = JSON.parse(localStorage.getItem('DefaultProject'));
      const projectName = localStorageDefaultProject.projectName;
      const instancename = "Avo Assure";
      const generateType = {
        typename: 'userstories',
        summary: selectedSummaries
      };
      const formData3 = {
        "name": username,
        "email": email,
        "projectname": projectName,
        "organization": instancename,
        "type": generateType
      };
      const response = await generate_testcase(formData3)
      toast.current.show({ severity: 'success', summary: 'Success', detail: ' user story level testcases genarate sucessfully', life: 3000 });
      setUserTestcase(response.data.response);
      setButtonDisabled(false);
      setUserlevel(true);
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
    } finally {
      setIsLoading(false);
    }
  };
  const handleCheckboxChange = (id, summary) => {
    if (selectedTestCases.includes(id)) {
      setSelectedTestCases(selectedTestCases.filter((testCaseId) => testCaseId !== id));
    } else {
      setSelectedTestCases([...selectedTestCases, id]);
    }
  };
  const saveTestcases = async () => {
    try {
      const data = (type === "userstories") ? summaries : apiResponse;
      const formData = {
        "name": "nandini.gorla",
        "email": "gorla.nandini@avoautomation.com",
        "organization": "Avo Assure",
        "projectname": "test2",
        "testcase": data,
        "type": type
      };
      const response = await save_testcase(formData);
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'generated testcases saved successfully', life: 3000 });
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
    }
  };

  return (<>
    <div className='Review_testcase'>
      <div className='Recommended_button mt-2'>
        <Button className="btn button1 btn_cls" label="Generate system level test case" onClick={systemTestCase} disabled={buttonDisabled} outlined />
        <Button className="btn button2 btn_cls" label="Generate module level test case" onClick={moduleTestCase} disabled={buttonDisabled} outlined />
        <Button className="btn button3 btn_cls" label="Generate user story level test case" onClick={userStoryTestCase} disabled={buttonDisabled} outlined />
      </div>
      {showSearchBox ? (
        <div className='input_text'>
          <InputText style={{ width: '45rem' }} placeholder='enter module' value={query} onChange={handleInputChange} />
          <Button style={{ width: '12rem' }} label="Generate" onClick={toggleSearchBox} />
        </div>
      ) : null}
      {showGenarateIcon ? (
        <div className="card-group p-3 " style={{ border: '1px solid #ccc', margin: '5px', display: 'flex', flexDirection: 'row' }}>
          <div className="card card-data bg-light" >
            <div className="card-body text-center">
              <div className='summary-container'>
                {summaries.map(testCase => (
                  <div key={testCase.id} className="checkbox-container">
                    <label className="tooltip">
                      <input
                        type="checkbox"
                        checked={selectedTestCases.includes(testCase.id)}
                        onChange={() => handleCheckboxChange(testCase.id, testCase.summary)}
                      />
                      <span className="content">
                        <span> {testCase.id} - {testCase.summary}</span>
                        <span className="summary"> {testCase.summary}</span>
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="ml-2 p-2" style={{ position: 'relative', top: '125px' }} >
            <button disabled={buttonDisabled}>
              <img src={genarateIcon} alt="Input" className="icon-genarate mr-3  text-dark" onClick={testCaseGenaration} />
            </button>
          </div>
          {isLoading && <div className="spinner" style={{ position: 'absolute', top: '29rem', left: '32rem' }}>
            <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
          </div>}
          <div className="card card-data bg-light ml-2 p-2" >
            <div className="card-body text-center">
              {userlevel ? (<>
                <div style={{ textAlign: 'left', padding: '5px' }}>
                  <pre> {userTestcase}</pre>
                </div>
              </>) :
                (<>
                  <div style={{ marginTop: '11rem' }}>what ever selected .genarate those user stories</div>
                </>)}
            </div>
          </div>
        </div>
      ) : null
      }
      {userstoryLevel ? (
        apiResponse ? (
          <div className="card flex justify-content-center" style={{ height: '300px', overflowY: 'auto' }}>
            {isLoading && <div className="spinner" style={{ position: 'absolute', top: '26rem', left: '32rem' }}>
              <ProgressSpinner style={{ width: '40px', height: '40px' }} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
            </div>}
            <InputTextarea id="testcase" autoResize value={apiResponse} onChange={(e) => setApiResponse(e.target.value)} rows={20} cols={1000} />
          </div>
        ) :
          (
            <div className=" card d-flex flex-column bd-highlight  mt-2 default_cls" >
              <div className="default_inner_cls">
                {isLoading && <div className="spinner" style={{ position: 'absolute', top: '15rem', left: '20rem' }}>
                  <ProgressSpinner style={{ width: '40px', height: '40px' }} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
                </div>}
                <div className="p-2 bd-highlight top-50 start-50m hypen_cls" >
                  <Button className="btn button1" label="Generate system level test case" onClick={systemTestCase} disabled={buttonDisabled} outlined />
                </div>
                <div className="p-2 bd-highlight py-2 mt-1 hypen_cls" >
                  <Button className="btn button2" label="Generate module level test case" onClick={moduleTestCase} disabled={buttonDisabled} outlined />
                </div>
                <div className=" p-2 bd-highlight py-2 mt-1 hypen_cls" >
                  <Button className="btn button3" label="Generate user story level test case" disabled={buttonDisabled} outlined />
                </div>
                <span style={{ font: '600 1rem/1.5rem Open Sans' }}>Choose one among the three ways listed above</span>
              </div>

            </div>
          )
      ) : null
      }
      <div>
        <Button className="save_cls" style={{ width: '6rem', marginLeft: '55rem' }} label="Save" disabled={buttonDisabled} onClick={saveTestcases} />
      </div>
      <Toast ref={toast} position="bottom-center" style={{ zIndex: 999999 }} />

      {toastMessage && (
        <div className="p-grid p-justify-center">
          <div className="p-col-10">
            <ToastMessage message={toastMessage} />
          </div>
        </div>
      )}
    </div>
  </>)
}