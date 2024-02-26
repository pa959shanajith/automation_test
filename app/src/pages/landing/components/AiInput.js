
import React, { useState, useEffect, useRef } from 'react';
import { FileUpload } from "primereact/fileupload"
import axios from "axios";
import { Badge } from 'primereact/badge';
import UplodedFiles from './UplodedFiles';
import JiraTestcase from './JiraTestcase';
import { useDispatch, useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { uploadgeneratefile, getall_uploadfiles } from '../../admin/api';
import { IntergrationLogin, AzureLogin, screenType } from './../../settings/settingSlice';
import { Checkbox } from "primereact/checkbox";

const ToastMessage = ({ message }) => (
   <Toast severity="success" life={3000}>
      {message}
   </Toast>
);
export default function Input({ items, callback, isReset }) {
   const [tools, setTools] = useState([
      { name: 'Jira', icon: 'static/imgs/jira_icon.svg' },
      { name: 'Azure DevOps', icon: 'static/imgs/azure_devops_icon.svg' },
      // { name: 'Zephyr', icon: 'static/imgs/zephyr_icon.svg' },
      // { name: 'qTest', icon: 'static/imgs/qTest_icon.svg' },
      // { name: 'ALM', icon: 'static/imgs/ALM_icon.svg' },
   ]);
   const [uploadFilesData, setUploadFilesData] = useState('');
   const [selectedFile, setSelectedFile] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [responseMsg, setResponseMsg] = useState("");
   const [isJiraComponentVisible, setJiraComponentVisible] = useState(false)
   const [fileDetails, setFileDetails] = useState([]);
   const [badgeValue, setBadgeValue] = useState(0);
   const [toastMessage, setToastMessage] = useState('');
   const [fileCB, setFileCB] = useState(false);
   const [toolCB, setToolCB] = useState(false);
   const toast = useRef(null);
   const dispatchAction = useDispatch();
   //const selectedscreen = useSelector(state => state.setting.screenType);
   useEffect(() => {
      callback(fileDetails);
   }, [fileDetails]);

   useEffect(() => {
      if (isReset) setFileDetails([])
   }, [isReset]);

   useEffect(() => {
      const fetchData = async (email) => {
         try {
            const uploadFilesData = await axios.get('/getall_uploadfiles', {
               params: {
                  email: email,
               },
            })
            if (uploadFilesData) {
               setFileDetails(uploadFilesData.data);
               setBadgeValue(Object.keys(uploadFilesData.data.data).length);
            }
         } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
         }
      };
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const email = userInfo.email_id;
      fetchData(email);

   }, []);

   const handleJiraIconClick = (value) => {
      dispatchAction(screenType(value));
      setJiraComponentVisible(!isJiraComponentVisible);
   };


   const myUploader = async (event) => {
      setIsLoading(true);
      const files = event.files[0];
      setSelectedFile(files);
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const name = userInfo.username;
      const email = userInfo.email_id;
      const querystrg = {
         email: email,

      };
      const organization = "Avo Assure";
      const localStorageDefaultProject = JSON.parse(localStorage.getItem('DefaultProject'));
      const projectName = localStorageDefaultProject.projectName;
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('file', files);
      formData.append('projectname', projectName);
      formData.append('organization', organization);
      formData.append('type', "maindocument");
      try {
         const data = await uploadgeneratefile(formData);
         setIsLoading(false);
         toast.current.show({ severity: 'success', summary: 'Success', detail: 'Uploaded sucessfully', life: 3000 });
         if (data === 'fail') {
                     toast.current.show({ severity: 'error', summary: 'Error', detail: 'errorMessage', life: 3000 });
         } else {
            try {
               const uploadFilesData = await axios.get('/getall_uploadfiles', {
                  params: {
                     email: email,
                  },
               })
               setFileDetails(uploadFilesData.data);
               toast.current.show({ severity: 'success', summary: 'Success', detail: 'get uploaded file', life: 3000 });
               setBadgeValue(Object.keys(uploadFilesData.data.data).length);
            } catch (uploadFilesError) {
               toast.current.show({ severity: 'error', summary: 'Error', detail: 'errorMessage', life: 3000 });
            }
         }

      } catch (error) {
         setIsLoading(false)
         toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
         //setMsg(Messages.GENERIC.UNAVAILABLE_LOCAL_SERVER);
      }
   };

   return (<>
      <div className="container-fluid">

         <div className="row flex flex-row">
            <div class="col-8 ">
               <div className="form-check mb-3">
                  <Checkbox checked={fileCB} className="form-check-input" id="defaultCheck1" onClick={(e) => setFileCB(e?.checked)}></Checkbox>
                  <label className="form-check-label text-muted pl-2 " htmlFor="defaultCheck1">
                     Upload any files relavent to the application being tested
                  </label>
               </div>
               <div className="card" style={{ 'margin-top': '0px' }}>
                  <FileUpload name="pdf file" multiple accept="application/pdf"
                     maxFileSize={10000000} customUpload={true}
                     uploadHandler={myUploader} disabled={!fileCB} className='ai_file_upload'
                  />
               </div>
               {isLoading && <div className="spinner" style={{ position: 'absolute', top: '250px', left: '215px' }}>
                  <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
               </div>}
            </div>
            <div class="col-4 ">
               <div className="form-check mb-3">
                  <Checkbox checked={toolCB} className="form-check-input" id="defaultCheck2" onClick={(e)=>setToolCB(e?.checked)}></Checkbox>
                  <label className="form-check-label pl-2" htmlFor="defaultCheck2">
                     Choose a tool for user story extraction
                  </label>
               </div>
               <div className="tools-container">
                  <div class="ai_jira_icon_wrapper selected" onClick={() => handleJiraIconClick({ name: 'Jira', code: 'JA' })} style={!toolCB ? { pointerEvents: "none", opacity: "0.6" } : { cursor: "pointer" }} >
                     <div style={{ display: "flex",  alignItems: "center", gap: "10px", margin: "auto" }}>
                        <img src="static/imgs/jira_icon.svg" className="img__jira" />
                        <p className="text__jira">Jira</p>
                     </div>
                  </div>
                  {/* <div class="ai_jira_icon_wrapper " onClick={() => handleJiraIconClick({ name: 'Azure DevOps', code: 'ADO' })} >
                        <span>
                           <img src="static/imgs/azure_devops_icon.svg" className="img__azure mx-3" />
                        </span>
                        <span className="text__azure">Azure DevOps</span>
                     </div> */}
                  {/*  <div class="ai_jira_icon_wrapper ">
                        <span>
                           <img src="static/imgs/zephyr_icon.svg" class="img__zephyr" />
                        </span>
                        <span class="text__zephyr">Zephyr</span>
                     </div>
                     <div class="ai_jira_icon_wrapper ">
                        <span>
                           <img src="static/imgs/qTest_icon.svg" class="img__qtest" />
                        </span>
                        <span class="text__qtest">qTest</span>
                     </div>
                     <div class="icon-wrapper ">
                        <span>
                           <img src="static/imgs/ALM_icon.svg" class="img__alm" />
                        </span>
                        <span class="text__alm">ALM</span>
                     </div> */}
               </div>
            </div>
            {/* </div> */}
         </div>
         <div className="row">
            <div className="Uploded_files">
               {/* <div className="files-heading mb-0 ">
                  Already Uploaded files
                  <Badge value={badgeValue} size="large" className="ml-2 px-2 bg-secondary"></Badge>
               </div> */}
               <UplodedFiles userData={fileDetails} />
            </div>
         </div>
         <Toast ref={toast} position="bottom-center" style={{ zIndex: 999999 }} />
         {toastMessage && (
            <div className="p-grid p-justify-center">
               <div className="p-col-10">
                  <ToastMessage message={toastMessage} />
               </div>
            </div>
         )}
         {isJiraComponentVisible && <JiraTestcase />}
      </div>
   </>
   )

}
