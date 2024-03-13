import { React, useRef } from "react"
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


const GenAi = () => {
    const toast = useRef(null);
    const onUpload = () => {
        console.log("etnering")
        toast.current.show({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
    };
    const header = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="left_table_header">Recently uploaded files</span>
            <span className="left_table_view">View All</span>
        </div>
    );
    const actionTemplate = () => {
        return <div><span className="pi pi-trash"></span></div>
    }
    return (<div className="genai_container flex">
        <Toast ref={toast}></Toast>
        <div className="genai_left_container p-3">
            <div className="context_container flex align-items-center border-bottom-1 pb-2 mb-3">
                <div className="w-1 context_logo_container flex justify-content-center align-items-center mr-2">
                    <img className="context_logo w-full" src="static\imgs\context setting.svg" />
                </div>
                <div className="context_heading">Context Setting</div>
            </div>
            <div className="context_doc my-2">Document</div>
            <div className="doc_container flex flex-column border-round my-2">
                <div className="doc_top">
                    {/* <FileUpload mode="basic" name="demo[]" multiple={false} accept=".pdf" maxFileSize={1000000} onUpload={onUpload} className="doc_fileupload ml-3" chooseOptions={{icon:"pi pi-upload",label:"Upload"}} /> */}
                    <FileUpload name="demo[]" multiple={false} accept=".pdf" maxFileSize={1000000} emptyTemplate={<div className="doc_btm flex justify-content-center align-items-center">
                        <span className="doc_btm_para">File type:pdf | File size:1,00,000 words | No. of files:1 </span>
                    </div>} />
                </div>

            </div>
            <div className="">
                <DataTable value={[{name:"Example"}]} header={header} tableStyle={{}}>
                    <Column field="name" header="Name"></Column>
                    <Column field="action" header="Action" body={actionTemplate}></Column>
                </DataTable>
            </div>
            <div className="flex justify-content-center align-items-center my-3 leftandor">AND / OR</div>
            <div className="left_btm_container pb-3">
                <div className="left_btm_header my-2">Requirement Management Tool</div>
                <Dropdown 
                // value={selectedCity} 
                // onChange={(e) => setSelectedCity(e.value)} 
                // options={cities} optionLabel="name" 
                 placeholder={<span className="left_btm_placeholder">Select a Tool</span>} className="w-full md:w-14rem" />
            </div>
            <div className="left_btm_container pb-3">
                <div className="left_btm_header my-2">Template</div>
                <Dropdown 
                // value={selectedCity} 
                // onChange={(e) => setSelectedCity(e.value)} 
                // options={cities} optionLabel="name" 
                 placeholder={<span className="left_btm_placeholder">Select a Template</span>} className="w-full md:w-14rem" />
            </div>
            <div>
            <Button className="w-full" label="Submit" />
            </div>
        </div>
        <div className="genai_right_container"><MiddleContainerGenAi/></div>
        <div className="genai_right_content"><RightPanelGenAi /></div>

    </div>)
}

export default GenAi;