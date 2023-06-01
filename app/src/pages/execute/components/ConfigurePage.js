import React , {useState,useEffect}from 'react';
import { TabMenu } from 'primereact/tabmenu';
import {Card} from 'primereact/card';
import '../styles/ConfigurePage.scss';
import { Panel } from 'primereact/panel';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Breadcrumbs, Checkbox } from '@mui/material';
// import { products } from './products';
import { Button } from 'primereact/button';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Link } from 'react-router-dom';
import AvoModal from '../../../globalComponents/AvoModal';
import ConfigureSetup from './ConfigureSetup';
import { getAvoAgentAndAvoGrid, getModules, getProjects, storeConfigureKey } from '../configureSetupSlice';
import { useDispatch, useSelector } from 'react-redux';

const ConfigurePage =({})=>{
  const [visible, setVisible] = useState(false);
  const [footerType, setFooterType] = useState("CancelNext");
  const [tabIndex, setTabIndex] = useState(0);
    const items = [
        {label: 'Configure'},
        {label: 'Scheduled Executions' },
      
    ];
    const items1 = [{ label: 'Home'  },{ label: 'ConfigurePage' }];
  
  const getConfigData = useSelector((store) => store.configsetup);
  const getRequired = getConfigData.requiredFeilds;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getProjects());
    dispatch(getAvoAgentAndAvoGrid());
  }, []);

  useEffect(() => {
    if (!!getConfigData?.projects.length)
      dispatch(getModules(getConfigData?.projects));
  }, [getConfigData?.projects]);

  const onModalBtnClick = (getBtnType) => {
    if(getBtnType === "Next"){
      setTabIndex(1);
    }
    else if(getBtnType === "Save"){
      dispatch(storeConfigureKey());
    }
    else setVisible(false);
  };

  useEffect(() => {
    setFooterType(tabIndex ? "CancelSave" : "CancelNext");
  }, [tabIndex]);

const Breadcrumbs = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
    return (
      <nav>
    
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li>
            <Link to="/"> Home </Link>
            <span> / </span>
            <span onClick={toggleDropdown}>Configure & Execute
            {/* <span className='dropdown'>{isOpen ? '▲' : '▼'}</span> */}
            </span>
          {isOpen && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            
            </ul>
          )}
            </li>
        </ul>
      </nav>
    );
  };
  
  
  // const staticData = [];
  const staticData = [
    {
      sno: 1,
      profileName: (<div >
        <Checkbox/> 
        <span>Regression</span>
      </div>),
      executionOptions:( <div className="Buttons_config">
        <Button style={{width:"8rem",fontFamily:"Open Sans",fontStyle:'normal'}}> Execute Now</Button>
        <Button style={{width:"6rem",fontFamily:"Open Sans",fontStyle:'normal'}}>Schedule</Button>
        <Button   style={{width:"4.5rem",fontFamily:"Open Sans",fontStyle:'normal'}}>CI/CD</Button>
      </div>),
      actions: (
        <div>
        <Button icon="pi pi-pencil" className="p-button-edit"></Button>
        <Button icon="pi pi-trash" className="p-button-edit"></Button>
      </div>
        // <Button icon="pi pi-trash" className="trash_button"></Button>
      ) 
    },
   
    {
      sno: 2,
      profileName: (<div >
        <Checkbox/> 
        <span>Performance</span>
      </div>),
      executionOptions:( <div className="Buttons_config">
      <Button style={{width:"8.5rem",fontFamily:"Open Sans",fontStyle:'normal'}}> Execute Now</Button>
      <Button style={{width:"6rem",height: '17px',fontFamily:"Open Sans",fontStyle:'normal'}}>Schedule</Button>
      <Button style={{width:"4.5rem",fontFamily:"Open Sans",fontStyle:'normal'}}>CI/CD</Button>
    </div>),
       actions: (
        <div>
        <Button icon="pi pi-pencil" className="p-button-edit"></Button>
        <Button icon="pi pi-trash" className="p-button-edit"></Button>
      </div>
        // <Button icon="pi pi-trash" className="trash_button"></Button>
        // <Button icon="pi pi-pencil" ></Button>
      )
    },
    {
        sno: 3,
        profileName: (<div >
            <Checkbox/> 
            <span>Regression</span>
          </div>),
        executionOptions:( <div className="Buttons_config">
        <Button style={{width:"8.5rem",fontFamily:"Open Sans",fontStyle:'normal'}}> Execute Now</Button>
        <Button style={{width:"6rem",fontFamily:"Open Sans",fontStyle:'normal'}}>Schedule</Button>
        <Button style={{width:"4.5rem",fontFamily:"Open Sans",fontStyle:'normal'}}>CI/CD</Button>
      </div>),
         actions: (
            <div>
            <Button icon="pi pi-pencil" className="p-button-edit"></Button>
            <Button icon="pi pi-trash" className="p-button-edit"></Button>
          </div>
        // <Button icon="pi pi-trash" className="trash_button"></Button>
      )
      },
   
  ];
  const checkboxHeaderTemplate = () => {
    return (
      <>
        <Checkbox />
        <span>Configuration Profile Name</span>
      </>
    );
  };
  
  const renderTable = () => {
    
    
    if (staticData.length > 0) {
      return (
        <>
       
       <DataTable className='p-datatable p-datatable-thead > tr > th ' value={staticData} style={{ width: '100%', height: 'calc(100vh - 250px)',marginRight:'5rem' ,}}>
          <Column  style={{  fontWeight: "normal",fontFamily:"open Sans",}} field="sno" header="S.No." />
          <Column style={{  fontWeight: "normal",fontFamily:"open Sans"}} field="profileName"  header={checkboxHeaderTemplate}   />
          <Column style={{ fontWeight: "normal",fontFamily:"open Sans"}} field="executionOptions" header="Execution Options" />
          <Column style={{  fontWeight: "normal",fontFamily:"open Sans"}} field="actions" header="Actions" />
        </DataTable>
        
      </>
      );
    } else {
      return (
       
        <Panel  className="config_header config_content" header={
            <div>
               <span style={{ marginRight: '13rem', fontWeight: "normal",fontFamily:"open Sans"}}>S.No.</span>
               <span style={{ marginRight: '13rem',fontWeight: "normal",fontFamily:"open Sans" }}> <Checkbox/> Configuration Profile Name</span>
               <span style={{ marginRight: '13rem',fontWeight: "normal",fontFamily:"open Sans" }}>Execution Options</span>
               <span style={{ marginRight: '12rem',fontWeight: "normal" ,fontFamily:"open Sans"}}>Actions</span>
           </div>
             }>   
           <div className='no_card_content1'  >
              <div className="image-container1">
                 <img  className='img1'ame alt="Card" src="static/imgs/execution_report.png" />
                 <span className="text1 ">not configured</span>
              </div>
           </div>
           <Button className='configure_button' onClick={() => setVisible(true)}> configure </Button>
      </Panel>
      );
    }
  };
return(
<>
<div >
<Breadcrumbs />
  <TabMenu className='tab-menu'   model={items}  />
    <div className="ConfigurePage_container m-2">
    {renderTable()}
          {/* {staticData.length === 0 && (
            <Button className='configure_button'>configure</Button>
          )} */}
       {/* <DataTable  value={staticData} style={{ width: '100%', height: 'calc(100vh - 250px)'}}>
            <Column field="sno" header="S.No." />
            <Column field="profileName" header="Configuration Profile Name" />
            <Column field="executionOptions" header="Execution Options" />
            <Column field="actions" header="Actions" />
          </DataTable> */}
    </div>
    <AvoModal
        visible={visible}
        setVisible={setVisible}
        onModalBtnClick={onModalBtnClick}
        content={<ConfigureSetup configData={getConfigData} tabIndex={tabIndex} setTabIndex={setTabIndex} />}
        headerTxt="Execution Configuration set up"
        footerType={footerType}
        modalSytle={{ width: "85vw", height: "94vh", background: "#FFFFFF" }}
      />
  </div>
</>
);
};
export default ConfigurePage;