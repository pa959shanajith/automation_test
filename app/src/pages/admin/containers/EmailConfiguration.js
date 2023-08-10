import React, { Fragment, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import '../styles/EmailConfiguration.scss';
import { RadioButton } from 'primereact/radiobutton';
import { InputNumber } from 'primereact/inputnumber';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { Checkbox } from "primereact/checkbox";



const EmailConfiguration = () => {
    const [value3, setValue3] = useState('');
    const [checked, setChecked] = useState(false);
    return (
        <div>
            <div className='full_page'>
                <>
                    <div>
                        <label required className='provider'> select provider</label>
                    </div>
                    <Dropdown className='provider_dropdown' placeholder="Select provider" />
                    <div className='email_setting_header'>
                        Email Server Settings
                    </div>
                    <div>
                        <label className='hostname'>Host name</label>
                        <label className='servername'>Server Name</label>
                        <div>
                            <InputText placeholder="Enter Server Host ID/Domain Name" className='host_name'></InputText>
                            <InputText placeholder="Enter Server Name" className="server_name"></InputText>
                        </div>
                        <div>
                            <lable className="portname">Port Number </lable>
                        </div>
                        <div>
                            <InputText placeholder="Enter Port No" className="port_no"></InputText>
                        </div>
                        <div>
                            <label className='Auth_info'>Authentication Information</label>
                        </div>
                        <div>
                            <lable className="Authname">Authentication Type</lable>
                        </div>
                        <div>
                            <Dropdown className='Auth_dropdown' placeholder="Select Authentication Type" />
                        </div>
                        <div>
                            <label className='AuthUsername'>Authentication UserName</label>
                            <label className='AuthPassword'>Authentication Password</label>
                        </div>
                        <div>
                            <InputText placeholder="Enter Authentication UserName" className='Auth_Username'></InputText>
                            <InputText placeholder="Enter Authentication PassWord" className="Auth_Password"></InputText>
                        </div>
                        <div>
                            <label className='security_label'>Connection Security</label>
                            <div className='connection_label'>
                                <label className='selectconn_label'>Select connection</label>
                                <label className='tLs_label'>Ignore TLS error</label></div>
                            <div className="flex align-items-center">
                                <RadioButton />
                                <label className="ml-2">Auto</label>
                                <RadioButton />
                                <label className="ml-2">Enable</label>
                                <RadioButton />
                                <label className="ml-2">disable</label>
                                <RadioButton className="tLs_radiobutton" />
                                <label className="ml-2" >yes</label>

                                <RadioButton />
                                <label className="ml-2">No</label>

                            </div>



                        </div>
                        <Accordion activeIndex={0} className="accordiantab">
                            <AccordionTab header="Authentication Configuration" >
                                <div className='flex flex-column pl-4 authheader'>
                                <img  src="static/imgs/timeout_icon.svg"className='timeImg' />
                                    <label className='font-bold timelabel'> Time Out</label>
                                    <div className="flex-auto">
                                        <label htmlFor="minmax-buttons" className=" block mb-2 contime_label">connection time out</label>
                                        <InputNumber inputId="minmax-buttons" value={value3} onValueChange={(e) => setValue3(e.value)} mode="decimal" showButtons min={0} max={100} className="input_button" placeholder='Enter connection timeout(in milisec)' />
                                    </div>
                                    <div className="flex-auto">
                                        <label htmlFor="minmax-buttons" className=" block mb-2 conSocket_label">Socket time out</label>
                                        <InputNumber inputId="minmax-buttons" value={value3} onValueChange={(e) => setValue3(e.value)} mode="decimal" showButtons min={0} max={100} className="socket_button" placeholder='Enter Socket timeout(in milisec)' />
                                    </div>
                                    <div className="flex-auto">
                                        <label htmlFor="minmax-buttons" className=" block mb-2 greet_label">Greeting time out</label>
                                        <InputNumber inputId="minmax-buttons" value={value3} onValueChange={(e) => setValue3(e.value)} mode="decimal" showButtons min={0} max={100} className="greet_button" placeholder='Enter Greeting timeout(in milisec)' />
                                    </div>
                                    <div>
                                        <Checkbox onChange={e => setChecked(e.checked)} checked={checked} className="checkbox_conn"></Checkbox>
                                        <img  src="static/imgs/connection_icon.svg"   /> 
                                        <lable className="connection_label">Connection</lable>
                                        <div>
                                            <div className="flex-auto">
                                                <label htmlFor="minmax-buttons" className=" block mb-2 connec_but">Maximum Connection</label>
                                                <InputNumber inputId="minmax-buttons" value={value3} onValueChange={(e) => setValue3(e.value)} mode="decimal" showButtons min={0} max={100} className="max_button" placeholder='Enter Socket timeout(in milisec)' />
                                            </div>
                                            <div className="flex-auto">
                                                <label htmlFor="minmax-buttons" className=" block mb-2 msg_label">Maximun Messages</label>
                                                <InputNumber inputId="minmax-buttons" value={value3} onValueChange={(e) => setValue3(e.value)} mode="decimal" showButtons min={0} max={100} className="maxmsg_button" placeholder='Enter Greeting timeout(in milisec)' />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <Checkbox onChange={e => setChecked(e.checked)} checked={checked} className="checkbox_conn"></Checkbox>
                                        <img  src="static/imgs/proxy_icon.svg" className='proxy_img'  /> 
                                        <lable className="Proxy_label">Proxy</lable>
                                        <div>
                                            <div className="flex-auto">
                                                <label className='url_proxy'>Proxy Server URL</label>
                                                <div >
                                                <InputText placeholder="Enter Proxy URL" className="Proxy_srver"></InputText>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        {/* <Checkbox onChange={e => setChecked(e.checked)} checked={checked} className="checkbox_conn"></Checkbox> */}
                                        <lable className="ProxyCred_label">Proxy Credentials</lable>
                                        <div>
                                            <div className="flex-auto">
                                                <label className='proxyUser_label'>Proxy username</label>
                                                <div >
                                                <InputText placeholder="Enter Proxy URL" className="Proxy_username"></InputText>
                                                </div>
                                            </div>
                                            <div className="flex-auto">
                                                <label className='proxypass_label'>Proxy Password</label>
                                                <div className="Proxy_Password">
                                                <InputText placeholder="Enter Proxy URL" ></InputText>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                            </AccordionTab>
                        </Accordion>

                    </div>
                   

                </>

            </div>
            <div className="emailActionBtn">
                    <Button className="disabelbtn" size="small" >Disable</Button>
                    <Button className="testbtn" size="small" >Test</Button>
                    <Button className="savebtn" size="small" >Save</Button>
                </div>
            <div>
               
            </div>

        </div>

    )

}
export default EmailConfiguration;