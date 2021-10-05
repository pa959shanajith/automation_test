import React, { useState, useEffect , createRef } from 'react';
import {ScreenOverlay, ScrollBar, setMsg, Messages as MSG, VARIANT} from '../../global' 
import {FormInput,FormRadio,FormSelect} from '../components/FormComp'
import {getNotificationChannels,manageNotificationChannels} from '../api'
import EmailTest from '../components/EmailTest';
import '../styles/EmailConfig.scss'


/*Component EmailConfig
  use: defines Email server config middle Section
*/

const EmailConfig = ({resetMiddleScreen}) => {
    const [advanceConf,setAdvanceConf] = useState('block');
    const [emailTest,setEmailTest] = useState(false);
    const [loading,setLoading] = useState(false);
    const [inputRef,setinputRef] =  useState({})
    const [reload,setReload] = useState(false)
    const fn = factoryFn(inputRef)
    const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
    }
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
    return(
        <div className="conf_email_container">
            {loading?<ScreenOverlay content={loading}/>:null}
            <div id="page-taskName">
                <span>Manage Email Server Configuration</span>
		    </div>
            <div className="adminActionBtn">
                <button ref={inputRef["toggleStatus"]} className="a__btn btn-edit" onClick={onClickToggle} title="Disable">Disable</button>
                <button ref={inputRef["toggleUppdate"]} className="a__btn btn-edit" onClick={onClickUpdate}  title="Update">Create</button>
                <button ref={inputRef["toggleTest"]} className="a__btn " onClick={onClickTest}  title="Test">Test</button>
            </div>
            <div id='conf_email' className='conf_email'>
            <ScrollBar scrollId='conf_email' trackColor={'transperent'} thumbColor={'grey'}> 
                <FormSelect inpRef={inputRef['selectprovider']} onChangeFn={onSelectProvider} defValue={"Select Provider"} label={"Provider"} option={['SMTP']}/>
                <FormInput inpRef={inputRef['servername']} label={'Server Name'} placeholder={'Server Name'} validExp={"emailServerName"}/>
                <div className='col-xs-9 form-group input-label'>
                    <label>Status</label>
                    <span ref={inputRef['serverstatus']} style={{marginLeft:'20px'}} className={'left-opt'}>-</span>
                </div>
                <FormInput inpRef={inputRef['host']} label={'Host'} placeholder={'Server Host IP/Domain name'}/>
                <FormInput inpRef={inputRef['port']} label={'Port'} placeholder={'Server Port'}/>
                <FormSelect inpRef={inputRef['selectauth']} onChangeFn={fn.showAuth} defValue={"Select Authentication type"} label={"Authentication"} option={['none','basic']}/>
                <FormInput inpRef={inputRef['authname']} label={'Authentication Username'} placeholder={'Authentication Username'}/>
                <FormInput inpRef={inputRef['authpassword']} label={'Authentication Password'} placeholder={'Authentication Password'}/>
                <FormInput inpRef={inputRef['sendername']} label={'Sender Name'} placeholder={'Avo Assure Alerts'}/>
                <FormInput inpRef={inputRef['senderaddr']} label={'Sender Address'} placeholder={'avoassure-alerts@avoautomation.com'}/>
                <FormRadio inpRef={inputRef["secureconnect"]} label={'Secure Connection'} option={["Auto","Enable","Disable"]}/>
                <FormRadio inpRef={inputRef["tlcerror"]} label={'Ignore TLS Errors'} option={["Yes","No"]}/>
                <FormInput inpRef={inputRef['assureurl']} label={'Avo Assure URL'} placeholder={'Avo Assure Application URL'}/>
                <div className='col-xs-9 form-group input-label'>
                    <span onClick={()=>setAdvanceConf(advanceConf==='block'?'none':'block')} className='conf-title'>Advanced Configuration</span>
                </div>
                <div style={{display:advanceConf}}>
                <FormInput inpRef={inputRef['conctimeout']} type={'number'} label={'Connection Timeout'} placeholder={'Connection Timeout (in milliseconds)'}/>
                <FormInput inpRef={inputRef['grettimeout']} type={'number'} label={'Greeting Timeout'} placeholder={'Greeting Timeout (in milliseconds)'}/>
                <FormInput inpRef={inputRef['socktimeout']} type={'number'} label={'Socket Timeout'} placeholder={'Socket Timeout (in milliseconds)'}/>
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
            </ScrollBar>
            </div>
            {emailTest?<EmailTest setEmailTest={setEmailTest} confObj={emailTest}/>:null}
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

export default EmailConfig;