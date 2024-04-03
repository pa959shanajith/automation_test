import React, { useState, useEffect, useRef} from 'react';
import "../styles/GenAi.scss";
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Fieldset } from 'primereact/fieldset';
import { Dropdown } from 'primereact/dropdown';
import RightPanelGenAi from "./RightPanelGenAi";
import MiddleContainerGenAi from "./MiddleContainerGenAi";
import { uploadgeneratefile, getall_uploadfiles,readTemp,deleteUplaodFile} from '../../admin/api';
import { useDispatch } from 'react-redux';
import { screenType,setGenAiParameters,setTemplateInfo,updateTemplateId } from './../../settings/settingSlice';
import { useSelector } from 'react-redux';
import JiraTestcase from './JiraTestcase';
import { ProgressSpinner } from 'primereact/progressspinner';
import AvoConfirmDialog from '../../../globalComponents/AvoConfirmDialog';
import { Divider } from "primereact/divider";

const GenAi = () => {
    const toast = useRef(null);
    const fileUploadRef = useRef(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState("");
    const [fileDetails, setFileDetails] = useState([]);
    const [badgeValue, setBadgeValue] = useState(0);
    const dispatchAction = useDispatch();
    const [isJiraComponentVisible, setJiraComponentVisible] = useState(false)
    const [sortedData, setSortedData] = useState([]);
    const [readTempData, setReadTempData] = useState([]);
    const [selectedTemp,setSelectedTemp] = useState(null);
    const template_info = useSelector((state) => state.setting.template_info);
    console.log(template_info)
    const [tempExtras, setTempExtras] = useState({});
    const [isUploadSuccess, setUploadSuccess] = useState(false);
    const [fileUploading, setFileUploading] = useState(false);
    const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
    const [currentId,setCurrentId] = useState('');
    const [deleteRow, setDeleteRow] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [fileFilter, setFileFilter] = useState([]);





    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
    const template_id = useSelector((state) => state.setting.template_id);
    const email = userInfo.email_id;
    if (!userInfo) userInfo = userInfoFromRedux;
    else userInfo = userInfo;
    // const [requirementTool, setRequirementTool] = useState({})
    const onUpload = () => {
    console.log("etnering")
        toast.current.show({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
    };
    const toastError = (erroMessage) => {
        if (erroMessage.CONTENT) {
          toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'error', summary: 'Error', detail: erroMessage, life: 5000 });
      }

      const toastSuccess = (successMessage) => {
        if (successMessage.CONTENT) {
          toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'success', summary: 'Success', detail: successMessage, life: 5000 });
      }

    const header = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="left_table_header font-medium">Recently uploaded files</span>
            {/* <span className="left_table_view">View All</span> */}
        </div>
    );
    const actionTemplate = (rowData) => {
        return <div><span  onClick={()=>{setDeleteRow(true);setCurrentId(rowData?._id)}} className="pi pi-trash"></span></div>
    }

    const handleDelete = async (currId) => {
        try {
            const result = await deleteUplaodFile(currId);

            if (result.error) {
                // Handle the error, e.g., show an error message
                console.error(result.error);
            } else {
                toastSuccess('File deleted successfully');
                const result = await getall_uploadfiles({email});
                if (result.data) {
                setFileDetails(result.data);
                console.log(result);
                } else {
                console.error(result.error);
                }
            }
        } catch (error) {
            // Handle any unexpected errors
            toastError('Unexpected error');
        }
    };

    const handleJiraIconClick = (value) => {
        dispatchAction(screenType(value));
        setSortedData(value);
        setJiraComponentVisible(!isJiraComponentVisible);
    };


    useEffect(() => {
        const fetchData = async (email) => {
            try {
                const uploadFilesData = await getall_uploadfiles({ email: email });
                // axios.get('/getall_uploadfiles', {
                //    params: {
                //       email: email,
                //    },
                // })
                if (uploadFilesData && uploadFilesData.data && uploadFilesData.data.length > 0) {
                    const sorted = uploadFilesData.data.slice().sort((a, b) => new Date(b.uploadedTime) - new Date(a.uploadedTime));
                    setFileFilter(sorted);
                    setFileDetails(uploadFilesData?.data);
                    setBadgeValue(Object.keys(uploadFilesData?.data).length);
                }
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
            }
        };
        fetchData(email);

    }, []);

    const templateDataforTable = async () => {
        try {
            const readData = await readTemp({
                "userid": userInfo.user_id,

            });
            const data = readData.data.data || [];
            const mapData = data.map((temp) => ({
                name:temp.name,
                value:temp._id
            }))
            setReadTempData(mapData);
            dispatchAction(setTemplateInfo(data));
            

        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
        }
    };

    useEffect(() => {
        templateDataforTable();
    }, []);

    const modalOptions = readTempData.map(item => ({
        name: item.name,
        value: item._id
    }));

    const onModelChange = (e) => {
        setReadTempData(e.value);
    }

    const submitPayload = (template_id) => {
        dispatchAction(updateTemplateId(template_id));
    }

    const templateHandler = (e)=>{
        setSelectedTemp(e.value);
        const result= template_info.filter(item => item._id == e.value)
        dispatchAction(setGenAiParameters(result[0]));

    }


    const myUploader = async (event) => {
        setFileUploading(true)
        setIsLoading(true);
        const files = event.files[0];
        const uploadedFile = event.files && event.files.length ? event.files[0] : null;
        setUploadedFile(uploadedFile);
        setSelectedFile(files);
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const name = userInfo.username;
        const email = userInfo.email_id;
        const querystrg = {
            email: email

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
            setFileUploading(false)
            setIsLoading(false);
            setUploadSuccess(true);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Uploaded sucessfully', life: 3000 });
            if (data === 'fail') {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'errorMessage', life: 3000 });
            } else {
                try {
                    refreshFileUpload()
                    const uploadFilesData = await getall_uploadfiles(querystrg);
                    // const filteredData = uploadFilesData?.data?.filter((data) => data.project == reduxDefaultselectedProject?.projectName)
                    setFileDetails(uploadFilesData?.data);
                    // axios.get('/getall_uploadfiles', {
                    //    params: {
                    //       email: email,
                    //    },
                    // })
                    // toast.current.show({ severity: 'success', summary: 'Success', detail: 'get uploaded file', life: 3000 });
                    setBadgeValue(Object.keys(uploadFilesData.data).length);
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
    

    const extractFilename = (path) => {
        const parts = path.split(/[\\/]/);
        return parts[parts.length - 1];
    };

    const requirementTool = [
        { name: 'Jira', code: 'JA' },
    ];

    const refreshFileUpload = () => {
        setUploadedFile(null); // Clear uploaded file state
        if (fileUploadRef.current) {
            fileUploadRef.current.clear(); // Clear the input element
        }
    };
    let defaultselectedProject = reduxDefaultselectedProject;
    const localStorageDefaultProject = localStorage.getItem('DefaultProject');
    if (localStorageDefaultProject) {
        defaultselectedProject = JSON.parse(localStorageDefaultProject);
    }
    const filteredData = fileFilter.filter((rowData) => rowData.project === defaultselectedProject.projectName);
  

    return (
  
    <div className="genai_container flex" >
        
        {isJiraComponentVisible && <JiraTestcase/>}
        <div className="genai_left_container p-2">
        <Toast ref={toast}></Toast>
            <div className="context_container flex align-items-center border-bottom-1 pb-2 mb-1">
                <div className="w-1 context_logo_container flex justify-content-center align-items-center mr-2">
                    <img className="context_logo w-full" src="static\imgs\context setting.svg" />
                </div>
                <div className="context_heading">Context Setting</div>
            </div>
            <div className="context_doc my-2 font-medium">Document</div>
            <div className="doc_container flex flex-row border-round my-2">
                <FileUpload
                    className='genai_fileupload'
                    ref={fileUploadRef}
                    disabled={fileUploading}
                    mode="basic"
                    url="/uploadgeneratefile"
                    customUpload={true}
                    // name="demo[]"
                    // multiple={false}
                    accept="application/pdf"
                    uploadHandler={myUploader}
                    // onBeforeUpload={handleBeforeUpload}
                    multiple
                    maxFileSize={20000000000}
                    emptyTemplate={
                        <div className="doc_btm flex justify-content-center align-items-center">
                            <span className="doc_btm_para">
                                File type:pdf | File size:1,00,000 words | No. of files:1
                            </span>
                        </div>
                    }
                />
                {fileUploading && <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="8" fill="var(--surface-ground)"/>}
            </div>
            <div className="datatable_files">
            <AvoConfirmDialog
                        visible={deleteRow}
                        onHide={() => setDeleteRow(false)}
                        showHeader={false}
                        message="Are you sure you want to delete ?"
                        icon="pi pi-exclamation-triangle"
                        accept={() => handleDelete(currentId)}
                    />
                <DataTable value={filteredData} header={header} tableStyle={{}}>
                    <Column field="path" header="File Name" body={(rowData) => extractFilename(rowData.path)} bodyClassName={"file_name"}/>
                    <Column field="actions" header="Actions" body={actionTemplate} style={{width:"1.5rem"}}/>
                </DataTable>
            </div>
            <div className="flex flex-row justify-content-center align-items-center mt-4 leftandor ">
                <Divider style={{width:"120px"}}/>
                <strong>AND / OR</strong>
                <Divider style={{width:"120px"}}/>
            </div>
            <div className='mt-5'>
            <div className="left_btm_container pb-1">
                <div className="left_btm_header my-1 font-medium">Requirement Management Tool</div>
                <Dropdown
                    value={sortedData} 
                    onChange={(e) => handleJiraIconClick(e.value)}
                    options={requirementTool} optionLabel="name"
                    placeholder={<span className="left_btm_placeholder">Select a Tool</span>} className="w-full jira_dropdown" />
                {/* <Dropdown
                    // value={sortedData} 
                    // onChange={(e) => handleJiraIconClick(e.value)}
                    // options={requirementTool} optionLabel="name"
                    placeholder={<span className="left_btm_placeholder">Jira Project</span>} className="w-full" />
                <Dropdown
                    // value={sortedData} 
                    // onChange={(e) => handleJiraIconClick(e.value)}
                    // options={requirementTool} optionLabel="name"
                    placeholder={<span className="left_btm_placeholder">Jira WorkItem</span>} className="w-full" />     */}
            </div>
            <div className="left_btm_container pb-1">
                <div className="left_btm_header my-1 font-medium">Template <span style={{ color: "#d50000" }}>*</span></div>
                <Dropdown
                    value={selectedTemp}
                    options={readTempData} optionLabel='name' onChange={(e) => {templateHandler(e);submitPayload(e.value)}}
                    placeholder={<span className="left_btm_placeholder">Select a Template</span>} className="w-full" />
            </div>
            </div>
            {/* <div>
                <Button className="w-full" label="Submit" onClick={() =>{ submitPayload(); onSubmitClick()}} />
            </div> */}
        </div>
        <div className="genai_right_container"><MiddleContainerGenAi/></div>
        <div className="genai_right_content p-2"><RightPanelGenAi/></div>

    </div>
   )
}

export default GenAi;