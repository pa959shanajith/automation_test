import React ,{useState , useEffect, Fragment} from 'react';
import { useSelector } from 'react-redux';
import '../styles/LeftBarItems.scss'
import {GetScrapeDataScreenLevel_ICE ,initScraping_ICE } from '../api';
import {ScrollBar , ModalContainer, Thumbnail, ActionBar } from '../../global';
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
  
  const macOS = navigator.appVersion.indexOf("Mac") != -1;
  const scrapeData = useSelector(state=> state.scrape.ScrapeData);
  // const _FD =useSelector(state=>state.plugin.FD);
  const apptype = props.apptype;
          
  useEffect(() => {
      if(scrapeData.length !== 0)
      {var custName =[] ;
      custName = scrapeData.view;
      if(custName.length !=0){
        setAppen(true)
      }}
  }, [scrapeData])

  

  const callICE =async(browesertype)=>{
    const items = await initScraping_ICE(browesertype);
    props.setScpitm(items);
    
  }

  const upperContent=(apptype)=>{
    return (
      <div className="leftnav" >
      
      {(apptype === "Web")? 
          <Fragment>
            
            <div className="leftbar-container">
              <div className="leftbar-top">
                <ul>
                  <li><i className="scrapeOnTxt">Scrape On</i></li>
                  <li><i className={flag?"browserIcon" : "special"}   title="Launch Internet Explorer"><span onClick={()=> callICE('ie')}className="fa fa-internet-explorer fa-3x"></span><br/>Internet Explorer</i></li>
                  <li><i className={flag?"browserIcon" : "special"}   title="Launch Google Chrome" ><span  onClick={()=> callICE('chrome')} className="fa fa-chrome fa-3x"></span><br/>Google Chrome</i></li>
                  {macOS? <li ><i className={flag?"browserIcon" : "special"} title="Launch Safari"><span   className="fa fa-safari fa-3x"></span><br/>Safari</i></li> : null}
                  <li><i className={flag?"browserIcon" : "special"}   title="Launch Mozilla Firefox"><span  onClick={()=> callICE('mozilla')} className="fa fa-firefox fa-3x"></span><br/>Mozilla Firefox</i></li>
                  <li><i className={flag?"browserIcon" : "special"}   title="Launch Edge Legacy"><span  onClick={()=> callICE('edge')} className="fa fa-edge fa-3x"></span><br/>Edge Legacy</i></li>
                  <li><i className={flag?"browserIcon" : "special"}   title="Launch PDF utility" ><span className="fa fa-file-pdf-o fa-3x"></span><br/>PDF Utility</i></li>
                  <li className= {(!appen)?"special" : null}><i className="Append"    title="Append ON" ><span><input  type="checkbox" onChange={()=>setFlag(!flag)}/></span><br/>Append</i></li>
                </ul>
              </div>
             
            </div>
            
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
        <ul>
            <li><i  className='scrapeOnTxt'>Scrape On</i></li>
            <li><i className='browserIcon'   title="Desktop Apps"><span><img onClick={()=>{props.setMweb(true);console.log("this is clicked")}} src='static/imgs/ic-mobility.png' alt='Desktop Apps' /></span><br/>Mobile Apps</i></li>
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
        </div> )
  }
  const bottomContent=(apptype)=>{
    return(
      <Fragment>
      {(apptype === "Web")?
        <div className="leftbottom">
          {options.map((e,i)=>(
            <div key={i} className="cards">
              <img src={"static/imgs/"+e.ico} alt={e.label}/>
              <div>{e.label}</div>
            </div>
          ))}
        </div>: <div className="leftbottom"></div> } </Fragment>
    ) 
  }
  return(
    <ActionBar 
      upperContent={upperContent(apptype)} 
      bottomContent={bottomContent(apptype)}
    />    
  )
  }

  export default CreateOptions;

                              