import React, { useEffect, useRef, useState } from "react";
import "../styles/WelcomeWizard.scss";
import axios from "axios";
import {ProgressIndicator , AnimationClassNames} from "@fluentui/react";
import { Stepper } from 'react-form-stepper';
import { Messages as MSG, setMsg, RedirectPage, BrowserFp } from '../../global';
import { ScrollBar } from '../../global';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../state/action';
import "../styles/TermsAndConditions.scss";
import * as api from '../api';
import { useHistory } from 'react-router-dom';
import { manageUserDetails } from '../../admin/api';
import { IconButton } from "@avo/designcomponents"


const WelcomeWizard = ({showWizard, setPopover}) => {
  const [percentComplete,setPercentComplete] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [showIndicator, setShowIndicator] = useState(false);
  const [showMacOSSelection, setShowMacOSSelection] = useState(false);
  const [showLinuxOSSelection, setShowLinuxOSSelection] = useState(false);
  const [selectedMacOS, setSelectedMacOS] = useState("");
  const [downloadPopover, setDownloadPop] = useState("");
  const userInfo = useSelector(state=>state.login.userinfo);
  const [docLink,setDocLink] = useState("#");
  const [vidLink,setVidLink] = useState("#");
  const [config, setConfig] = useState({});
  const [OS,setOS] = useState("Windows");
  const [downloadScreenCounter,setdownloadScreenCounter] = useState(0);
  const [animationDir, setAnimationDir] = useState(false);
  const [cardListNo, setCardListNo] = useState(0);
  const [tncAcceptEnabled, setTncAcceptEnabled] = useState(false);
  const animationInterval = useRef(undefined);
  const TnCInnerRef = useRef(undefined);
  const history = useHistory();
  const dispatch = useDispatch();
  const [showImage , setShowImage] = useState("")
   const enlargeImage = (imageName) => {
    setShowImage(imageName)
       
  };

  // getting the browser name using userAgent
  const userAgent = window.navigator.userAgent.toLowerCase();
  const browser =
    userAgent.indexOf('edge') > -1 ? 'edge'
      : userAgent.indexOf('edg') > -1 ? 'edge'
      : userAgent.indexOf('opr') > -1 && !!window.opr ? 'edge'
      : userAgent.indexOf('chrome') > -1 && !!window.chrome ? 'chrome'
      : userAgent.indexOf('trident') > -1 ? 'edge'
      : userAgent.indexOf('firefox') > -1 ? 'edge'
      : userAgent.indexOf('safari') > -1 ? 'edge'
      : 'other';

  useEffect(()=>{
    getOS();
    if(activeStep===0){
      let observer = new IntersectionObserver(function(entries) {
        if(entries[0].isIntersecting === true)
            setTncAcceptEnabled(true)
      }, { threshold: [1], root: document.querySelector('#tnc_content')});
      observer.observe(document.querySelector("#lastStepTnC"));
    }
    (async()=>{
        const response = await fetch("/getClientConfig")
        let {avoClientConfig, trainingLinks} = await response.json();
        setConfig(avoClientConfig)
        setDocLink(trainingLinks.documentation)
        setVidLink(trainingLinks.videos)
        setActiveStep(userInfo.welcomeStepNo)
    })();
  },[])

  useEffect(()=>{
    if(activeStep===1)
        animationInterval.current = setInterval(()=>{
            setdownloadScreenCounter((prevCount)=>{
                if (prevCount===2){
                    return prevCount-2;
                }
                return prevCount+1
            })
        },1000)

    return ()=>{
        if(animationInterval.current){
            clearInterval(animationInterval.current)
        }
    }
  },[activeStep])

  useEffect(()=>{
    if (percentComplete === 1) {
        updateStepNumber(1);
        showDownloadPopover();
    }
  },[percentComplete]);

  // updating step no. in db and redux
  const updateStepNumber = async(n) => {
    let stepNo = activeStep + n;

    if(stepNo===3)
        setAnimationDir(true);

    setActiveStep((currPage) => currPage + n);
    const userObj = {
        userid:userInfo['user_id'],
        username:userInfo['username'],
        welcomeStepNo:stepNo
    }
    try{
        dispatch({type:actionTypes.SET_USERINFO, payload: {...userInfo,welcomeStepNo:stepNo}});
        var data = await manageUserDetails("stepUpdate", userObj);
    } catch(err) {
        console.log(err)
    }
  }

  const showDownloadPopover = () => {
      if (browser==="edge") {
          setDownloadPop("edge")
      }
      else {
          setDownloadPop("chrome")
      }
      setTimeout(()=>{setDownloadPop("")},10000)
  }

  // action that accepts the EULA
  const tcAction = (action) => {
    let fullName = userInfo["firstname"] + " " + userInfo["lastname"];
    let email = userInfo["email_id"];
    let timeStamp = new Date().toLocaleString();
    let bfp = BrowserFp()
    let userData = {
        'fullname': fullName,
        'emailaddress': email,
        'acceptance': action,
        'timestamp': timeStamp,
        'browserfp': bfp
    };
    api.storeUserDetails(userData)
    .then(data => {
        if(data === "Invalid Session") {
            showWizard(false);
            RedirectPage(history);
        } else if (data !== "success") {
            setMsg({"CONTENT":"Failed to record user preference. Please Try again!", "VARIANT":"error"});
            // showWizard(false);
            RedirectPage(history, { reason: "userPrefHandle" });
        }
        else {
            dispatch({type:actionTypes.SET_USERINFO, payload: {...userInfo,tandc:false}});
            setPopover(true);
            setActiveStep((prevStep)=>prevStep+1);
            setTimeout(()=>{showWizard(false)},1000);
        }
    })
    .catch(error => {
        setMsg({"CONTENT":"Failed to record user preference. Please Try again!", "VARIANT":"error"});
        showWizard(false);
        console.error("Error updating user tnc preference", error);
    }); 
  }

  // getting OS version using userAgent
  const getOS = () => {
    let userAgent = navigator.userAgent.toLowerCase();
    if (/windows nt/.test(userAgent))
        setOS("Windows");

    else if (/mac os x/.test(userAgent)){
        setShowMacOSSelection(true)
        setOS("MacOS");
    }
    else if (navigator.userAgent.indexOf("Linux") != -1) 
    {
        setShowLinuxOSSelection(true)
        setOS("Linux");
    }
    else 
        setOS("Not Supported");
  }
  
  // check and start downloading ICE package
  const getIce = async (clientVer) => {
    try {
        const res = await fetch("/downloadICE?ver="+clientVer);
        const {status} = await res.json();
        if (status === "available"){
            setShowMacOSSelection(false);
            setShowIndicator(true);
            // const link = document.createElement('a');
            // link.href = "/downloadURL?link="+window.location.origin.split("//")[1];
            // link.setAttribute('download', "avoURL.txt");
            // document.body.appendChild(link);
            // link.click();
            // document.body.removeChild(link);
            axios({
                url: window.location.origin+"/downloadICE?ver="+clientVer+"&file=getICE",
                method: "GET",
                responseType: "blob", 
                onDownloadProgress(progress) {
                    setPercentComplete(progress.loaded/progress.total)
                }
            }).then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', "AvoAssureClient"+(userInfo.isTrial?("_"+window.location.origin.split("//")[1].split(".avoassure")[0]):"")+"."+config[clientVer].split(".").pop());
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }).catch((err)=>{
                console.log(err);
                setShowIndicator(false);
            });
        }
        else setMsg(MSG.GLOBAL.ERR_PACKAGE);
    } catch (ex) {
        console.error("Error while downloading ICE package. Error:", ex);
        setMsg(MSG.GLOBAL.ERR_PACKAGE);
    }
  };

  
  // send correct filename to getICE and start downloading Client
  const _handleClientDownload = (pkgName=undefined) =>{
    if(showMacOSSelection){
        // if (selectedMacOS==="") {
        //     setMsg({"CONTENT":"Please select a OS version", "VARIANT":"error"});
        // }
        // else{
        setSelectedMacOS(pkgName)
        getIce("avoclientpath_"+pkgName)
        // }
    }
    else if(showLinuxOSSelection)
    {
        getIce("avoclientpath_Linux")
    }
    else if (OS==="Windows")
        getIce("avoclientpath_Windows")

    else
        setMsg(MSG.GLOBAL.ERR_PACKAGE);
  }

  // const onScrollTnC = (e) => {
  // //   if (TnCInnerRef.current) {
  // //     // const { scrollTop, scrollHeight, clientHeight } = TnCInnerRef.current;
  // //     // if (Math.abs(scrollHeight - (scrollTop + clientHeight) <= 1)) {
          
  // //     // }
  // //   }
  // }

  const GetImageModal = ({imageName}) =>{ 
    document.getElementsByClassName("form-container")[0].style.visibility="hidden";
    document.getElementsByClassName("stepper")[0].style.visibility="hidden";
    return (
        <div>
            <img src={`static/imgs/${imageName}.svg`} className="enlargeImage"/>
            <img src={`static/imgs/close-btn.svg`} className="close-btn" onClick={()=>
                {setShowImage("");
                document.getElementsByClassName("form-container")[0].style.visibility="visible";
                document.getElementsByClassName("stepper")[0].style.visibility="visible";}} />
        </div>
    )
}

  const DPCard = ({title, items, type}) => {
    return (<div className="d-p-card">
                <div className="d-p-card__title">{title}</div>
                <div className="d-p-card__itemsContainer">
                  {items.map((item,idx)=> (<>
                    <div key={title+idx} className="d-p-card__item">
                      <div className="d-p-card__I-title">{type!=="OR" ? idx+1+". " : ""} {item.title}</div>
                      {/* <div className="d-p-card__image" style={{backgroundImage:`url(static/imgs/${item.imageName}.svg)`}}></div> */}
                      <div style={{display:"flex", height:"inherit"}}><img src={`static/imgs/${item.imageName}.svg`} className="d-p-card__image" onClick={()=>enlargeImage(item.imageName)}/></div>
                    </div>
                    {idx !== items.length-1 ? <div key={title+idx+"sep"} className="d-p-card__separator">{type==="OR"?"OR  ": <div className="d-p-card__div__image" style={{backgroundImage:`url(static/imgs/WW_r_arrow.svg)`}}></div>}</div>:null}
                  </>))}
                </div>
            </div>)
}

  const getTermsAndConditions = () => {
      return (
            <div id="tnc_content" ref={TnCInnerRef}>
                <h4 className="tnc_header">SOFTWARE {userInfo.isTrial?"TRIAL":""} LICENSE AGREEMENT</h4>
                <p className="tnc_bold">THIS SOFTWARE {userInfo.isTrial?"TRIAL":""} LICENSE AGREEMENT (“LICENSE AGREEMENT”) IS A LEGAL CONTRACT BETWEEN AVO AUTOMATION, A DIVISION OF SLK SOFTWARE PVT LTD (FORMERLY KNOWN AS SLK SOFTWARE SERVICES PVT LTD) (“LICENSOR”) AND YOU, EITHER AS AN INDIVIDUAL OR AN ENTITY (“LICENSEE”). IF THE LICENSEE IS ACCEPTING ON BEHALF OF AN ENTITY, THE LICENSEE REPRESENTS AND WARRANTS THAT THE LICENSEE HAS THE AUTHORITY TO BIND THAT ENTITY TO THIS AGREEMENT LICENSORIS WILLING TO AUTHORIZE LICENSEE’S USE OF THE SOFTWARE ASSOCIATED WITH THIS LICENSE AGREEMENT ONLY UPON THE CONDITION THAT LICENSEE ACCEPTS THIS LICENSE AGREEMENT WHICH GOVERNS LICENSEE’S USE OF THE SOFTWARE. BY DOWNLOADING, INSTALLING, OR ACCESSING AND USING THE SOFTWARE, LICENSEE INDICATES LICENSEE’S ACCEPTANCE OF THIS LICENSE AGREEMENT AND LICENSEE’S AGREEMENT TO COMPLY WITH THE TERMS AND CONDITIONS OF THIS LICENSE AGREEMENT.</p>
                <div>
                    <br/>
                    <h5><span className="tnc_num_idx">1.        </span> DEFINITIONS</h5>
                    <div>
                        <p><span className="tnc_num_idx">1.1.    </span> <b>Specific Words or Phrases.</b> For purposes of this License Agreement, each word or phrase listed below shall have the meaning designated. Other words or phrases used in this License Agreement may be defined in the context in which they are used and shall have the respective meaning there designated.</p>
                        <p>"<b>Affiliate</b>" means and includes any entity that directly or indirectly controls, is controlled by, or is under common control with Licensee, where "control" means the ownership of, or the power to vote, at least fifty percent (50%) of the voting stock, shares or interests of such entity. An entity that otherwise qualifies under this definition will be included within the meaning of "Affiliate" even though it qualifies after the execution of this Agreement.</p>
                        <p>"<b>License Agreement</b>" or "<b>Agreement</b>" means the terms of this Software {userInfo.isTrial?"Trial":""} License Agreement, together with the appendices and other exhibits attached hereto or incorporated herein by reference.</p>
                        <p>"<b>Authorized Users</b>" shall mean and include Licensee, its employees and contract employees of the Licensee who are working for the Licensee.</p>
                        <p>"<b>Intellectual Property Rights</b>" means all trade secrets, patents and patent applications, trademarks (whether registered or unregistered and including any goodwill acquired in such trade marks), service marks, trade names, business names, internet domain names, e-mail address names, copyrights (including rights in computer software), moral rights, database rights, design rights, rights in know-how, rights in confidential information, rights in inventions (whether patentable or not) and all other intellectual property and proprietary rights (whether registered or unregistered, and any application for the foregoing), and all other equivalent or similar rights which may subsist anywhere in the world.</p>
                        <p>"<b>License</b>" means a license to use the Software granted pursuant to the terms and conditions of this License Agreement.</p>
                        <p>"<b>Licensee</b>" means the person or entity that has entered into this License Agreement.</p>
                        <p>"<b>Licensor</b>" means Avo Automation, a division of SLK Software Pvt Ltd (formerly known as SLK Software Services Pvt Ltd).</p>
                        <p>"<b>Party</b>" means either the "Licensor" or "Licensee", individually as the context so requires; and "<b>Parties</b>" means the "Licensor" and "Licensee", collectively.</p>
                        <p>"<b>Personnel</b>" means and includes a Party’s or an Affiliate’s directors, officers, employees, agents, auditors, consultants, contract employees and subcontractors.</p>
                        <p>"<b>Software</b>" means the appropriate software product licenses made available to Licensee and its Authorized Users by Licensor under this License Agreement.</p>
                        <p><span className="tnc_num_idx">1.2.    </span> <b>Common Words.</b>The following words shall be interpreted as designated: (i) “or” connotes any combination of all or any of the items listed; (ii) where “including” is used to refer to an example or begins a list of items, such example or items shall not be exclusive; and (iii) “specified” requires that an express statement is contained in the relevant document.</p>
                    </div>
                </div>
                <div>
                    <br/>
                    <h5><span className="tnc_num_idx">2.        </span> TERM AND TERMINATION</h5>
                    <p><span className="tnc_num_idx">2.1.    </span> <b>Term.</b> This License Agreement shall remain in effect for {userInfo.isTrial?"a period of fifteen (15) days":"the provided period"} from the date of installation of the Software (‘Term’). The License term shall automatically expire on the end of the Term.</p>
                    <p><span className="tnc_num_idx">2.2.    </span> <b>Termination for Cause.</b> If Licensee breaches a material obligation under this Agreement, then Licensor may terminate this Agreement with immediate effect.</p>
                </div>
                <div>
                    <br/>
                    <h5><span className="tnc_num_idx">3.        </span> CONSEQUENCE OF TERMINATION</h5>
                    <p><span className="tnc_num_idx">3.1.    </span> <b> Return of Software.</b> Upon termination of this License Agreement, under any or all of the reasons mentioned in this License Agreement or on expiry of the License Agreement, the license granted to Licensee by Licensor herein shall terminate and Licensee shall cease to use the Software immediately and return or destroy, at Licensor’s option, the original and all copies of the Software and Documentation including partial copies immediately on the date of such termination/expiration. Licensee shall not from the date of termination or expiry of the License Agreement, be entitled to use or access the Software or Documentation in any manner whatsoever, and Licensor shall have a reasonable opportunity to conduct an inspection of Licensee's place of business to assure compliance with this provision.</p>
                </div>
                <div>
                    <br/>
                    <h5><span className="tnc_num_idx">4.        </span> SCOPE OF LICENSE</h5>
                    <p><span className="tnc_num_idx">4.1.    </span> <b>Proprietary Rights to Software.</b> As between Licensor and Licensee, Licensor shall be deemed to own the Intellectual Property Rights in or to the Software; and nothing contained in this License Agreement shall be construed to convey any Intellectual Property Rights in or to the Software to Licensee (or to any party claiming through Licensee) other than the license rights expressly set forth in this License Agreement.</p>
                    <p><span className="tnc_num_idx">4.2.    </span> <b>License Grant.</b>Subject to the compliance of the terms and conditions of this License Agreement by Licensee, Licensor hereby grants Licensee a non- exclusive, non-transferable, and non- sub licensable License to download and use one copy of the Software solely for Licensee’s own internal trial purpose during the Term</p>
                    <p><span className="tnc_num_idx">4.3.    </span> <b>Restrictions.</b> Except to the extent authorized or permitted in this License Agreement or by applicable law without the possibility of contractual waiver, Licensee shall not directly or indirectly: (i) copy, modify, create derivative work; (ii), transfer or distribute the Software (electronically or otherwise); (iii) reverse assemble, disassemble,reverse engineer, reverse compile, or otherwise translate the Software; (iv) sublicense or assign the license for the Software; (v) remove, delete or alter any content, trademark, copyright or other intellectual property rights from the Software including any copies thereof; (vi) use the Software for comparison, and marketing any other similar purpose; (vii) use the Software to derive ideas for developing similar features on any other similar products; (viii) use the Software in violation of the applicable laws.</p>
                </div>
                <div>
                    <br/>
                    <h5><span className="tnc_num_idx">5.        </span> REPRESENTATIONS AND WARRANTIES</h5>
                    <p><span className="tnc_num_idx">5.1.    </span> <b>Authority and Non-Infringement.</b> Licensor represents and warrants that Licensor has all rights and authority required to enter into this License Agreement, and to provide the Software and perform the services contemplated by this License Agreement, free from all liens, claims, encumbrances, security interests and other restrictions. Subject to the applicable terms and conditions of this License Agreement, Licensee will be entitled to use and enjoy the benefit of all Software without adverse interruption or disturbance by Licensor or any entity asserting a claim under or through Licensor. Licensor further represents and warrants that the Software  and the use thereof by Licensee in accordance with the terms and conditions of this License Agreement, will not infringe (whether directly, contributorily, by inducement or otherwise), misappropriate or violate the Intellectual Property Rights of any third party, or violate the laws, regulations or orders of any governmental or judicial authority. Licensee represents and warrants that Licensee has all rights and authority required to enter into this License Agreement and Licensee has provided accurate information about itself for accessing the Software.</p>
                    <p><span className="tnc_num_idx">5.2.    </span> <b>Standard of Service.</b> Licensor warrants that the maintenance service provided by Licensor pursuant to this License Agreement or any other agreement relating to the Software, will be performed in a timely and professional manner, in conformity with standards generally accepted in the software industry, by qualified and skilled individuals. Licensor further warrants that its personnel will provide services with a minimal amount of interference to Licensee’s normal business operations and subject to Licensee’s security and work place policies and procedures.</p>
                    <p><span className="tnc_num_idx">5.3.    </span> <b>Disabling Devices.</b> Licensor represents and warrants that at the time of download the Software shall not contain any computer code or any other procedures, routines or mechanisms designed by Licensor (or its personnel or licensors) to: (i) disrupt, disable, harm or impair in any way the Software’s (or any other software’s) orderly operation based on the elapsing of a period of time advancement to a particular date or other numeral (sometimes referred to as “time bombs”, “time locks”, or “drop dead” devices); (ii) cause the Software to damage or corrupt any of Licensee’s, data, storage media, programs, equipment or communications, or otherwise interfere with Licensee’s use of the Software in accordance with this Agreement, or (iii) permit Licensor, its personnel, or any other third party, to access the Software (or any other software or Licensee’s or its Affiliates’ computer systems) for any reason (sometimes referred to as “traps”, “access codes” or “trap door” devices).</p>
                    <p><span className="tnc_num_idx">5.4.    </span> <b>Disclaimer. EXCEPT FOR THE REPRESENTATIONS AND WARRANTIES EXPRESSLY SET FORTH IN THIS LICENSE AGREEMENT OR THE AGREEMENT, THE SOFTWARE AND DOCUMENTATION ARE LICENSED “AS IS,” AND LICENSOR DISCLAIMS ANY AND ALL OTHER WARRANTIES, EXPRESS OR IMPLIED, WITH RESPECT TO THE SOFTWARE, THE DOCUMENTATION, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE</b></p>
                </div>
                <div>
                    <br/>
                    <h5><span className="tnc_num_idx">6.        </span> CONFIDENTIAL INFORMATION</h5>
                    <p><span className="tnc_num_idx">6.1.    </span> <b>Licensor’s Confidential Information.</b> Licensor’s “Confidential Information” means and refers to (i) the Software, (ii) the Documentation, (iii) information or materials related to Licensor’s trade secrets, business plans, strategies, forecasts or forecast assumptions, operations, methods of doing business, records, finances, assets, technology, (iv) information or materials that reveal research, technology, practices, procedures, processes, methodologies, know how, or other systems or controls by which Licensor’s products, services, applications and methods of operations or doing business are developed, conducted or operated, and (v) all other materials furnished by Licensor that are expressly identified or marked by Licensor as “confidential” at the time of their delivery to Licensee.</p>
                    <p><span className="tnc_num_idx">6.2.    </span> <b>Licensee’s “Confidential Information”.</b> Licensee’s “Confidential Information” means and refers to all information and materials, in any form or medium (and without regard to whether the information or materials are owned by Licensee or by a third party), furnished or disclosed to Licensor by Licensee , or otherwise obtained, accessed or observed by Licensor from Licensee).</p>
                    <p><span className="tnc_num_idx">6.3.    </span> <b>Duty of Care.</b> The Party receiving (“Receiving Party”) Confidential Information of the other Party (“Disclosing Party”) will exercise at least the same degree of care with respect to the Disclosing Party’s Confidential Information that the Receiving Party exercises to protect its own Confidential Information; and, at a minimum, the Receiving Party will maintain adequate security measures to safeguard the Disclosing Party’s Confidential Information from unauthorized disclosure, access, use and misappropriation. Without limiting the generality of the foregoing, the Receiving Party will only use or reproduce the Disclosing Party’s Confidential Information to the extent necessary to enable the Receiving Party to fulfill its obligations under this Agreement, or in the case of Licensee, to exercise its rights as contemplated by this Agreement. In addition, the Receiving Party will disclose the Disclosing Party’s Confidential Information only to those of the Receiving Party’s (or in the case of Licensee, also to its Affiliates’) Personnel who have a “need to know” such Confidential Information (and only to the extent necessary) in order to fulfill the purposes contemplated by the Agreement. Prior to disclosing Licensee’s Confidential Information to any of its Personnel, Licensor will ensure that each of its Personnel who will be providing services for Licensee is bound by a written non-disclosure agreement with terms and conditions no less restrictive than those set forth herein. If the Receiving Party becomes aware of any threatened or actual unauthorized access to, use or disclosure of, or any inability to account for, the Disclosing Party’s Confidential Information, the Receiving Party will promptly notify the Disclosing Party thereof and will assist the Disclosing Party with its efforts to terminate such access, to curtail such threatened or actual unauthorized use or disclosure, or to recover such information or materials. The Receiving Party will be liable to the Disclosing Party for any non-compliance by its agents or contractors to the same extent it would be liable for non-compliance by its employees.</p>
                    <p><span className="tnc_num_idx">6.4.    </span> <b>Exclusions.</b> The obligations of confidentiality assumed under this Agreement shall not apply to the extent the Receiving Party can demonstrate, by clear and convincing evidence, that such information:</p>
                    <p className="tnc_third"><span className="tnc_num_idx">6.4.1.  </span> is or has become generally available to the public, without any breach by the Receiving Party of the provisions of this Agreement or any other applicable agreement between the Parties;</p>
                    <p className="tnc_third"><span className="tnc_num_idx">6.4.2.  </span> was rightfully in the possession of the Receiving Party, without confidentiality restrictions, prior to such Party’s receipt pursuant to this Agreement;</p>
                    <p className="tnc_third"><span className="tnc_num_idx">6.4.3.  </span> was rightfully acquired by the Receiving Party from a third party who was entitled to disclose such information, without confidentiality or proprietary restrictions;</p>
                    <p className="tnc_third"><span className="tnc_num_idx">6.4.4.  </span> was independently developed by the Receiving Party without using or referring to the Disclosing Party’s Confidential Information; or,</p>
                    <p className="tnc_third"><span className="tnc_num_idx">6.4.5.  </span> is subject to a written agreement pursuant to which the Disclosing Party authorized the Receiving Party to disclose the subject information.</p>
                    <p><span className="tnc_num_idx">6.5.    </span> <b>Legally Required Disclosures.</b> The obligations of confidentiality assumed under this Agreement shall not apply to the extent that the Receiving Party is required to disclose the Disclosing Party’s Confidential Information under any applicable law, regulation or an order from a court, regulatory agency or other governmental authority having competent jurisdiction, provided that the Receiving Party:</p>
                    <p className="tnc_third"><span className="tnc_num_idx">6.5.1.  </span> promptly notifies the Disclosing Party of the order in order to provide the Disclosing Party an opportunity to seek a protective order;</p>
                    <p className="tnc_third"><span className="tnc_num_idx">6.5.2.  </span> provides the Disclosing Party with reasonable cooperation in its efforts to resist the disclosure, upon reasonable request by the Disclosing Party and at the Disclosing Party’s expense; and,</p>
                    <p className="tnc_third"><span className="tnc_num_idx">6.5.3.  </span> Disclose only the portion of the Disclosing Party’s Confidential Information that is required to be disclosed under such law, regulation or order.</p>
                    <p><span className="tnc_num_idx">6.6.    </span> <b>Accounting for Confidential Information.</b> Except as otherwise expressly provided in this Agreement, upon the request of the Disclosing Party at any time after the termination of this Agreement, the Receiving Party will return (or purge its systems and files of, and suitably account for) all Confidential Information supplied to, or otherwise obtained by, the Receiving Party in connection with this Agreement. The Receiving Party will certify in writing that it has fully complied with its obligations under this Section within seven (7) days after its receipt of a request by the Disclosing Party for such a certification. For the avoidance of doubt, this Section 6.6 shall not be construed to limit either Party’s right to seek relief from damages that are caused by the other Party’s default.</p>
                    <p><span className="tnc_num_idx">6.7.    </span> <b>DISCLAIMER ON DATA:- LICENSOR DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, LIABILITY RELATING TO SECURITY, CONFIDENTIALITY AND PROTECTION OF ALL DATA PROVIDED/TRANSFERRED/UPLOADED, IF ANY, BY LICENSEE IN THE ANY CLOUD ENVIRONMENT AS A PART OF LICENSING/USING THE SOFTWARE FROM ANY CLOUD ENVIRONMENT AND ANY SUCH TRANSFER/UPLOAD OF DATA SHALL BE AT LICENSEE’S OWN RISK.</b></p>
                </div>
                <div>
                    <br/>
                    <h5><span className="tnc_num_idx">7.        </span> INDEMNITY</h5>
                    <p><span className="tnc_num_idx">7.1.    </span> Notwithstanding any limitations, exclusions, restrictions or exculpatory provisions as to liability or damages set forth in this License Agreement, Licensor agrees to indemnify, hold harmless and defend Licensee and its directors, officers, shareholders, employees, successors, assigns, agents, contractors, subcontractors, attorneys, and affiliates from and against any and all losses, costs, claims, liabilities, damages and expenses, including (without limitation) reasonable attorneys’ fees, arising as the result of (a) any breach of any of the representations, warranties, covenants, agreements or obligations of Licensor, (b) any negligence or willful misconduct on the part of Licensor, its employees, agents, subcontractors or subservicers, or (c) any judgment or finding, or any demand, assertion or claim, that any evaluation products or intellectual property provided to Licensee by Licensor in connection with the License Agreement infringes upon any patent, copyright, and/or trademark or any other enforceable proprietary or intellectual property rights of any third party or parties. The provisions of this section shall survive the expiration or termination of this Agreement.</p>
                </div>
                <div>
                    <br/>
                    <h5><span className="tnc_num_idx">8.        </span> LIMITATION OF LIABILITY</h5>
                    <p>LICENSOR WILL NOT BE LIABLE TO THE OTHER PARTY (OR TO ANY PERSON OR ENTITY CLAIMING THROUGH THE OTHER PARTY) FOR LOST PROFITS OR FOR SPECIAL, INCIDENTAL, INDIRECT, CONSEQUENTIAL OR EXEMPLARY DAMAGES ARISING OUT OF OR IN ANY MANNER CONNECTED WITH THIS AGREEMENT OR THE SUBJECT MATTER HEREOF, REGARDLESS OF THE FORM OF ACTION AND WHETHER OR NOT LICENSEE HAS BEEN INFORMED OF, OR OTHERWISE MIGHT HAVE ANTICIPATED, THE POSSIBILITY OF SUCH DAMAGES. NOTWITHSTANDING ANYTHING CONTAINED HEREIN, LICENSOR’S TOTAL LIABILITY, (WHETHER IN CONTRACT, TORT, INCLUDING NEGLIGENCE, OR OTHERWISE) UNDER OR IN CONNECTION WITH THIS AGREEMENT SHALL NOT EXCEED USD $1.</p>
                </div>
                <div>
                    <br/>
                    <h5><span className="tnc_num_idx">9.        </span> SUBCONTRACTORS</h5>
                    <p>Licensor may subcontract its obligations under this Agreement without obtaining Licensee’s prior written approval.</p>
                </div>
                <div>
                    <br/>
                    <h5><span className="tnc_num_idx">10.        </span> ASSIGNMENT</h5>
                    <p>Licensee may, with notice to Licensor, assign this Agreement or any of its rights or interests hereunder, or delegate any of its obligations hereunder, to (i) an Affiliate, (ii) Licensee's successor pursuant to a merger, reorganization, consolidation or sale, or (iii) an entity that acquires all or substantially all of that portion of Licensee’s assets or business for which the Licensor’s Software or services were acquired or being used.  Licensor may, with notice to Licensee, assign this Agreement (in whole and not in part), to (i) a wholly owned subsidiary, or (ii) Licensee's successor pursuant to a merger, reorganization, consolidation or sale. Except as otherwise provided above, neither Party may assign this Agreement nor any of its rights or interests hereunder, nor delegate any obligation to be performed hereunder, without the prior written consent of the other Party, which consent shall not be unreasonably withheld or delayed. Any attempted assignment or delegation in contravention of this Section shall be null and void, and of no force or effect. This Agreement shall be binding upon, and shall inure to the benefit of, the legal successors and permitted assigns of the Parties.</p>
                </div>
                <div>
                    <br/>
                    <h5><span className="tnc_num_idx">11.        </span> NOTICES</h5>
                    <p>Any notice, demand or other communication (collectively “notice”) required or permitted under this Agreement shall be made in writing and shall be deemed to have been duly given (i) when delivered personally to the representative(s) designated to receive notices for the intended recipient, or (ii) when mailed by certified mail (return receipt requested) or sent by overnight courier to the representative(s) designated to receive notices for the intended recipient at the address set forth in the introductory paragraph of this Agreement, as appropriate. Notices concerning the Agreement shall be given to the person who signed the Agreement on behalf of the intended recipient. Any notice from Licensor that alleges Licensee committed a material breach shall also be sent to Licensee’s General Counsel’s Office, to the attention of the managing attorney responsible for intellectual property and technology. Either Party may change its address (es) or representative(s) for receiving notices upon notice to the other.</p>
                </div>
                <div>
                    <br/>
                    <h5><span className="tnc_num_idx">12.        </span> COMPLIANCE WITH LAW</h5>
                    <p><span className="tnc_num_idx">12.1.    </span> <b>General.</b> In performing its obligations under this Agreement, both the parties will comply, and will cause its Personnel to comply, with the requirements of all applicable laws, ordinances, regulations, codes and executive orders.</p>
                    <p><span className="tnc_num_idx">12.2.    </span> <b>Export Controls.</b> Without limiting the generality of Section 12.1, Licensor specifically agrees to comply, and will cause its Personnel to comply, with the requirements of all applicable export laws and regulations, including but not limited to the U.S. Export Administration Regulations. Unless authorized by U.S. regulation or Export License, Licensor will not export or re-export, directly or indirectly, any software or technology received from Licensee, or allow the direct product thereof to be exported or re-exported, directly or indirectly, to (a) any country in Country Group E:2 of the Export Administration Regulations of the Department of Commerce or any other country subject to sanctions administered by the Office of Foreign Assets Control or (b) any non-civil (i.e. military) end-users or for any non-civil end-uses in any country in Country Group D:1 of the Export Administration Regulations, as revised from time to time. Licensor understands that countries other than the U.S. may restrict the import or use of strong encryption products and may restrict exports, and Licensor agrees that it shall be solely responsible for compliance with any such import or use restriction.</p>
                </div>
                <div>
                    <br/>
                    <h5><span className="tnc_num_idx">13.        </span> CHOICE OF LAW, JURISDICTION</h5>
                    <p><b>Governing Law.</b> The Parties hereby agrees that this License Agreement shall be governed by and construed in accordance with the laws of India.</p>
                </div>
                <div>
                    <br/>
                    <h5><span className="tnc_num_idx">14.        </span> REMEDIES</h5>
                    <p><b>Equitable Relief.</b> Licensor and Licensee each acknowledge that the failure to perform their respective duties under <b>Sections 6, 7 or 8</b> may cause the other Party to suffer irreparable injury for which such injured Party will not have an adequate remedy available at law. Accordingly, the injured Party may seek to obtain injunctive or other equitable relief to prevent or curtail any such breach, threatened or actual, without posting a bond or security and without prejudice to such other rights as may be available under this Agreement or under applicable law. For purposes of this Agreement, "equitable relief" means and includes those remedies traditionally and historically granted by courts of equity, including without limitation, injunction, attachment, declaratory relief.</p>
                </div>
                <div>
                    <br/>
                    <h5><span className="tnc_num_idx">15.        </span> WAIVER</h5>
                    <p>No course of dealing, failure by either Party to require the strict performance of any obligation assumed by the other hereunder, or failure by either Party to exercise any right or remedy to which it is entitled, shall constitute a waiver or cause a diminution of the obligations or rights provided under this Agreement. No provision of this Agreement shall be deemed to have been waived by any act or knowledge of either Party, but only by a written instrument signed by a duly authorized representative of the Party to be bound thereby. Waiver by either Party of any default shall not constitute a waiver of any other or subsequent default.</p>
                </div>
                <div>
                    <br/>
                    <h5><span className="tnc_num_idx">16.        </span> FORCE MAJEURE</h5>
                    <p>A Party will be excused from a delay in performing, or a failure to perform, its obligations under this Agreement to the extent such delay or failure is caused by the occurrence of any contingency beyond the reasonable control including epidemics and pandemics, and without any fault, of such Party. In such event, the performance times shall be extended for a period of time equivalent to the time lost because of the excusable delay. However, if an excusable delay continues more than sixty (60) days, the Party not relying on the excusable delay may, at its option, terminate the Agreement in whole or in part, upon notice to the other Party. In order to avail itself of the relief provided in this Section for an excusable delay, the Party must act with due diligence to remedy the cause of, or to mitigate or overcome, such delay or failure.</p>
                </div>
                <div>
                    <br/>
                    <h5><span className="tnc_num_idx">17.        </span> CONSTRUCTION</h5>
                    <p><span className="tnc_num_idx">17.1.    </span> <b>Modification.</b> The terms, conditions, covenants and other provisions of this Agreement may hereafter be modified, amended, supplemented or otherwise changed only by a written instrument (excluding e-mail or similar electronic transmissions) that specifically purports to do so and is physically executed by a duly authorized representative of each Party.</p>
                    <p><span className="tnc_num_idx">17.2.    </span> <b>Severability.</b>  If a court of competent jurisdiction declares any provision of this Agreement to be invalid, unlawful, or unenforceable as drafted, the Parties intend that such provision be amended and construed in a manner designed to effectuate the purposes of the provision to the fullest extent permitted by law. If such provision cannot be so amended and construed, it shall be severed, and the remaining provisions shall remain unimpaired and in full force and effect to the fullest extent permitted by law.</p>
                    
                </div>
                <br/>
                <p id="lastStepTnC"><b>By clicking the “Agree” button, Licensee hereby agrees to be bound by all the terms and conditions stated herein</b></p>
            </div>)
  }

  const getWelcomeStep = ()=>{
    return <div className={"welcomeInstall "+AnimationClassNames.slideDownIn20} style={{justifyContent:"unset !important"}}>
        {/* <div className="step1">
            <div>Terms and Conditions</div>
        </div> */}
        {getTermsAndConditions()}
        <button className="type1-button static-button" disabled={!tncAcceptEnabled} onClick={()=>{updateStepNumber(1)}}>I Agree</button>
    </div>
  };

  const InstallationSteps_win = [
      {
        title:"Open the AvoAssureClient.exe file either from:", 
        items:[
          {title:"Download panel",imageName:"WW_win_1_1"},
          {title:"Browser's downloads section.",imageName:"WW_win_1_2"},
          {title:"System's downloads folder.",imageName:"WW_win_1_3"}
        ],
        type:"OR"
      },
      {
        title:"If prompted, allow the following permission:", 
        items:[
          {title:<>Click on <b>"More Info"</b></>,imageName:"WW_win_2_1"},
          {title:<>Click on <b>"Run Anyway"</b></>,imageName:"WW_win_2_2"}
        ],
        type:"NOR"
      },
      {
        title:"To install Avo Assure client follow the below steps:", 
        items:[
          {title:"Intialise installation",imageName:"WW_win_3_1"},
          {title:"Extracting files",imageName:"WW_win_3_2"},
          {title:"Finish and Launch",imageName:"WW_win_3_2"}
        ],
        type:"NOR"
      },
      {
        title:"Establish Avo Server and Client Connection:", 
        items:[
          {title:"Initialise Avo Client via desktop shortcut",imageName:"WW_win_4_1"},
          {title:"Connect ICE via clicking on Connect Button",imageName:"WW_win_4_2"}
        ],
        type:"NOR"
      }
  ] 

  const InstallationSteps_mac = [
    {
      title:`Open and Extract the "AvoAssureClient.zip" file either from:`, 
      items:[
        {title:"Download panel",imageName:"WW_mac_1_1"},
        {title:"Browser's downloads section.",imageName:"WW_mac_1_2"},
        {title:"System's downloads folder.",imageName:"WW_mac_1_3"}
      ],
      type:"OR"
    },
    {
      title:<><div style={{fontStyle:"italic", fontSize:"0.7rem"}}>Note: You need to have <b>Python {selectedMacOS==="BigSur"?"v3.7.0":"v3.7.9"}</b> installed in your system or <a style={{color:"#5f338f"}} href={`https://www.python.org/ftp/python/${selectedMacOS==="BigSur"?"3.7.0":"3.7.9"}/`}>click here to install</a>.</div></>, 
      items:[
        {title:"Drag and drop the extracted folder onto the Terminal icon in the Dock.",imageName:"WW_mac_2_1"},
      ],
      type:"OR"
    },
    {
      title:`Run the below files:`, 
      items:[
        {title:`Type "./unquarantine.sh" and press enter.`,imageName:"WW_mac_3_1"},
        {title:`Type "./run.sh" and press enter.`,imageName:"WW_mac_3_2"},
      ],
      type:"NOR"
    },
    {
      title:"Establish Avo Server and Client Connection:", 
      items:[
        {title:"Connect ICE via clicking on Connect Button",imageName:"WW_mac_4_1"}
      ],
      type:"OR"
    }
    // {subtitle:"Before Installing",content:<><div style={{fontStyle:"italic", marginBottom:5}}>Note - You need to have <b>Python {selectedMacOS==="BigSur"?"v3.7.0":"v3.7.9"}</b> installed in your system or <a style={{color:"#5f338f"}} href={`https://www.python.org/ftp/python/${selectedMacOS==="BigSur"?"3.7.0":"3.7.9"}/`}>click here to install</a>.</div><div>Drag and drop the extracted folder onto the Terminal icon in the Dock.</div></>,imageName:"instruction-2_mac"},
    // {subtitle:"Run Files", content:<><ol type="1" style={{margin: 0, paddingLeft: 20}}><li>Type <b>"./unquarantine.sh"</b> in the terminal window and press enter. If prompted, enter your system password.</li><li>Type <b>"./run.sh"</b> and press enter.</li></ol></>,imageName:"instruction-3_mac"},
    // {subtitle:"Connect", content:<><ol type="1" style={{margin: 0, paddingLeft: 20}}><li>Click on <b>Register</b> button, and then click on submit.</li><li>Click on the <b>Connect</b> button in AvoAssure Client.</li></ol></>,imageName:"instruction-4_mac"}
  ]

  const afterDownloadInstructions = () => {
      return <div className={"welcomeInstall "+(animationDir?AnimationClassNames.slideRightIn400:AnimationClassNames.slideLeftIn400)} style={{justifyContent:"space-evenly"}}>
        <div className="d-p-header">
            <div className="d-p-header__title"><div>Thanks for downloading !</div></div>
            <div className="d-p-header__subtitle">If your download didn't start then don't worry, you can download it from <b>"User Profile" dropdown</b> on <b>landing page.</b></div>
        </div>
        <div className="installation-instructions-container">
            <div className="d-p-card-container">
                { cardListNo===0 ? null : 
                    <IconButton id="arrow__WW" data-type={cardListNo===0?"disabled":"not-disabled"} disabled={cardListNo===0} icon="chevron-left" styles={{root:{left:0, height:"4rem !important", background:"transparent !important"}}} onClick={() => {setCardListNo((prevState)=>prevState-1)}} variant="borderless" />
                }
                {OS==="Windows" && InstallationSteps_win.map((item,idx)=>{
                    if (cardListNo===idx){
                      return <DPCard key={item.title+idx} title={item.title} items={item.items} type={item.type}></DPCard>
                    } 
                    // else if (cardListNo===2 && idx>1 ){
                    //   return <DPCard key={item.imageName+idx} htitle={`Step ${idx+1}`} itemObj={item}></DPCard>
                    // }
                    else return null;
                })}
                {OS==="MacOS" && InstallationSteps_mac.map((item,idx)=>{
                    if (cardListNo===idx){
                      return <DPCard key={item.title+idx} title={item.title} items={item.items} type={item.type}></DPCard>
                    } 
                    // else if (cardListNo===2 && idx>1 ){
                    //   return <DPCard key={item.imageName+idx} htitle={`Step ${idx+1}`} itemObj={item}></DPCard>
                    // }
                    else return null;
                })}
                { cardListNo===3 ? null : 
                <IconButton id="arrow__WW" disabled={cardListNo===3} data-type={cardListNo===3?"disabled":"not-disabled"} icon="chevron-right" styles={{root:{right:0, height:"4rem !important", background:"transparent !important"}}} onClick={() => {setCardListNo((prevState)=>prevState+1)}} variant="borderless" />
                }
            </div>
            <div style={{display:"flex", flexDirection:"row"}}>
              {OS==="Windows" ? InstallationSteps_win.map((item,idx)=> <div key={"select-"+idx} className="circle" data-type={cardListNo===idx} onClick={()=>{setCardListNo(idx)}}></div>):null}
              {OS==="MacOS" ? InstallationSteps_mac.map((item,idx)=> <div key={"select-"+idx} className="circle" data-type={cardListNo===idx} onClick={()=>{setCardListNo(idx)}}></div>):null}
            </div>
        </div>
        <div style={{display:"flex", width:"100%",justifyContent:"space-between"}}>
          <button className="type1-button static-button" data-type={"empty"} onClick={()=>{updateStepNumber(1)}}>SKIP</button>
          {cardListNo===3?<button className="type1-button static-button" onClick={()=>{updateStepNumber(1)}}>Next</button>:null}

        </div>
      </div>
  }

  const getDownloadStep = ()=>{
    return <div className={"welcomeInstall "+AnimationClassNames.slideLeftIn400}>
                {!showIndicator && <span className="animate-text-container">
                    {downloadScreenCounter===0 && <span>Automate.</span>}
                    {downloadScreenCounter===1 && <span>Work.</span>}
                    {downloadScreenCounter===2 && <span>Access.</span>}
                    <span style={{color:"#5F338F"}}>&nbsp;Now.</span>
                    {/* <img src={"static/imgs/WelcomeInstall.svg"} alt="install-avo-client" height="100%"/> */}
                </span>}

                {(showIndicator) ? <div className="step2" style={{marginBottom:"1rem"}}>{"This will take approximately 10 - 15 minutes to complete"}</div>: <img className="specifications" src={`static/imgs/specifications_${OS}.svg`} />
                // <div className="step2" style={{marginBottom:"1rem"}}>{"Please Download The Avo Assure Client"}</div>
                }
                
                {(showMacOSSelection?(
                    <>
                        <div className="OSselectionText">Please select Operating System for downloading Avo Assure Client</div>
                        <div className="choiceGroup">
                            {Object.keys(config).map((osPathname)=>{
                                if (osPathname.includes("Windows") || osPathname.includes("Linux")){
                                    return <></>;
                                }
                                let versionName = osPathname.split("_")[1]
                                return <button className="choiceGroupOption" data-selected={selectedMacOS===versionName} onClick={()=>{_handleClientDownload(versionName)}}>Download on {versionName}</button>
                            })}
                        </div>
                    </>)
                    :null)}

                {showIndicator && !showMacOSSelection && !showLinuxOSSelection? 
                    <>
                        <div className="step2" style={{marginBottom:"0.5rem"}}>{"Downloading the Avo Assure Client"}</div>
                        <div className="downloadProgress">
                            <ProgressIndicator 
                            barHeight={30}
                            styles = {{
                                root:{width:"90%"},
                                progressBar: { background:"#643693"},
                                itemName: { fontSize: '1em', marginBottom: '0.6em',color:"black", display:"none" },
                                itemDescription: { fontSize: '1em', marginTop: '0.6em' },
                            }} label={'Downloading ICE Package...'} percentComplete={percentComplete} />
                        </div>
                    </>
                :
                (OS==="Windows" || OS==="Linux"?<button className="type2-button" onClick={_handleClientDownload}>Download Avo Assure Client</button>:null)}
                {/* <div style={{marginTop:"2rem"}}>Once the download is completed, you can proceed with further steps</div> */}
            </div>
  };

  const getStartTrialStep = ()=>{
      return <div className={"welcomeInstall "+AnimationClassNames.slideLeftIn400}>
                <span style={{height:"30%"}}>
                    <img src={"static/imgs/green_thumbs_up.svg"} alt="thanks-for-downloading" style={{height:"100%"}}/>
                </span>
                <div className="step-body-container">
                    <div className="step2">Thanks for installing !</div>
                    {/* <div className="links-container">
                        <a href={vidLink} target={"_blank"} referrerPolicy="no-referrer">Training Videos</a>
                        <a href={docLink} target={"_blank"} referrerPolicy="no-referrer">Training Document</a>
                    </div> */}
                    <button className="type2-button" style={{marginTop: "2rem"}} onClick={() => {tcAction("Accept");}}>Get Started</button>
                </div>
                <button className="type1-button" data-type={"bordered"} onClick={()=>{updateStepNumber(-1)}}>Back</button>
            </div>
  }

  return (
      <div className={"WW_container "+(activeStep>3?AnimationClassNames.fadeOut500:AnimationClassNames.fadeIn100)}>
        <div className="form">
        {showImage !== "" && <GetImageModal imageName = {showImage} /> } 
        <div className="progressbar">
             <Stepper
                steps={[
                    { label: 'Accept Terms and Conditions', active:activeStep===0, completed:activeStep>0, children:activeStep===0?1:<i className="fa fa-check"></i>},
                    { label: 'Download Avo Assure Client', active:activeStep===1, completed:activeStep>1, children:activeStep<=1?2:<i className="fa fa-check"></i>},
                    { label: 'Setup Avo Assure Client', active:activeStep===2, completed:activeStep>2, children:(activeStep<=2)?3:<i className="fa fa-solid fa-check"></i>},
                    { label: 'Getting Started', active:activeStep===3, completed:activeStep>3, children:(activeStep<=3)?4:<i className="fa fa-solid fa-check"></i>}]}
                className="stepper"
                stepClassName="stepButtons"
                styleConfig={{
                    cursor:"default",
                    activeBgColor:"#643693",
                    completedBgColor:"#321e4f",
                    inactiveBgColor:"#aaa",
                    labelFontSize:"14px",
                    size:"2rem"
                }}
                connectorStateColors={true}
                connectorStyleConfig={{
                    activeColor:"#643693",
                    completedColor:"#643693"
                }}
             />
        </div>
        <div className="form-container">
            {activeStep===0?getWelcomeStep():null}
            {activeStep===1?getDownloadStep():null}
            {activeStep===2?afterDownloadInstructions():null}
            {activeStep===3?getStartTrialStep():null}
            {downloadPopover==="chrome" ?        
                <div className="chrome-popover">
                    <div className='chrome-popover_body'>
                        Install <b>Avo Assure Client</b>
                    </div>
                    <div className="chrome-popover_anchor"></div>
                </div>
                :null
            }
            
            {downloadPopover==="edge" ? 
                <div className="edge-popover">
                    <div className="edge-popover_triangle"></div>
                    <div className='edge-popover_body'>
                        Open <b>Downloads</b> in the Settings menu of your toolbar to install <b>Avo Assure Client</b>
                    </div>
                    <div className="edge-popover_image">
                        <img src="/static/imgs/edge_download.svg" alt="download" />
                    </div>
                </div>
                :null
            }
          {<div className="WelcomeContactUs">For help <a href="https://avoautomation.gitbook.io/avo-trial-user-guide/" target="_blank" rel="no-referrer">click here</a> OR <a href="mailto:support@avoautomation.com">contact us</a></div>}
        </div>
        </div>
    </div>
  );
}

export default WelcomeWizard;