import React, { useState } from "react";
import { Dialog } from 'primereact/dialog';
import { TabMenu } from 'primereact/tabmenu';
import { Dropdown } from 'primereact/dropdown';
import "../styles/manageIntegrations.scss";
import { InputText } from "primereact/inputtext";
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { Card } from 'primereact/card';



const ManageIntegrations = ({ visible, onHide }) => {
    const [selectedIntegrationType, setSelectedIntegrationType] = useState(null);
    const [passeordValue, setPasswordValue] = useState('');
    const [value, setValue] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [showLoginCard, setShowLoginCard] = useState(true);

    const integrationItems = [
        { label: 'ALM' },
        { label: 'Cloud Based Integration' },
    ];


    const IntegrationTypes = [
        { name: 'jira', code: 'NY' },
        { name: 'Zephyr', code: 'RM' },
        { name: 'Azure DevOps', code: 'LDN' },
        { name: 'ALM', code: 'LDN' },
        { name: 'qTest', code: 'LDN' },
    ];

    const handleCloseManageIntegrations = () => {
        onHide();
    }

    const dropdownOptions = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' },
    ];

    const handleTabChange = (index) => {
        setActiveIndex(index);
    };

    const showCard2 = () => {
        setShowLoginCard(false);
    };

    const showLogin = () => {
        setShowLoginCard(true);
    };

    const footerIntegrations = (
        <div className='btn-11'>
            <Button label="Save" severity="primary" className='btn1' />
        </div>
    );




    return (
        <>
            <div className="card flex justify-content-center">
                <Dialog header="Manage Integrations" visible={visible} style={{ width: '70vw', height: '45vw' }} onHide={handleCloseManageIntegrations} footer={!showLoginCard ? footerIntegrations : ""}>
                    <div className="card">
                        <TabMenu model={integrationItems} />
                    </div>


                    {showLoginCard ? (
                        <>
                            <div className="login_container_integrations">
                                <div className="side-panel">
                                    <div className="icon-wrapper">
                                        <span><img src="static/imgs/jira_icon.svg" className="img__jira"></img></span>
                                        <span className="text__jira">Jira</span>
                                    </div>
                                    <div className="icon-wrapper">
                                        <span><img src="static/imgs/azure_devops_icon.svg" className="img__azure"></img></span>
                                        <span className="text__azure">Azure DevOps</span>
                                    </div>
                                    <div className="icon-wrapper">
                                        <span><img src="static/imgs/zephyr_icon.svg" className="img__zephyr"></img></span>
                                        <span className="text__zephyr">Zephyr</span>
                                    </div>
                                    <div className="icon-wrapper">
                                        <span><img src="static/imgs/qTest_icon.svg" className="img__qtest"></img></span>
                                        <span className="text__qtest">qTest</span>
                                    </div>
                                    <div className="icon-wrapper">
                                        <span><img src="static/imgs/ALM_icon.svg" className="img__alm"></img></span>
                                        <span className="text__alm">ALM</span>
                                    </div>
                                </div>

                                <Card className="card__login__jira">
                                    <div className="Login__jira">

                                        <p style={{ marginBottom: '0.5rem', marginTop: '0.5rem' }} className="login-cls">Login </p>
                                        <div className="input-cls">
                                            <span>Username <span style={{ color: 'red' }}>*</span></span>
                                            <span className="p-float-label" style={{ marginLeft: '1.5rem' }}>
                                                <InputText style={{ width: '20rem', height: '2.5rem' }} className="input-txt1" id="username" value={value} onChange={(e) => setValue(e.target.value)} />
                                                <label htmlFor="username">Username</label>
                                            </span>
                                        </div>
                                        <div className="passwrd-cls">
                                            <span>Password <span style={{ color: 'red' }}>*</span></span>
                                            <Password style={{ width: '20rem', height: '2.5rem', marginLeft: '2rem' }} className="input-txt1" value={passeordValue} onChange={(e) => setPasswordValue(e.target.passeordValue)} toggleMask />
                                        </div>
                                        <div className="url-cls">
                                            <span>URL <span style={{ color: 'red' }}>*</span></span>
                                            <span className="p-float-label" style={{ marginLeft: '4.5rem' }}>
                                                <InputText style={{ width: '20rem', height: '2.5rem' }} className="input-txt1" id="URL" value={value} onChange={(e) => setValue(e.target.value)} />
                                                <label htmlFor="username">URL</label>
                                            </span>
                                        </div>
                                        <div className="login__div">
                                            <Button size="small" label="login" onClick={showCard2} className="login__btn"></Button>
                                        </div>

                                    </div></Card>
                            </div>
                        </>


                        // <div>
                        //   <p style={{marginBottom:'0.5rem',marginTop:'0.5rem'}} className="login-cls">Login </p>
                        //   <div className="input-cls">
                        //   <span>Username <span style={{color:'red'}}>*</span></span>
                        //     <span className="p-float-label" style={{marginLeft:'1.5rem'}}>
                        //         <InputText style={{width:'20rem', height:'2.5rem'}} className="input-txt1" id="username" value={value} onChange={(e) => setValue(e.target.value)} />
                        //         <label htmlFor="username">Username</label>
                        //     </span>
                        //     </div>
                        //     <div className="passwrd-cls">
                        //     <span>Password <span style={{color:'red'}}>*</span></span>
                        //     <Password style={{width:'20rem', height:'2.5rem' , marginLeft:'2rem'}} className="input-txt1"value={passeordValue} onChange={(e) => setPasswordValue(e.target.passeordValue)} toggleMask />
                        //     </div>
                        //     <div className="url-cls">
                        //     <span>URL <span style={{color:'red'}}>*</span></span>
                        //     <span className="p-float-label" style={{marginLeft:'4.5rem'}}>
                        //         <InputText  style={{width:'20rem', height:'2.5rem'}}className="input-txt1" id="URL" value={value} onChange={(e) => setValue(e.target.value)} />
                        //         <label htmlFor="username">URL</label>
                        //     </span>
                        //     </div>
                        //     <div>
                        //         <Button className="loginbtn-jira"  onClick={showCard2} label="Login"></Button>
                        //     </div>

                        // </div>
                    ) : (
                        <div>
                            <span className="integration_header">Jira Integration</span>
                            <Button label="Logout" size="small" onClick={showLogin} className="logout__btn"></Button>
                            <div className="tab__cls">
                                <TabView activeIndex={activeIndex} onTabChange={(e) => handleTabChange(e.index)}>
                                    <TabPanel header="Mapping">
                                        <div className="data__mapping">
                                            <div className="card_data1">
                                                <Card className="mapping_data_card1">
                                                    <div className="dropdown_div">
                                                        <div className="dropdown-map">
                                                            <span>Select Project <span style={{ color: 'red' }}>*</span></span>
                                                            <span className="release_span"> Select Release<span style={{ color: 'red' }}>*</span></span>
                                                        </div>
                                                        <div className="dropdown-map">
                                                            <Dropdown style={{ width: '11rem', height: '2.5rem' }} className="dropdown_project" options={dropdownOptions} placeholder="Select Project" />
                                                            <Dropdown style={{ width: '11rem', height: '2.5rem' }} className="dropdown_release" options={dropdownOptions} placeholder="Select Release" />
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>

                                            <div>
                                                <div className="card_data2">
                                                    <Card className="mapping_data_card2">
                                                        <div className="dropdown_div">
                                                            <div className="dropdown-map">
                                                                <span>Select Project <span style={{ color: 'red' }}>*</span></span>
                                                            </div>
                                                            <div className="dropdown-map">
                                                                <Dropdown options={dropdownOptions} style={{ width: '11rem', height: '2.5rem' }} className="dropdown_project" placeholder="Select Project" />
                                                            </div>
                                                        </div>
                                                    </Card>
                                                </div>
                                            </div>
                                        </div>

                                    </TabPanel>

                                    <TabPanel header=" View Mapping">
                                        {/* Content for "Mapping Data" tab */}

                                    </TabPanel>
                                </TabView>
                            </div>


                        </div>
                    )}


                </Dialog>
            </div>

        </>
    )
}

export default ManageIntegrations;