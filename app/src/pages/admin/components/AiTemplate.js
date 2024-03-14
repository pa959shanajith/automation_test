import React, { Fragment, useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import "../styles/AiTemplate.scss";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Slider } from 'primereact/slider';
import { InputSwitch } from 'primereact/inputswitch';
import {createTemp, readModel , readTemp} from "../api";
import { Toast } from 'primereact/toast';


const AiTemplate = () => {
    const [displayTemplate, setDisplayTemplate] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [domain, setDomain] = useState('');
    const [llmModel, setLlmModel] = useState(null);
    const [testType, setTestType] = useState(null);
    const [accuracy, setAccuracy] = useState(0);
    const [activeCheck, setActiveCheck] = useState(false);
    const [defaultChcek, setDefaultCheck] = useState(false);
    const toast = useRef(null);
    const [modelData , setModelData] = useState([])


    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
    if (!userInfo) userInfo = userInfoFromRedux;
    else userInfo = userInfo;

    const LLMModel = [
        {name: 'Positive', code: 'NY'},
        {name: 'Negative', code: 'RM'},
        {name: 'Edge Case', code: 'LDN'},
     
    ];


    const onTestTypeChange = (e) => {
        setTestType(e.value);
    }


    const showTemplate= () => {
       llmData();
        setDisplayTemplate(true);
        resetForm();
      };
    
      const hideTemplate = () => {
        onCreateTemplate();
        setDisplayTemplate(false);
        resetForm();
      };

      const resetForm = () => {
        setDomain('');
        setLlmModel('');
        setAccuracy('');
        setActiveCheck(false);
        setDefaultCheck(false);
        setName('');
        setTestType('');
        setDescription('');
      };

      const onCreateTemplate = async () => {
        const scaledAccuracy = accuracy / 100;
        try {
            const templateData = await createTemp({
              "domain": domain,
              "model_id": llmModel,
              "test_type": testType.name,
              "temperature":scaledAccuracy ,
                "active": activeCheck,
                "default": defaultChcek,
                "name": name,
                "description":description
            });

            console.log(templateData);
            if (templateData.status) {
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Template created successfully', life: 3000 });
                resetForm();
              } else {
                toast.current.show({ severity: 'error', summary: 'Error', detail: templateData.error || 'Unknown error', life: 3000 });
              }

        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
         }
      };

      const llmData = async () => {
        try {
            const modalData = await readModel({
              "userid": userInfo.user_id,
            
            });
            const data = modalData.data.data || [];
            setModelData(data);

        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
         }
      };

      const modalOptions = modelData.map(item => ({
        name: item.name,
        value: item._id
      }));

   



      const onModelChange = (e) => {
        setLlmModel(e.value); 
    }

      
  const customFooter = (
    <div>
      <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setDisplayTemplate(false)}/>
      <Button label="Save" icon="pi pi-check" className="p-button-text" onClick = {hideTemplate}/>
    </div>
  );


    return(
        <>
         <Toast ref={toast} />

<Dialog header="Add Template" visible={displayTemplate} style={{ width: '30vw', height:'40vw' }} onHide={hideTemplate} footer={customFooter}>
<div className='flex flex-row justify-content-between pl-2 pb-2'>
                            <div className="flex flex-column">
                                <label className="pb-2 font-medium"> Name </label>
                                <InputText value={name} onChange={(e) => setName(e.target.value)} style={{width:'28rem'}} />

                                <label className="pb-2 font-medium"> Description </label>
                                <InputText value={description} onChange={(e) => setDescription(e.target.value)} style={{width:'28rem'}} />

                                <label className="pb-2 font-medium"> Industry Domain </label>
                                <InputText value={domain} onChange={(e) => setDomain(e.target.value)} style={{width:'28rem'}}/>

                        <label  className="pb-2 font-medium">LLM Model</label>
                        <Dropdown value={llmModel} options={modalOptions} onChange={onModelChange} optionLabel="name" placeholder="Select a LLM Model" style={{width:'28rem'}} />

                        <label  className="pb-2 font-medium">Test Type</label>
                        <Dropdown value={testType} options={LLMModel} onChange={onTestTypeChange} optionLabel="name" placeholder="Select a Test Type" style={{width:'28rem'}} />
                        
                        <div className='accuracy_div'>
                            <label  className="pb-4 font-medium">Accuracy</label>
                            <div className="flex flex-row  temp-div">
                            <label  className="pb-2 font-medium">Low</label>
                            <div className="accuracy_sub_div">
                                <InputText value={accuracy} onChange={(e) => setAccuracy(e.target.value)} style={{width:'24rem'}} />
                                <Slider value={accuracy} onChange={(e) => setAccuracy(e.value)}  style={{width:'24rem'}}/>
                            </div>
                            <label  className="pb-2 font-medium">High</label>
                            </div>
                        </div>
                        <div className="flex flex-row active-class">
                         <label  className="pb-2 font-medium"> Active</label>
                        <InputSwitch checked={activeCheck} onChange={(e) => setActiveCheck(e.value)} />
                        </div>
                        <div className="flex flex-row default-class">
                        <label  className="pb-2 font-medium"> Default</label>
                        <InputSwitch checked={defaultChcek} onChange={(e) => setDefaultCheck(e.value)} />
                        </div>


                            </div>
                            </div>
 
</Dialog>

<div className='empty_template_div'>
<img src="static/imgs/template.svg" alt="SVG Image"  />
<span>
            No AI templates yet
        </span>
        <Button label='Create' onClick={showTemplate} ></Button>
        
</div>
      
        </>
    )
}

export default AiTemplate;