import React, { Fragment, useState, useEffect, createRef, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import '../styles/EmailConfiguration.scss';
import { RadioButton } from 'primereact/radiobutton';
import { InputNumber } from 'primereact/inputnumber';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { Checkbox } from "primereact/checkbox";
import { getNotificationChannels, manageNotificationChannels } from '../api'
import { ScreenOverlay, setMsg,ScrollBar, Messages as MSG, VARIANT } from '../../global'
import { Dialog } from 'primereact/dialog';
import EmailTest from '../components/EmailTest';
import { testNotificationChannels } from '../api'
import {FormInput,FormRadio,FormSelect} from '../components/FormComp'



const EmailConfiguration = ({ resetMiddleScreen }) => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');
    const [value3, setValue3] = useState('');
    const [value4, setValue4] = useState('');
    const [value5, setValue5] = useState('');
    const [checked, setChecked] = useState(false);
    const [checked_proxy, setChecked_proxy] = useState(false);
    const [loading, setLoading] = useState(false);
    const [inputRef, setinputRef] = useState({})
    const [reload, setReload] = useState(false)
    const fn = factoryFn(inputRef)
    const displayError = (error) => {
        setLoading(false)
        setMsg(error)
    }
    const [selectedProvider, setSelectedProvider] = useState('');
    const [emailTest, setEmailTest] = useState(false);
    const [selectedValue, setSelectedValue] = useState(null);
    const [inputEnabled, setInputEnabled] = useState(false);
    const [selectedOption, setSelectedOption] = useState('Auto');
    const [visible, setVisible] = useState(false);
    const emailRef = useRef()
    const [errMsg, setErrMsg] = useState("");
    const [confObj, setConfObj] = useState();
    const [secureConnect, setSecureConnect] = useState("Auto");
const [ignoreTlsErrors, setIgnoreTlsErrors] = useState("Yes");
const[hostname,setHostname]=useState('');
const[servername,setServername]=useState('')

    useEffect(() => {
        //on reset dismount component to show loading screen
        setinputRef({})
        setReload(true)
    }, [resetMiddleScreen])
    useEffect(() => {
        //on reload mount component back
        if (reload) {
            const Ref = {
                "toggleStatus": createRef(), "toggleUppdate": createRef(), "toggleTest": createRef(''), "servername": createRef(), "serverstatus": createRef(), "smtpHost": createRef(),"smtpPort": createRef(), "authname": createRef(),
                "authpassword": createRef(), "sendername": createRef(), "senderaddr": createRef(), "assureurl": createRef(),
                "conctimeout": createRef(), "grettimeout": createRef(), "socktimeout": createRef(), "maxconnection": createRef(), "maxmessages": createRef(),
                "proxyurl": createRef(), "proxyuser": createRef(), "proxypass": createRef(), "selectauth": createRef(), "selectprovider": createRef(),
                "secureconnect": { "auto": createRef(), "enable": createRef(), "disable": createRef() },
                "tlcerror": { "true": createRef(), "false": createRef() }, "checkproxyurl": createRef(), "checkboxpool": createRef(), "checkproxycred": createRef()
            }
            setinputRef(Ref)
            setReload(false)
        }
    }, [reload])
    useEffect(() => {
        // Disable buttons on the default screen if inputRef exists and the elements are available
        if (Object.keys(inputRef).length > 0) {
            if (inputRef.toggleUpdate?.current) {
                inputRef.toggleUpdate.current.disabled = true;
            }
            if (inputRef.toggleStatus?.current) {
                inputRef.toggleStatus.current.disabled = true;
            }
            if (inputRef.toggleTest?.current) {
                inputRef.toggleTest.current.disabled = true;
            }
            fn.showAll();
        }
        // eslint-disable-next-line
    }, [inputRef]);
    const options = [
        { label: 'SMTP', value: 'SMTP' },
    ];
    const handleDropdownChange = (e) => {
        const selectedType = e.value;
        setSelectedValue(selectedType);
        setInputEnabled(selectedType === 'basic');
    };
    const handleRadioClick = (value) => {
        setSelectedOption(value);
    };
    const handleIgnoreTlsErrorsChange = (option) => {
        setIgnoreTlsErrors(option);
        inputRef["tlcerror"].current = option;
      };
      const handleSecureConnectChange = (option) => {
        setSecureConnect(option);
        inputRef["secureconnect"].current = option;
      };
    //   const showDialog = () => {
    //     setVisible_test(true);
    //   };

    //   const onHide = () => {
    //     setVisible_test(false);
    //   };
    const submit = async () => {
        // eslint-disable-next-line
        const emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (emailRef.current.value.length === 0 || !emailRegEx.test(emailRef.current.value)) {
            setErrMsg("Recipient address is invalid!");
            emailRef.current.style.outline = 'red';
            return false;
        }
        emailRef.current.style.outline = ''
        setErrMsg('Sending...')
        const arg = { channel: confObj.channel, provider: confObj.provider, recipient: emailRef.current.value, conf: confObj }
        var data = await testNotificationChannels(arg)
        if (data.error) { setErrMsg(data.error.CONTENT); return; }
        else setErrMsg(data.CONTENT);
    }

    const onSelectProvider = (event) => {
        selectProvider({ inputRef, ...fn, displayError, setLoading });
        // const selectedValue = event.value;
        // setSelectedProvider(selectedValue);
        
    }
    const onClickTest = () => {
        setVisible(true)
        if (!validate(inputRef,displayError)) return;
        var val = getConfObj(inputRef)
        setEmailTest(val) 
       
        
    }
    
    
    const onClickToggle = () => {
        clickToggle(inputRef.servername.current.value, inputRef.toggleStatus.current.innerText, setLoading, displayError, onSelectProvider)
    }
    const onClickUpdate = () => {
        if (!validate(inputRef, displayError)) return;
        var val = getConfObj(inputRef)
        update(val, inputRef.toggleUppdate.current.innerText, setLoading, displayError, onSelectProvider)
    }
    if (Object.keys(inputRef).length < 1) {
        //keep screen loading till inputRef is set
        return (
            <ScreenOverlay content={'Loading...'} />
        )
    }


    return (
        <div>
            <div className='full_page'>
                <>
                
                <div>
                        <label required className='provider'> select provider</label>
                    </div>
                    <FormSelect inpRef={inputRef['selectprovider']} onChangeFn={onSelectProvider} defValue={"Select Provider"} label={"Provider"} option={['SMTP']}/>
                    {/* <Dropdown  className='providerdropdown' ref={inputRef['selectprovider']}  value={selectedProvider} options={['SMTP']} onChange={onSelectProvider} placeholder="Select Provider" id="selectprovider" /> */}
                    <div className='email_setting_header'>
                        Email Server Settings
                    </div>
                    <div>
                        {/* <label className='hostname' >Host name</label>
                        <label className='servername' validExp={"emailServerName"}>Server Name</label> */}
                        <div>
                        <FormInput inpRef={inputRef['smtpHost']} label={'Host'} placeholder={'Server Host IP/Domain name'}/>
                            <FormInput inpRef={inputRef['servername']} label={'Server Name'} placeholder={'Server Name'} validExp={"emailServerName"}/>
                        </div>
                        <div>
                            <lable className="portname">Port Number </lable>
                        </div>
                        <div>
                        <FormInput inpRef={inputRef['smtpPort']} label={'Port'} placeholder={'Server Port'}/>
                        </div>
                        <FormSelect inpRef={inputRef['selectauth']} onChangeFn={fn.showAuth} defValue={"Select Authentication type"} label={"Authentication"} option={['none','basic']}/>

                       {/* <div class="auth-container">
    <label class="auth-label">Authentication Type</label>
    <div>
                            <Dropdown ref={inputRef['selectauth']} value={selectedValue} className='Auth_dropdown' placeholder="Select Authentication Type" options={['none', 'basic']} onChange={handleDropdownChange} />
                        </div>
</div> */}
                    
                        <div>
                        <FormInput inpRef={inputRef['authname']} label={'Authentication Username'} placeholder={'Authentication Username'} disabled={!inputEnabled}/>
                        <FormInput inpRef={inputRef['authpassword']} label={'Authentication Password'} placeholder={'Authentication Password'} disabled={!inputEnabled}/>
                        </div>
                <FormRadio inpRef={inputRef["secureconnect"]} label={'Secure Connection'} option={["Auto","Enable","Disable"]}/>
                <FormRadio inpRef={inputRef["tlcerror"]} label={'Ignore TLS Errors'} option={["Yes","No"]}/>
                <FormInput inpRef={inputRef['assureurl']} label={'Avo Assure URL'} placeholder={'Avo Assure Application URL'}/>
                <div>
                <FormInput inpRef={inputRef['conctimeout']} type={'number'} label={'Connection Timeout'} placeholder={'Connection Timeout (in milliseconds)'}/>
                <FormInput inpRef={inputRef['grettimeout']} type={'number'} label={'Greeting Timeout'} placeholder={'Greeting Timeout (in milliseconds)'}/>
                <FormInput inpRef={inputRef['socktimeout']} type={'number'} label={'Socket Timeout'} placeholder={'Socket Timeout (in milliseconds)'}/>
                </div>
                        
                      <div className='col-xs-9 form-group input-label checkbox-email'>
                    <span>
                        <input onChange={fn.showPool} id='checkboxpool' ref={inputRef['checkboxpool']} type='checkbox'></input>
                        <label htmlFor='checkboxpool'>Use Connection Pool</label>
                    </span>
                </div>
                <FormInput inpRef={inputRef['maxconnection']} type={'number'} label={'Max Connections'} placeholder={'Max Number of Connections Allowed in Pool'}/>
                <FormInput inpRef={inputRef['maxmessages']} type={'number'} label={'Max Messages'} placeholder={'Max Number of Messages Sent via Pool'}/>
                <div className='col-xs-9 form-group input-label checkbox-email'>
                    <span>
                        <input onChange={fn.showProxUrl} id='checkproxyurl' ref={inputRef['checkproxyurl']} type='checkbox'></input>
                        <label htmlFor='checkproxyurl'>Use Proxy</label>
                    </span>
                </div>
                <FormInput inpRef={inputRef['proxyurl']} label={'Proxy Server url'} placeholder={'Proxy Server URL (Eg: https://localhost:8080)'}/>
                <div className='col-xs-9 form-group input-label checkbox-email'>
                    <span>
                        <input onChange={fn.showProxCred} id='checkproxycred' ref={inputRef['checkproxycred']} type='checkbox'></input>
                        <label htmlFor='checkproxycred'>Proxy Requires Credentials</label>
                    </span>
                </div>
                <FormInput inpRef={inputRef['proxyuser']} label={'Proxy User'} placeholder={'Username For Proxy Server'}/>
                <FormInput inpRef={inputRef['proxypass']} label={'Proxy Password'} placeholder={'Password For Proxy Server'}/>

                    </div>


                </>

            </div>
            <div className="adminActionBtn">
                <Button ref={inputRef["toggleStatus"]} className="disabelbtn" onClick={onClickToggle} title="Disable">Disable</Button>
                <Button ref={inputRef["toggleUppdate"]} className="savebtn" onClick={onClickUpdate}  title="Update">Create</Button>
                {/* <button Ref={inputRef["toggleTest"]} className="a__btn " onClick={onClickTest}  title="Test">Test</button> */}
                
                 <Button  className="testbtn" size="small" onClick={onClickTest}>
                        Test
                    </Button>
                <Dialog header="Header" visible={visible} style={{ width: '50vw', height: '40%' }} onHide={() => setVisible(false)}>
                        <div style={{ width: "100%", margin: "20px 0px" }}>
                            <label>Recipient Email ID</label>
                            <InputText
                                ref={emailRef}
                                style={{ width: "60%", marginLeft: "24px" }}
                                placeholder="Enter Recipient Email ID"
                            />
                        </div>

                        <div className="mnode__buttons">
                            <label className="err-message">{errMsg}</label>
                            <Button className='test_submit' label="TEST" onClick={submit} />

                        </div>
                    </Dialog>
           
            </div>
            {emailTest?<EmailTest setEmailTest={setEmailTest} confObj={emailTest}/>:null}

        </div>

    )

}
const update = async (conf, action, setLoading, displayError, onSelectProvider) => {
    var emsg = "Failed to " + action + " '" + conf.name + "' Configuration.";
    setLoading(action.slice(0, -1) + "ing Configuration...")
    var data = await manageNotificationChannels({ 'action': action.toLowerCase(), conf })
    if (data.error) { displayError(data.error); return; }
    else if (data === "exists") {
        displayError({ CONTENT: "'" + conf.name + "' configuration already exists", VARIANT: VARIANT.WARNING });
        return;
    }
    else if (data === "success") {
        displayError({ CONTENT: "'" + conf.name + "' Configuration " + action + "d!", VARIANT: VARIANT.SUCCESS });
        onSelectProvider()
        return;
    } else if (/^1[0-4]{12}$/.test(data)) {
        if (+data[1]) {
            displayError({ CONTENT: emsg + " Invalid Request!", VARIANT: VARIANT.WARNING });
            return;
        }
        const errfields = [];
        if (+JSON.stringify(data)[2]) errfields.push("Server Name");
        if (+JSON.stringify(data)[3]) errfields.push("Channel");
        if (+JSON.stringify(data)[4]) errfields.push("Provider");
        if (+JSON.stringify(data)[5]) errfields.push("Server Host");
        if (+JSON.stringify(data)[6]) errfields.push("Server Port");
        if (+JSON.stringify(data)[7]) errfields.push("Sender Email");
        if (+JSON.stringify(data)[8]) errfields.push("Secure Connection");
        if (+JSON.stringify(data)[9]) errfields.push("Authentication");
        if (+JSON.stringify(data)[10]) errfields.push("Avo Assure Application URL");
        if (+JSON.stringify(data)[11]) errfields.push("Proxy URL");
        if (+JSON.stringify(data)[12] === 1) errfields.push("Proxy Username");
        else if (+JSON.stringify(data)[12] === 2) errfields.push("Proxy Password");
        else if (+JSON.stringify(data)[12] === 3) errfields.push("Proxy Credentials");
        displayError({ CONTENT: emsg + " Following values are invalid: " + errfields.join(", "), VARIANT: VARIANT.WARNING });
    } else {
        displayError({ CONTENT: "Failed to " + action + " configuration", VARIANT: VARIANT.ERROR });
    }
}

const clickToggle = async (servername, action, setLoading, displayError, onSelectProvider) => {
    const emsg = "Failed to " + action + " '" + servername + "' Configuration.";
    var conf = {
        channel: 'email',
        provider: 'smtp',
        name: servername
    }
    setLoading(action.slice(0, -1) + "ing Configuration...")
    var data = await manageNotificationChannels({ action: action.toLowerCase(), conf })
    if (data.error) { displayError(data.error); return; }
    if (data === "success") {
        displayError({ CONTENT: "'" + conf.name + "' Configuration " + action + "d!", VARIANT: VARIANT.SUCCESS });
        onSelectProvider()
        return;
    } else if (/^1[0-4]{9}$/.test(data)) {
        if (parseInt(data[1])) {
            displayError({ CONTENT: emsg + " Invalid Request!", VARIANT: VARIANT.ERROR });
            return;
        }
        const errfields = [];
        if (parseInt(data[2])) errfields.push("Server Name");
        if (parseInt(data[3])) errfields.push("Channel");
        displayError({ CONTENT: emsg + " Following values are invalid: " + errfields.join(", "), VARIANT: VARIANT.WARNING });
    } else {
        displayError({ CONTENT: "Failed to " + action + " configuration", VARIANT: VARIANT.ERROR });
    }
}

const selectProvider = async ({ inputRef, showPool, showAuth, showAll, showProxCred, showProxUrl, displayError, setLoading }) => {
    var arg = { "action": "provider", "channel": "email", "args": "smtp" }
    try {
        setLoading('Loading ...');
        var data = await getNotificationChannels(arg);
        if (data.error) { displayError(data.error); return; }
        if (data === 'empty') {
            inputRef.toggleUppdate.current.disabled = false;
            setLoading(false);
            return;
        }
        inputRef.toggleUppdate.current.innerText = 'Update'
        inputRef.servername.current.value = data.name
        if (data.name) inputRef.servername.current.readOnly = true
        inputRef.smtpHost.current.value = data.smtpHost ? data.smtpHost : data.host
        inputRef.smtpPort.current.value =  data.smtpPort ? data.smtpPort : data.port
        inputRef.serverstatus.current.innerText = data.active ? 'Active' : 'InActive'
        inputRef.serverstatus.current.style.color = data.active ? 'green' : 'red'
        inputRef.toggleStatus.current.innerText = data.active ? "Disable" : "Enable"
        inputRef.secureconnect[data.tls.security].current.checked = true
        inputRef.tlcerror[data.tls.insecure.toString()].current.checked = true
        const authType = (data.auth && data.auth.type) || data.auth;
        if (authType === "basic") {
            inputRef.selectauth.current.value = data.auth.type;
            inputRef.authname.current.value = data.auth.username
            inputRef.authpassword.current.value = data.auth.password
        }
        else {
            inputRef.selectauth.current.value = 'none';
            showAuth()
        }
        inputRef.sendername.current.value = data.sender.name
        inputRef.senderaddr.current.value = data.sender.email
        inputRef.assureurl.current.value = data.appurl

        if (!data.timeouts) data.timeouts = {};
        inputRef.grettimeout.current.value = data.timeouts.greeting
        inputRef.socktimeout.current.value = data.timeouts.socket
        inputRef.conctimeout.current.value = data.timeouts.connection

        if (!data.pool) data.pool = {};
        inputRef.checkboxpool.current.checked = data.pool.enable || false;
        inputRef.maxconnection.current.value = data.pool.maxconnections || "";
        inputRef.maxmessages.current.value = data.pool.maxmessages || "";
        showPool();

        if (!data.proxy) data.proxy = {};
        inputRef.checkproxyurl.current.value = data.proxy.enable || false;
        inputRef.proxyurl.current.value = data.proxy.url || "";
        showProxUrl();

        inputRef.checkproxycred.current.value = data.proxy.auth || false;
        inputRef.proxyuser.current.value = data.proxy.user || "";
        inputRef.proxypass.current.value = data.proxy.pass || "";
        showProxCred();
        inputRef.toggleUppdate.current.disabled = false
        inputRef.toggleStatus.current.disabled = false
        inputRef.toggleTest.current.disabled = false
        setLoading(false);
    } catch (err) {
        console.error(err)
        displayError(MSG.ADMIN.ERR_PROVIDER_DETAILS)
    }
}
const factoryFn = (inputRef) => {
    const showAuth = () => {
        if (inputRef.authname.current && inputRef.selectauth.current) {
            inputRef.authname.current.disabled = (inputRef.selectauth.current.value === 'none' || inputRef.selectauth.current.value === "def-opt");
            inputRef.authpassword.current.disabled = (inputRef.selectauth.current.value === 'none' || inputRef.selectauth.current.value === "def-opt");
        }
    };

    const showProxCred = () => {
        if (inputRef.proxyuser.current && inputRef.checkproxycred.current) {
            inputRef.proxyuser.current.disabled = !inputRef.checkproxycred.current.checked;
            inputRef.proxypass.current.disabled = !inputRef.checkproxycred.current.checked;
        }
    };

    const showProxUrl = () => {
        if (inputRef.checkproxyurl.current) {
            if (!inputRef.checkproxyurl.current.checked) {
                if (inputRef.checkproxycred.current) {
                    inputRef.checkproxycred.current.disabled = true;
                }
                if (inputRef.proxyuser.current) {
                    inputRef.proxyuser.current.disabled = true;
                }
                if (inputRef.proxypass.current) {
                    inputRef.proxypass.current.disabled = true;
                }
            } else {
                if (inputRef.checkproxycred.current) {
                    inputRef.checkproxycred.current.disabled = false;
                }
                showProxCred();
            }
            if (inputRef.proxyurl.current) {
                inputRef.proxyurl.current.disabled = !inputRef.checkproxyurl.current.checked;
            }
        }
    };

    const showPool = () => {
        if (inputRef.maxconnection.current && inputRef.checkboxpool.current) {
            inputRef.maxconnection.current.disabled = !inputRef.checkboxpool.current.checked;
        }
        if (inputRef.maxmessages.current && inputRef.checkboxpool.current) {
            inputRef.maxmessages.current.disabled = !inputRef.checkboxpool.current.checked;
        }
    };

    const showAll = () => {
        showAuth();
        showPool();
        showProxUrl();
        showProxCred();
    }
    return { showPool, showAuth, showProxCred, showProxUrl, showAll }
}
const getConfObj = (inputRef) => {
    return {
        channel: 'email',
        provider: 'smtp',
        name: inputRef.servername.current.value,
        smtpHost: inputRef.smtpHost.current.value,
        smtpPort: inputRef.smtpPort.current.value,
        auth: {
            type:inputRef.selectauth.current.value,
            username:inputRef.authname.current.value,
            password:inputRef.authpassword.current.value
        },
        sender: {
            name:inputRef.sendername.current.value,
            email:inputRef.senderaddr.current.value
        },
        appurl: inputRef.assureurl.current.value,
        pool: {
            enable: inputRef.checkboxpool.current.checked,
            maxconnections: inputRef.maxconnection.current.value,
            maxmessages: inputRef.maxmessages.current.value
        },
        proxy: {
            enable: inputRef.checkproxyurl.current.checked,
            url: inputRef.proxyurl.current.value,
            auth: inputRef.checkproxycred.current.checked,
            user: inputRef.proxyuser.current.value,
            pass: inputRef.proxypass.current.value
        },
        timeouts: {
            greeting: inputRef.grettimeout.current.value,
            socket: inputRef.socktimeout.current.value,
            connection: inputRef.conctimeout.current.value
        },
        enabletls: (()=>{
            var key;
            Object.keys(inputRef.secureconnect).some(e=>{
                if(inputRef.secureconnect[e].current.checked)key = e
                return inputRef.secureconnect[e].current.checked
            })
            return key
        })(),
        insecuretls: (()=>{
            var key;
            Object.keys(inputRef.tlcerror).some(e=>{
                if(inputRef.tlcerror[e].current.checked)key = e
                return inputRef.tlcerror[e].current.checked
            })
            return key
        })(),
    };
};

const validate = (inputRef, displayError) => {
    var flag = true;
    var popped = false;
    const errBorder = '1px solid red';
    const regExName = /^[A-Za-z0-9]+([A-Za-z0-9-]*[A-Za-z0-9]+|[A-Za-z0-9]*)$/;
    const regExURL = /^http[s]?:\/\/[A-Za-z0-9._-].*$/i;
    // eslint-disable-next-line
    const emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    var arr = ['selectprovider', 'selectauth', 'smtpHost', 'servername', 'smtpPort', 'sendername', 'senderaddr', 'assureurl']
    if (inputRef.checkproxyurl.current.value === 'true') {
        arr.push('proxyurl')
        if (inputRef.checkproxycred.current.value === 'true') arr.push('proxyuser', 'proxypass')
    }
    arr.forEach((e) => {
        if(inputRef[e].current !== null){
        inputRef[e].current.style.outline = ''
        if (inputRef[e].current.value === "") {
            inputRef[e].current.style.outline = errBorder
            flag = false;
        } else if (e === 'servername' && !regExName.test(inputRef[e].current.value)) {
            inputRef[e].current.style.outline = errBorder
            if (!popped) displayError(MSG.ADMIN.WARN_INVALID_SERVER_NAME);
            flag = false;
            popped = true;
        } else if (e === 'smtpPort' && !((+inputRef[e].current.value >= 0) && (+inputRef[e].current.value < 65536))) {
            inputRef[e].current.style.outline = errBorder
            if (!popped) displayError(MSG.ADMIN.WARN_SERVER_PORT);
            flag = false;
            popped = true;
        } else if (e === 'senderaddr' && !emailRegEx.test(inputRef[e].current.value)) {
            inputRef[e].current.style.outline = errBorder
            if (!popped) displayError(MSG.ADMIN.WARN_EMAIL_ADDRESS);
            flag = false;
            popped = true;
        } else if ((e === 'assureurl' || e === 'proxyurl') && !regExURL.test(inputRef[e].current.value)) {
            inputRef[e].current.style.outline = errBorder
            if (!popped) displayError({ CONTENT: "Invalid " + (e === 'assureurl' ? "Avo Assure Application" : "Proxy Server") + " URL provided!", VARIANT: VARIANT.WARNING });
            flag = false;
            popped = true;
        }
    }})
    if (!flag && !popped) displayError(MSG.ADMIN.ERR_FORM);
    return flag;
};
export default EmailConfiguration;