import React, { useState, useRef } from 'react'
import GitConfig from '../containers/GitConfig';
import '../styles/TestArtifacts.scss';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';



const TestArtifacts = (props) => {
  const toast = useRef();
  const [selectedscreen, setSelectedscreen] = useState('')
  const [selectConfiguration, setSelectConfiguration] = useState({ name:"Git", img:"static/imgs/GitIcon.svg", code:"Git"});

  // const handleScreenChange = (screenName) => {
  //   setSelectedscreen(screenName);
  // }

  const configOptions = [
    { name:"Git", img:"static/imgs/GitIcon.svg", code:"Git"},
    { name: "Bitbucket", img:"static/imgs/bitbucket_icon.svg", code:"Bit"}
  ]

  const toastError = (erroMessage) => {
    if (erroMessage.CONTENT) {
      toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
    }
    else toast.current.show({ severity: 'error', summary: 'Error', detail: erroMessage, life: 5000 });
  }

  const toastWarn = (warnMessage) => {
    if (warnMessage.CONTENT) {
      toast.current.show({ severity: warnMessage.VARIANT, summary: 'Warning', detail: warnMessage.CONTENT, life: 5000 });
    }
    else toast.current.show({ severity: 'warn', summary: 'Warning', detail: warnMessage, life: 5000 });
  }

  const toastSuccess = (successMessage) => {
    if (successMessage.CONTENT) {
      toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
    }
    else toast.current.show({ severity: 'success', summary: 'Success', detail: successMessage, life: 5000 });
  }

  
  const versionOptionTemplate = (option) => {
    return (
        <div className="flex align-items-center">
            <img alt={option.name} src={option.img} className={`mr-2 flag flag-${option.code.toLowerCase()}`} style={{ width: '18px' }} />
            <div>{option.name}</div>
        </div>
    );
  };

  const selectedVersionTemplate = (option, props) => {
    if (option) {
        return (
            <div className="flex align-items-center">
                <img alt={option.name} src={option.img} className={`mr-2 flag flag-${option.code.toLowerCase()}`} style={{ width: '18px' }} />
                <div>{option.name}</div>
            </div>
        );
    }
  }

  return (
    <div className="test_artifact_container">
      <Toast ref={toast} position="bottom-center" baseZIndex={9999} />

      <div className=" test_artifact_container_navbar">
        {/* <div>
                    <div className={`integration-card ${selectedscreen === 'Git' ? 'selected' : ''}`} onClick={() => handleScreenChange('Git')}>
                        <img src="static/imgs/git_configuration_icon.svg" className="img__alm" alt="Git Icon" />
                        <span className="text_git">Git<br />Configuration</span>
                    </div>
                </div>
                <div>
                    <div className={`integration-card ${selectedscreen === 'Bit' ? 'selected' : ''}`} onClick={() => handleScreenChange('Bit')}>
                        <img src="static/imgs/git_configuration_icon.svg" className="img__alm" alt="Git Icon" />
                        <span className="text_git">Bit<br />Configuration</span>
                    </div>
                </div> */}

        <Dropdown
          value={selectConfiguration}
          options={configOptions}
          onChange={(e) => { setSelectConfiguration(e.value)}}
          valueTemplate={selectedVersionTemplate}
          itemTemplate={versionOptionTemplate}
          className='pl-1 p-inputtext-sm'
          optionLabel="name"
          style={{ height: '2rem', display: "flex", alignItems: "center", width: '10rem' }}
          placeholder={"Select"}
          // defaultValue={configOptions[0]}
        />

      </div>

      <div className="test_artifact_container_content">
        {selectConfiguration?.name !== '' && <GitConfig toastError={toastError} toastSuccess={toastSuccess} toastWarn={toastWarn} screenName={selectConfiguration?.name} />}
        {/* <GitConfig toastError={props.toastError} toastSuccess={props.toastSuccess} toastWarn={props.toastWarn} /> */}
      </div>
    </div >
  )
}

export default TestArtifacts;
