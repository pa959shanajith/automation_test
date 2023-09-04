import React, { Fragment, useState ,useEffect,createRef} from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import '../styles/EmailConfiguration.scss';
import { RadioButton } from 'primereact/radiobutton';
import { InputNumber } from 'primereact/inputnumber';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { Checkbox } from "primereact/checkbox";
import {getNotificationChannels,manageNotificationChannels} from '../api'
import { ScreenOverlay,setMsg, Messages as MSG, VARIANT} from '../../global' 



const EmailConfiguration = ({resetMiddleScreen}) => {
    const [value3, setValue3] = useState('');
    const [checked, setChecked] = useState(false);
    const [loading,setLoading] = useState(false);
    const [inputRef,setinputRef] =  useState({})
    const [reload,setReload] = useState(false)
    const fn = factoryFn(inputRef)
    const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
    }
    const [selectedProvider, setSelectedProvider] = useState(''); 
    const [emailTest,setEmailTest] = useState(false);
    useEffect(()=>{
        //on reset dismount component to show loading screen
        setinputRef({})
        setReload(true)
    },[resetMiddleScreen])
    useEffect(()=>{
        //on reload mount component back
        if(reload){
            const Ref = {"toggleStatus":createRef(),"toggleUppdate":createRef(),"toggleTest":createRef(''),"servername": createRef(),"serverstatus":createRef(),"host":createRef(),"port":createRef(),"authname":createRef(),
            "authpassword":createRef(),"sendername":createRef(),"senderaddr":createRef(),"assureurl":createRef(),
            "conctimeout":createRef(),"grettimeout":createRef(),"socktimeout":createRef(),"maxconnection":createRef(),"maxmessages":createRef(),
            "proxyurl":createRef(),"proxyuser":createRef(),"proxypass":createRef(),"selectauth":createRef(),"selectprovider":createRef(),
            "secureconnect":{"auto":createRef(),"enable":createRef(),"disable":createRef()},
            "tlcerror":{"true":createRef(),"false":createRef()},"checkproxyurl":createRef(),"checkboxpool":createRef(),"checkproxycred":createRef()}
            setinputRef(Ref)
            setReload(false)
        }
    },[reload])
    useEffect(()=>{
        //disable buttons on default screen
        if(Object.keys(inputRef).length>0){
            inputRef.toggleUppdate.current.disabled = true
            inputRef.toggleStatus.current.disabled = true
            inputRef.toggleTest.current.disabled = true
            fn.showAll();
        }
        // eslint-disable-next-line
    },[inputRef])

    const onSelectProvider = () => {
        selectProvider({inputRef,...fn,displayError,setLoading});
        // setSelectedProvider(selectedValue);
    }
    const onClickTest = () => {
        if (!validate(inputRef,displayError)) return;
        var val = getConfObj(inputRef)
        setEmailTest(val)
    }
    const onClickToggle = () => {
        clickToggle(inputRef.servername.current.value,inputRef.toggleStatus.current.innerText,setLoading,displayError,onSelectProvider)   
    }
    const onClickUpdate = () => {
        if (!validate(inputRef,displayError)) return;
        var val = getConfObj(inputRef)
        update(val,inputRef.toggleUppdate.current.innerText,setLoading,displayError,onSelectProvider)
    }
    if(Object.keys(inputRef).length<1){
        //keep screen loading till inputRef is set
        return (
            <ScreenOverlay content={'Loading...'}/>
        )
    }
   

    return (
        <div>
            <div className='full_page'>
                <>
                    <div>
                        <label required className='provider'> select provider</label>
                    </div>
                    <Dropdown inputRef={inputRef['selectprovider']} className='providerdropdown' value={selectedProvider}  option={['SMTP']} onChange={onSelectProvider}  placeholder="Select Provider"  id="selectprovider" />
                    <div className='email_setting_header'>
                        Email Server Settings
                    </div>
                    <div>
                        <label className='hostname' >Host name</label>
                        <label className='servername'  validExp={"emailServerName"}>Server Name</label>
                        <div>
                            <InputText  inputRef={inputRef['host']} placeholder="Enter Server Host ID/Domain Name" className='host_name'></InputText>
                            <InputText placeholder="Enter Server Name" className="server_name" inpRef={inputRef['servername']}></InputText>
                        </div>
                        <div>
                            <lable className="portname">Port Number </lable>
                        </div>
                        <div>
                            <InputText placeholder="Enter Port No" className="port_no" inpRef={inputRef['port']} label={'Port'}></InputText>
                        </div>
                        <div>
                            <label className='Auth_info'>Authentication Information</label>
                        </div>
                        <div>
                            <lable className="Authname">Authentication Type</lable>
                        </div>
                        <div>
                            <Dropdown inpRef={inputRef['selectauth']} className='Auth_dropdown' placeholder="Select Authentication Type" option={['none','basic']} />
                        </div>
                        <div>
                            <label className='AuthUsername'>Authentication UserName</label>
                            <label className='AuthPassword'>Authentication Password</label>
                        </div>
                        <div>
                            <InputText inpRef={inputRef['authname']} placeholder="Enter Authentication UserName" className='Auth_Username'></InputText>
                            <InputText inpRef={inputRef['authpassword']} placeholder="Enter Authentication PassWord" className="Auth_Password"></InputText>
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
                    <Button className="disabelbtn" size="small" onClick={onClickToggle}>Disable</Button>
                    <Button className="testbtn" size="small"onClick={onClickTest} >Test</Button>
                    <Button className="savebtn" size="small" onClick={onClickUpdate} >Save</Button>
                </div>
            <div>
               
            </div>

        </div>

    )

}
const update = async(conf,action,setLoading,displayError,onSelectProvider) =>{
    var emsg = "Failed to "+action+" '"+conf.name+"' Configuration.";
    setLoading(action.slice(0,-1) + "ing Configuration...")
    var data = await manageNotificationChannels({'action':action.toLowerCase(), conf})
    if(data.error){displayError(data.error);return;}
    else if (data === "exists") {
        displayError({CONTENT:"'"+conf.name+"' configuration already exists",VARIANT:VARIANT.WARNING});
        return;
    }
    else if (data === "success") {
        displayError({CONTENT:"'"+conf.name+"' Configuration "+action+"d!",VARIANT:VARIANT.SUCCESS});
        onSelectProvider()
        return;
    } else if(/^1[0-4]{12}$/.test(data)) {
        if (+data[1]) {
            displayError({CONTENT:emsg+" Invalid Request!",VARIANT:VARIANT.WARNING});
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
        displayError({CONTENT:emsg+" Following values are invalid: "+errfields.join(", "),VARIANT:VARIANT.WARNING});
    } else{
        displayError({CONTENT:"Failed to "+ action +" configuration",VARIANT:VARIANT.ERROR});
    }
}

const clickToggle = async(servername,action,setLoading,displayError,onSelectProvider) =>{
    const emsg = "Failed to "+action+" '"+servername+"' Configuration.";
    var conf = {
        channel: 'email',
        provider: 'smtp',
        name: servername
    }
    setLoading(action.slice(0,-1) + "ing Configuration...")
    var data = await manageNotificationChannels({action : action.toLowerCase(), conf})
    if(data.error){displayError(data.error);return;}
    if (data === "success") {
        displayError({CONTENT:"'"+conf.name+"' Configuration "+action+"d!",VARIANT:VARIANT.SUCCESS});
        onSelectProvider()
        return;
    } else if(/^1[0-4]{9}$/.test(data)) {
        if (parseInt(data[1])) {
            displayError({CONTENT:emsg+" Invalid Request!",VARIANT:VARIANT.ERROR});
            return;
        }
        const errfields = [];
        if (parseInt(data[2])) errfields.push("Server Name");
        if (parseInt(data[3])) errfields.push("Channel");
        displayError({CONTENT:emsg+" Following values are invalid: "+errfields.join(", "),VARIANT:VARIANT.WARNING});
    } else{
        displayError({CONTENT:"Failed to "+ action +" configuration",VARIANT:VARIANT.ERROR});
    }
}

const selectProvider = async({inputRef,showPool,showAuth,showAll,showProxCred,showProxUrl,displayError,setLoading}) =>{
    var arg = {"action":"provider","channel":"email","args":"smtp"}
    try{
        setLoading('Loading ...');
        var data = await getNotificationChannels(arg);
        if(data.error){displayError(data.error);return;}
        if(data === 'empty'){
            inputRef.toggleUppdate.current.disabled=false;
            setLoading(false);
            return;
        }
        inputRef.toggleUppdate.current.innerText = 'Update'
        inputRef.servername.current.value = data.name
        if(data.name)inputRef.servername.current.readOnly = true
        inputRef.host.current.value = data.host
        inputRef.port.current.value = data.port
        inputRef.serverstatus.current.innerText = data.active?'Active':'InActive'
        inputRef.serverstatus.current.style.color = data.active?'green':'red'
        inputRef.toggleStatus.current.innerText = data.active?"Disable":"Enable"
        inputRef.secureconnect[data.tls.security].current.checked= true 
        inputRef.tlcerror[data.tls.insecure.toString()].current.checked = true
        const authType = (data.auth && data.auth.type) || data.auth;
        if (authType === "basic"){
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
    }catch(err){
        console.error(err)
        displayError(MSG.ADMIN.ERR_PROVIDER_DETAILS)
    }
}
const factoryFn = (inputRef) =>{
    const showAuth = () => {
        inputRef.authname.current.disabled = (inputRef.selectauth.current.value === 'none' || inputRef.selectauth.current.value === "def-opt")
        inputRef.authpassword.current.disabled = (inputRef.selectauth.current.value === 'none' || inputRef.selectauth.current.value === "def-opt")
    }
    const showProxCred = () =>{
        inputRef.proxyuser.current.disabled = !inputRef.checkproxycred.current.checked
        inputRef.proxypass.current.disabled = !inputRef.checkproxycred.current.checked
    }
    const showProxUrl = () =>{
        if(!inputRef.checkproxyurl.current.checked){
            inputRef.checkproxycred.current.disabled = true
            inputRef.proxyuser.current.disabled = true
            inputRef.proxypass.current.disabled = true

        }else{
            inputRef.checkproxycred.current.disabled = false
            showProxCred()
        }
        inputRef.proxyurl.current.disabled = !inputRef.checkproxyurl.current.checked
    }
    const showPool = () =>{
        inputRef.maxconnection.current.disabled =!inputRef.checkboxpool.current.checked 
        inputRef.maxmessages.current.disabled = !inputRef.checkboxpool.current.checked 
    }
    const showAll = () => {
        showAuth();
        showPool();
        showProxUrl();
        showProxCred();
    }
    return {showPool,showAuth,showProxCred,showProxUrl,showAll}
}
const getConfObj = (inputRef) => {
    return {
        channel: 'email',
        provider: 'smtp',
        name: inputRef.servername.current.value,
        host: inputRef.host.current.value,
        port: inputRef.port.current.value,
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

const validate = (inputRef,displayError)=> {
    var flag = true;
    var popped = false;
    const errBorder = '1px solid red';
    const regExName = /^[A-Za-z0-9]+([A-Za-z0-9-]*[A-Za-z0-9]+|[A-Za-z0-9]*)$/;
    const regExURL = /^http[s]?:\/\/[A-Za-z0-9._-].*$/i;
    // eslint-disable-next-line
    const emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    var arr = ['selectprovider','selectauth','host','servername','port','sendername','senderaddr','assureurl']
    if(inputRef.checkproxyurl.current.value === 'true'){
        arr.push('proxyurl')
        if(inputRef.checkproxycred.current.value === 'true')arr.push('proxyuser','proxypass')
    }
    arr.forEach((e)=>{
        inputRef[e].current.style.outline = ''
        if(inputRef[e].current.value === ""){
            inputRef[e].current.style.outline = errBorder
            flag = false;
        }else if(e === 'servername' && !regExName.test(inputRef[e].current.value)){
            inputRef[e].current.style.outline = errBorder
            if (!popped) displayError(MSG.ADMIN.WARN_INVALID_SERVER_NAME);
            flag = false;
            popped = true;
        }else if(e === 'port' && !((+inputRef[e].current.value  >= 0) && (+inputRef[e].current.value  < 65536))){
            inputRef[e].current.style.outline = errBorder
            if (!popped) displayError(MSG.ADMIN.WARN_SERVER_PORT);
            flag = false;
            popped = true;
        }else if(e === 'senderaddr' && !emailRegEx.test(inputRef[e].current.value)){
            inputRef[e].current.style.outline = errBorder
            if (!popped) displayError(MSG.ADMIN.WARN_EMAIL_ADDRESS);
            flag = false;
            popped = true;
        }else if((e === 'assureurl'||e === 'proxyurl') && !regExURL.test(inputRef[e].current.value)){
            inputRef[e].current.style.outline = errBorder
            if (!popped) displayError({CONTENT:"Invalid "+(e === 'assureurl'?"Avo Assure Application":"Proxy Server")+" URL provided!",VARIANT:VARIANT.WARNING});
            flag = false;
            popped = true;
        }
    })
    if (!flag && !popped) displayError(MSG.ADMIN.ERR_FORM);
    return flag;
};
export default EmailConfiguration;