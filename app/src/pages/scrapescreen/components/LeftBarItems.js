import React ,{useState , useEffect, Fragment} from'react';
import '../styles/LeftBarItems.scss'
import {GetScrapeDataScreenLevel_ICE} from '../api';
import {ScrollBar} from '../../global';

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
    }
  ]


  localStorage.setItem('user' , JSON.stringify(_CT));

  const user = JSON.parse(localStorage.getItem('user'))

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
          
    
  return (
    <div className="leftnav" >
      {(apptype=== "Web")? 
        <Fragment>
          <ScrollBar thumbColor = 'rgba(255, 255, 255, 0.27)' trackColor = 'none'>
            <div className="leftbar-container">
              <div className="leftbar-top">
                <ul>
                  <li><i className="scrapeOnTxt">Scrape On</i></li>
                  <li><i className={flag?"browserIcon" : "special"}   title="Launch Internet Explorer"><span className="fa fa-internet-explorer fa-3x"></span><br/>Internet Explorer</i></li>
                  <li><i className={flag?"browserIcon" : "special"}   title="Launch Google Chrome" ><span className="fa fa-chrome fa-3x"></span><br/>Google Chrome</i></li>
                  {macOS? <li ><i className={flag?"browserIcon" : "special"} title="Launch Safari"><span className="fa fa-safari fa-3x"></span><br/>Safari</i></li> : null}
                  <li><i className={flag?"browserIcon" : "special"}   title="Launch Mozilla Firefox"><span className="fa fa-firefox fa-3x"></span><br/>Mozilla Firefox</i></li>
                  <li><i className={flag?"browserIcon" : "special"}   title="Launch Edge Legacy"><span className="fa fa-edge fa-3x"></span><br/>Edge Legacy</i></li>
                  <li><i className={flag?"browserIcon" : "special"}   title="Launch PDF utility" ><span className="fa fa-file-pdf-o fa-3x"></span><br/>PDF Utility</i></li>
                  <li className= {(!appen)?"special" : null}><i className="Append"    title="Append ON" ><span><input  type="checkbox" onChange={()=>setFlag(!flag)}/></span><br/>Append</i></li>
                </ul>
              </div>
            </div>
            <div className="leftbottom">
              {options.map((e,i)=>(
                <div className="cards" onClick={()=>props.setOptions(e.comp)} key={i}>
                  <div>
                    <img src={"static/imgs/"+e.ico} alt={e.label}/>
                    <div>{e.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollBar>
        </Fragment>
        : null }
      {(apptype==="Desktop")? <div className="leftbar-container">
        <div className="leftbar-top">
          <ul>
            <li><i className='scrapeOnTxt'>Scrape On</i></li>
            <li><i className='browserIcon'   title="Desktop Apps"><span><img src='static/imgs/ic-desktop.png' alt='Desktop Apps' /></span><br/>Desktop Apps</i></li>
            <li><i className='pdfIcon'   title="Launch PDF utility"><span><img src='static/imgs/ic-pdf_scrape.png' alt='pdf' /></span><br/>PDF Utility</i></li>
            <li><i class='Append'   title="Append ON" ><span><input type="checkbox" onChange={()=>setFlag(!flag)}/></span><br/><br/>Append</i></li>
          </ul>
        </div>
      </div>: null}

                
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
        <div className="leftbar-top">
          <ul>
            <li><i className='scrapeOnTxt'>Scrape On</i></li>
            <li><i className='browserIcon'   title="Desktop Apps"><span><img src='static/imgs/ic-mobility.png' alt='Desktop Apps' /></span><br/>Mobile Apps</i></li>
            <li><i className='pdfIcon'   title="Launch PDF utility"><span><img src='static/imgs/ic-pdf_scrape.png' alt='pdf' /></span><br/>PDF Utility</i></li>
            <li><i class='Append'   title="Append ON" ><span><input type="checkbox" onChange={()=>setFlag(!flag)}/></span><br/><br/>Append</i></li>
          </ul>
        </div>
      </div> : null}

                
      {(apptype==="MobileWeb")? <div className="leftbar-container">
        <div className="leftbar-top">
          <ul>
            <li><i className='scrapeOnTxt'>Scrape On</i></li>
            <li><i className='browserIcon'   title="Desktop Apps"><span><img src='static/imgs/ic-mobility.png' alt='Desktop Apps' /></span><br/>Mobile Web</i></li>
            <li><i className='pdfIcon'   title="Launch PDF utility"><span><img src='static/imgs/ic-pdf_scrape.png' alt='pdf' /></span><br/>PDF Utility</i></li>
            <li><i className='Append'   title="Append ON" ><span><input type="checkbox" onChange={()=>setFlag(!flag)}/></span><br/><br/>Append</i></li>
          </ul>
        </div>
      </div> : null}
      {(apptype==="desktop")? <div className="leftbar-container">
        <div className="leftbar-top">
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

                              