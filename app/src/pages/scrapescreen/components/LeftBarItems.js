import React ,{useState , useEffect, Fragment} from 'react';
import '../styles/LeftBarItems.scss'
import {GetScrapeDataScreenLevel_ICE ,initScraping_ICE } from '../api';
import {ScrollBar , ModalContainer } from '../../global';
import ModalContent from './ModalContent'

/*Component LeftBarItems
  use: renders  6 options in design  in the left of screen
  props: 
    setoptions from scrapeHome.js 
*/

const CreateOptions = (props) => {

  const options = [
    {ico : "ic-addobject.png",label:'Add Object',comp:'addobject'},
    {ico : "ic-mapobject.png",label:'Map Object',comp:'map'},
    {ico :"ic-compareobject.png",label:'Compare Object',comp:'compare'},
    {ico:"ic-jq-editstep.png",label:'Create Object',comp:'create'}
    ]
  const [flag,setFlag] = useState(false)

        
        
  const [appen , setAppen] =useState(false)

  const [os , setOs]= useState(" ")

  const macOS = navigator.appVersion.indexOf("Mac") != -1;
        

  var _CT =[
    {
      appType: "MobileWeb",
      assignedTestScenarioIds: [],
      batchTaskIDs: "5f367dbec233a16310ec169d",
      cycleid: "5f36591fc233a16310ec1697",
      projectId: "5f36591fc233a16310ec1698",
      releaseid: "R1",
      reuse: "False",
      scenarioFlag: "False",
      scenarioId: "",
      screenId: "5f3663e5c233a16310ec169b",
      screenName: "Screen_1",
      status: "inprogress",
      subTask: "Scrape",
      subTaskId: "5f367dbec233a16310ec169d",
      taskName: "Scrape Screen_1",
      testCaseId: "",
      testCaseName: "",
      testSuiteDetails: [{assignedTime: "", releaseid: "", cycleid: "", testsuiteid: "", testsuitename: ""}],
      versionnumber: 0
    },

    {
      appType: "Web",
      assignedTestScenarioIds: [],
      batchTaskIDs: "5f368056c233a16310ec16a4",
      cycleid: "5f367fb1c233a16310ec169e",
      projectId: "5f367fb1c233a16310ec169f",
      releaseid: "R1",
      reuse: "False",
      scenarioFlag: "False",
      scenarioId: "",
      screenId: "5f368004c233a16310ec16a2",
      screenName: "Screen_1",
      status: "reassigned",
      subTask: "Scrape",
      subTaskId: "5f368056c233a16310ec16a4",
      taskName: "Scrape Screen_1",
      testCaseId: "",
      testCaseName: "",
      testSuiteDetails: [{assignedTime: "", releaseid: "", cycleid: "", testsuiteid: "", testsuitename: ""}],
      versionnumber: 0
    },
    {
      appType: "MobileApp",
      assignedTestScenarioIds: [],
      batchTaskIDs: ["5f6c8a62d2876445ecee6c82"],
      cycleid: "5f6c84c8d2876445ecee6c6e",
      projectId: "5f6c84c8d2876445ecee6c6f",
      releaseid: "Rel1",
      reuse: "False",
      scenarioFlag: "False",
      scenarioId: "",
      screenId: "5f6c8a42d2876445ecee6c80",
      screenName: "Screen_5",
      status: "inprogress",
      subTask: "Scrape",
      subTaskId: "5f6c8a62d2876445ecee6c82",
      taskName: "Scrape Screen_5",
      testCaseId: "",
      testCaseName: "",
      testSuiteDetails: [{assignedTime: "", releaseid: "", cycleid: "", testsuiteid: "", testsuitename: ""}],
      versionnumber: 0
    }
  ]


  localStorage.setItem('_CT' , JSON.stringify(_CT));

  const user = JSON.parse(localStorage.getItem('_CT'))

  const apptype = user[1].appType;
          
  useEffect(() => {
    (async () =>{
      var res = await GetScrapeDataScreenLevel_ICE()
      var custName =[] ;
      custName = res.view;
      if(custName.length !=0){
        setAppen(true)
      }
    })()
  }, [macOS])

  

  const callICE =async(browesertype)=>{
    const items = await initScraping_ICE(browesertype);
    props.setScpitm(items);
  }
  const onClose = () =>{
    props.setMweb(false);
    setOs(" ")
  }

  return (
    <div className="leftnav" >
      {(apptype=== "Web")? 
        <Fragment>
          <ScrollBar thumbColor = 'rgba(255, 255, 255, 0.27)' trackColor = 'none'>
            <div className="leftbar-container">
              <div className="leftbar-top">
                <ul>
                  <li><i className="scrapeOnTxt">Scrape On</i></li>
                  <li><i className={flag?"browserIcon" : "special"}   title="Launch Internet Explorer"><span onClick={()=> callICE('ie')} className="fa fa-internet-explorer fa-3x"></span><br/>Internet Explorer</i></li>
                  <li><i className={flag?"browserIcon" : "special"}   title="Launch Google Chrome" ><span  onClick={()=> callICE('chrome')} className="fa fa-chrome fa-3x"></span><br/>Google Chrome</i></li>
                  {macOS? <li ><i className={flag?"browserIcon" : "special"} title="Launch Safari"><span   className="fa fa-safari fa-3x"></span><br/>Safari</i></li> : null}
                  <li><i className={flag?"browserIcon" : "special"}   title="Launch Mozilla Firefox"><span  onClick={()=> callICE('mozilla')} className="fa fa-firefox fa-3x"></span><br/>Mozilla Firefox</i></li>
                  <li><i className={flag?"browserIcon" : "special"}   title="Launch Edge Legacy"><span  onClick={()=> callICE('edge')} className="fa fa-edge fa-3x"></span><br/>Edge Legacy</i></li>
                  <li><i className={flag?"browserIcon" : "special"}   title="Launch PDF utility" ><span className="fa fa-file-pdf-o fa-3x"></span><br/>PDF Utility</i></li>
                  <li className= {(!appen)?"special" : null}><i className="Append"    title="Append ON" ><span><input  type="checkbox" onChange={()=>setFlag(!flag)}/></span><br/>Append</i></li>
                </ul>
              </div>
            </div>
            <div className="leftbottom">
              {options.map((e,i)=>(
                  <div key={i} className="cards">
                    <img src={"static/imgs/"+e.ico} alt={e.label}/>
                    <div>{e.label}</div>
                  </div>
              ))}
            </div>
          </ScrollBar>
        </Fragment>
        : null }
        {(apptype==="SAP")? <div className="leftbar-container">
        <div className="leftbar-top">
          <ul>
            <li><i className='scrapeOnTxt'>Scrape On</i></li>
            <li><i className='browserIcon'  title="Desktop Apps"><span><img src='static/imgs/ic-desktop.png' alt='SAP Apps' /></span><br/>SAP Apps</i></li>
            <li><i className='pdfIcon'   title="Launch PDF utility"><span><img src='static/imgs/ic-pdf_scrape.png' alt='pdf' /></span><br/>PDF Utility</i></li>
            <li><i class='Append'   title="Append ON" ><span><input type="checkbox" onChange={()=>setFlag(!flag)}/></span><br/><br/>Append</i></li>
          </ul>
        </div>
      </div> : null}

                
      {(apptype==="OEBS")? <div className="leftbar-container">
        <div className="leftbar-top">
          <ul>
            <li><i className='scrapeOnTxt'>Scrape On</i></li>
            <li><i className='browserIcon'   title="Desktop Apps"><span><img src='static/imgs/ic-desktop.png' alt='OEBS Apps' /></span><br/>OEBS Apps</i></li>
            <li><i className='pdfIcon'   title="Launch PDF utility"><span><img src='static/imgs/ic-pdf_scrape.png' alt='pdf' /></span><br/>PDF Utility</i></li>
            <li><i class='Append'   title="Append ON" ><span><input type="checkbox" onChange={()=>setFlag(!flag)}/></span><br/><br/>Append</i></li>
          </ul>
        </div>
      </div> : null}    
      {(apptype==="MobileApp")? <div className="leftbar-container">
        <div className="leftbar-top" id="leftbar-top">
        {props.mweb  ? <ModalContainer title='Launch Application' 
            content= {<ModalContent os={os} setOs={setOs}/>}
            close={onClose} footer ={(os==="android" ||os==="ios")? <button>Launch</button> : null}/>: null}
          {props.spdf  ? <ModalContainer title='Scrape Screen' content="No Intelligent Core Engine (ICE) connection found with the Avo Assure logged in username. Please run the ICE batch file once again and connect to Server." close={()=>props.setSpdf(false)} footer ={<button>OK</button>}/>: null}
          
          <ul>
            <li><i  className='scrapeOnTxt'>Scrape On</i></li>
            <li><i className='browserIcon'   title="Desktop Apps"><span><img onClick={()=>props.setMweb(true)} src='static/imgs/ic-mobility.png' alt='Desktop Apps' /></span><br/>Mobile Apps</i></li>
            <li><i className='pdfIcon'   title="Launch PDF utility"><span><img onClick={()=>props.setSpdf(true)} src='static/imgs/ic-pdf_scrape.png' alt='pdf' /></span><br/>PDF Utility</i></li>
            <li><i class='Append'   title="Append ON" ><span><input type="checkbox" onChange={()=>setFlag(!flag)}/></span><br/><br/>Append</i></li>
          </ul>
        </div>
      </div> : null}

                
      {(apptype==="MobileWeb")? <div className="leftbar-container">
        <div className="leftbar-top">
          <ul>
            <li><i  className='scrapeOnTxt'>Scrape On</i></li>
            <li><i  className='browserIcon'   title="Desktop Apps"><span><img  src='static/imgs/ic-mobility.png' alt='Desktop Apps' /></span><br/>Mobile Web</i></li>
            <li><i className='pdfIcon'   title="Launch PDF utility"><span><img   src='static/imgs/ic-pdf_scrape.png' alt='pdf' /></span><br/>PDF Utility</i></li>
            <li><i className='Append'   title="Append ON" ><span><input type="checkbox" onChange={()=>setFlag(!flag)}/></span><br/><br/>Append</i></li>
          </ul>
        </div>
      </div> : null}
      {(apptype==="desktop")? <div className="leftbar-container">
        <div className="leftbar-top">
        {props.mweb  ? <ModalContainer title='Launch Application' content={<div><br/><input className="modalInput" type="text" placeholder="AndroidDeviceSerialNo/IOSDeviceNO"/><br/><br/><input className="modalInput" type="text" placeholder="Android/IOSVersion" /></div>} close={()=>props.setMweb(false)} footer ={<button>Launch</button>}/>: null}
          {props.spdf  ? <ModalContainer title='Scrape Screen' content="No Intelligent Core Engine (ICE) connection found with the Avo Assure logged in username. Please run the ICE batch file once again and connect to Server." close={()=>props.setSpdf(false)} footer ={<button>OK</button>}/>: null}
          <ul>
            <li><i className='scrapeOnTxt'>Scrape On</i></li>
            <li><i className='browserIcon'   title="Desktop Apps"><span><img src='static/imgs/ic-desktop.png' alt='Desktop Apps' /></span><br/>Desktop Apps</i></li>
            <li><i className='pdfIcon'   title="Launch PDF utility"><span><img src='static/imgs/ic-pdf_scrape.png' alt='pdf' /></span><br/>PDF Utility</i></li>
            <li><i class='Append'   title="Append ON" ><span><input type="checkbox" onChange={()=>setFlag(!flag)}/></span><br/><br/>Append</i></li>
          </ul>
        </div>
      </div> : null}
    </div>
    );
  }

  export default CreateOptions;

                              