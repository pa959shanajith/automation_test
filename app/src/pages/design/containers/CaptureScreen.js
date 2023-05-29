import  {React, useState, useRef, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import '../styles/CaptureScreen.scss';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import ActionPanel from '../components/ActionPanelObjects';





const CaptureModal = (props) => {

  const [visible, setVisible] = useState(false);
  const [showCaptureData, setShowCaptureData] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [isInsprintHovered, setIsInsprintHovered] = useState(false);
  const [isUpgradeHovered, setIsUpgradeHovered] = useState(false);
  const [isPdfHovered, setIsPdfHovered] = useState(false);
  const [isCreateHovered, setIsCreateHovered] = useState(false);
  const [currentDialog, setCurrentDialog] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState(null);
  const [rowClick, setRowClick] = useState(true);
  const [selectedSpan, setSelectedSpan] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  



  

  const imageRef1 = useRef(null);
  const imageRef2 = useRef(null);
  const imageRef3 = useRef(null);
  const imageRef4 = useRef(null);
  
  const [cardPosition, setCardPosition] = useState({ left: 0,right:0, top: 0});
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    setShowCaptureData(CaptureData);
}, []);

  const togglePanel = () => {
    setShowPanel(!showPanel);
  };
 
 
  const headerTemplate = (
    <>
    <div>
      <h5 className='dailog_header1'>Capture Elements</h5>
      <h4 className='dailog_header2'>Signup screen 1</h4>
      <img className="screen_btn" src="static/imgs/ic-screen-icon.png" />
      {showCaptureData.length>1?<div className='Header__btn'>
    <button className='add__more__btn' onClick={()=>handleAddMore('add more')}>Add More</button>
    <button className='btn_panel' onClick={togglePanel}>Action Panel</button>
    <button className="btn-capture" onClick={()=>handleAddMore('capture')}>Capture Objects</button>
    </div>:<button className='btn_panel__single' onClick={togglePanel}>Action Panel</button>}
    </div>
  </>
  );

  const emptyMessage = (
    <div>
      <img className="not_captured_ele" src="static/imgs/ic-capture-notfound.png" alt="No data available" />
      <p className="not_captured_message">Not Captured</p>
      <button className="btn-capture-single">Capture Objects</button>
    </div>
  );

  const handleMouseEnter = (val) => {
    if(val==='insprint'){
    const rect = imageRef1.current.getBoundingClientRect();
    setCardPosition({ right: rect.right,left:rect.left, top: rect.top });
    setIsInsprintHovered(true);
    setIsUpgradeHovered(false);
    setIsPdfHovered(false);
  }
    else if(val==='upgrade'){
      const rect = imageRef2.current.getBoundingClientRect();
    setCardPosition({ right: rect.right, top: rect.top });
      setIsUpgradeHovered(true);
      setIsInsprintHovered(false);
      setIsPdfHovered(false);
    }
    else if(val==='pdf'){
      setIsInsprintHovered(false);
      setIsUpgradeHovered(false);
      const rect = imageRef3.current.getBoundingClientRect();
    setCardPosition({ right: rect.right, top: rect.top });
      setIsPdfHovered(true);
    }
    else {
      setIsInsprintHovered(false);
      setIsUpgradeHovered(false);
      setIsPdfHovered(false);
      const rect = imageRef4.current.getBoundingClientRect();
    setCardPosition({ right: rect.right, top: rect.top });
    setIsCreateHovered(true);
    }
  };

  const handleMouseLeave = (val) => {
    if(val==='insprint'){
    setIsInsprintHovered(false);
  }
  else if(val==='upgrade'){
    setIsUpgradeHovered(false);
  }
  else if(val==='pdf'){
    setIsPdfHovered(false);
  }
  else{
    setIsCreateHovered(false);
  }
  };



  const handleDialog = (id) => {
    setCurrentDialog(id);
  };

  const handleClose = () => {
    setCurrentDialog(null);
  };

  const handleSelectionChange = (e) => {
    setSelectedRows(e.value);
  };

  const handleAddMore = (id) =>{
    if(id==='add more'){
      setVisible(id);
    }
    else if(id==='capture'){
      setVisible(id)
    }
  }

  const footerCapture = (
    <div className='footer__capture'>
      <button className='btn_clr'>Clear</button>
      <button className='btn_capture'>Capture</button>
    </div>
  )

  const footerAddMore = (
    <div className='footer__addmore'>
      <button className='btn_clr'>Clear</button>
      <button className='btn_capture'>Capture</button>
      </div>
  )

  const CaptureData =[
    
    {selectall: 'user_id',
    objectproperty: 'textbox',
    browserscrape: 'google chrome',
    screenshots: 'view',
    actions: 'icons to be displayed',
  },
  {selectall: 'user_id',
    objectproperty: 'button',
    browserscrape: 'google chrome',
    screenshots: 'view',
    actions: 'icons to be displayed',
},
{selectall: 'user_id',
    objectproperty: 'email',
    browserscrape: 'google chrome',
    screenshots: 'view',
    actions: 'icons to be displayed',
  }

];

const renderEditDelete = (rowData) => {
  if (rowData.data) {
    return (
      <>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-secondary"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
        />
      </>
    );
  }
  return null;
};



const renderRowReorderIcon = (rowData) => {
  const isChecked = selectedRows.some((selectedRow) => selectedRow === rowData);

  if (isChecked) {
    return <i className="pi pi-bars"></i>;
  }

  return null;
};

const handleRowReorder = (event) => {
  setShowCaptureData(event.value);
};

const handleSpanClick = (index) => {
  if (selectedSpan === index) {
    setSelectedSpan(null);
  } else {
    setSelectedSpan(index);
  }
};

const handleRowHover = (rowData) => {
  setHoveredRow(rowData);
};

const renderIcons = (rowData) => {
  if (rowData === hoveredRow) {
    return( <div>
       <img src='static/imgs/ic-edit'/>
       <img src='static/imgs/ic-delete-bin'/>

    </div>);
  }
  return null;
};





  return (
    <>

      <Dialog className='dailog_box' header={headerTemplate} position='right' visible={props.visibleCaptureElement} style={{ width: '73vw', color: 'grey', height: '95vh', margin:0}} onHide={() => props.setVisibleCaptureElement(false)}>
        {showPanel && (<div className="card_modal">
          <Card className='panel_card'>
            <div className="action_panelCard">
              <div className='insprint__block'>
                <span className='insprint_auto' onClick={()=>handleDialog('addObject')}>
                  <img className='add_obj' title="add object" src="static/imgs/ic-add-object.png"></img>
                  <p>Add Object</p>
                </span>
                <span className='insprint_auto'>
                  <img className='map_obj' title='map object' src="static/imgs/ic-map-object.png" onClick={()=>handleDialog('mapObject')}></img>
                  <p>Map Object</p>
                </span>
                <p className='insprint__text'>In Sprint Automation</p>
                <img className='info__btn' ref={imageRef1}  onMouseEnter={()=>handleMouseEnter('insprint')} onMouseLeave={()=>handleMouseLeave('insprint')} src="static/imgs/info.png"></img>
                {isInsprintHovered && (<div className='card__insprint' style={{ position: 'absolute', right: `${cardPosition.right - 100}px`, top: `${cardPosition.top - 10}px`, display: 'block' }}>
                  <h3>InSprint Automation</h3>
                  <p className='text__insprint__info'>Malesuada tellus tincidunt fringilla enim, id mauris. Id etiam nibh suscipit aliquam dolor.</p>
                  <a>Learn More</a>
                </div>)}
              </div>
              <div className='upgrade__block'>
              <span className='upgrade_auto'>
                <img className='add_obj' src="static/imgs/ic-compare.png" onClick={()=>handleDialog('compareObject')}></img>
                <p>Compare Object</p>
                </span>
                <span className='upgrade_auto'>
                <img className='map_obj' src="static/imgs/ic-replace.png" onClick={()=>handleDialog('replaceObject')}></img>
                <p>Replace Onject</p>
                </span>
                <p className='insprint__text'>Upgrade Analyzer</p>
                <img className='info__btn' ref={imageRef2} onMouseEnter={()=>handleMouseEnter('upgrade')} onMouseLeave={()=>handleMouseLeave('upgrade')} src="static/imgs/info.png"></img>
                {isUpgradeHovered && (<div className='card__insprint' style={{ position: 'absolute', right: `${cardPosition.right - 400}px`, top: `${cardPosition.top - 10}px`, display: 'block' }}>
                  <h3>Upgrade Analyzer</h3>
                  <p className='text__insprint__info'>Malesuada tellus tincidunt fringilla enim, id mauris. Id etiam nibh suscipit aliquam dolor.</p>
                  <a href='docs.avoautomation.com'>Learn More</a>
                </div>)}
              </div>
              <div className='utility__block'>
              <span className='insprint_auto'>
                <img className='add_obj' src="static/imgs/ic-pdf-utility.png"></img>
                <p>PDF Utility</p>
              </span>
              <p className='insprint__text'>Capture from PDF</p>
              <img className='info__btn' ref={imageRef3}  onMouseEnter={()=>handleMouseEnter('pdf')} onMouseLeave={()=>handleMouseLeave('pdf')} src="static/imgs/info.png"></img>
              {isPdfHovered && (<div className='card__insprint' style={{ position: 'absolute', right: `${cardPosition.right - 700}px`, top: `${cardPosition.top - 10}px`, display: 'block' }}>
                  <h3>Capture from PDF</h3>
                  <p className='text__insprint__info'>Malesuada tellus tincidunt fringilla enim, id mauris. Id etiam nibh suscipit aliquam dolor.</p>
                  <a>Learn More</a>
                </div>)}
              </div>
              <div className='utility__block'>
              <span className='insprint_auto create__block'>
                <img className='map_obj' src="static/imgs/ic-create-object.png" onClick={()=>handleDialog('createObject')}></img>
                <p>Create Object</p>
              </span>
              <p className='insprint__text'>Create Manually</p>
              <img className='info__btn' ref={imageRef4}  onMouseEnter={()=>handleMouseEnter()} onMouseLeave={()=>handleMouseLeave()} src="static/imgs/info.png"></img>
              {isCreateHovered && (<div className='card__insprint' style={{ position: 'absolute', right: `${cardPosition.right - 950}px`, top: `${cardPosition.top - 10}px`, display: 'block' }}>
                  <h3>Create Manually</h3>
                  <p className='text__insprint__info'>Malesuada tellus tincidunt fringilla enim, id mauris. Id etiam nibh suscipit aliquam dolor.</p>
                  <a>Learn More</a>
                </div>)}
              </div>
              <div className='imp_exp__block'>
              <span className='insprint_auto'>
                <span className='import__block'>
                <img className='add_obj' src="static/imgs/ic-import.png" />
                <p className='imp__text'>Import Screen</p>
                </span>
                <span className='export__block'>
                <img className='add_obj' src="static/imgs/ic-export.png" />
                <p className='imp__text'>Export Screen</p>
                </span>
              </span>
              </div>
            </div>
          </Card>
        </div>)}
        <div className="card-table">

          <DataTable className='datatable__col' value={showCaptureData} dragHandleIcon="pi pi-bars" rowReorder resizableColumns reorderableRows onRowReorder={handleRowReorder} onRowHover={(e) => handleRowHover(e.originalEvent.target.parentElement)} showGridlines selectionMode={"multiple"} selection={selectedRows} onSelectionChange={handleSelectionChange} tableStyle={{ minWidth: '50rem' }} emptyMessage={emptyMessage} headerCheckboxToggleAllDisabled={false}>
          <Column style={{ width: '3em' }} body={renderRowReorderIcon} />
          <Column  headerStyle={{ width: '3rem' }} selectionMode='multiple'></Column>
            <Column field="selectall" header="Select all"></Column>
            <Column field="objectproperty" header="ObjectProperty"></Column>
            <Column field="browserscrape" header="Browser Scraped On"></Column>
            <Column field="screenshots" header="Screenshots"></Column>
            <Column field="actions" header="Actions" body={renderIcons} />
          </DataTable>
        </div>
      </Dialog>
 <Dialog className={visible==='capture'?"compare__object__note":"compare__object__modal"} header="Capture Object:Sign up screen 1" style={{height: "21.06rem",width: "24.06rem"}} visible={visible} onHide={()=>setVisible(false)} footer={visible==='capture'?footerCapture:footerAddMore}>
    <div className={visible==='capture'?"compare__content__adj":"compare__object"}>
      <span className='compare__btn'>
        <p className='compare__text'>All Browsers</p>
      </span>
      <span className='browser__col'>
      <span onClick={() => handleSpanClick(1)} className={selectedSpan === 1? 'browser__col__selected': 'browser__col__name'}><img className='browser__img' src='static/imgs/ic-explorer.png'></img>Internet Explorer {selectedSpan===1 && <img className='sel__tick' src='static/imgs/ic-tick.png'/>}</span>
        <span onClick={() => handleSpanClick(2)} className={selectedSpan === 2? 'browser__col__selected': 'browser__col__name'}><img className='browser__img' src='static/imgs/chrome.png'/>Google Chrome {selectedSpan===2 && <img className='sel__tick' src='static/imgs/ic-tick.png'/>}</span>
        <span onClick={() => handleSpanClick(3)} className={selectedSpan === 3? 'browser__col__selected': 'browser__col__name'}><img className='browser__img' src='static/imgs/fire-fox.png'/>Mozilla Firefox {selectedSpan===3 && <img className='sel__tick' src='static/imgs/ic-tick.png'/>}</span>
        <span onClick={() => handleSpanClick(4)}className={selectedSpan === 4? 'browser__col__selected': 'browser__col__name'} ><img className='browser__img' src='static/imgs/edge.png'/>Microsoft Edge {selectedSpan===4 && <img className='sel__tick' src='static/imgs/ic-tick.png'/>}</span>
        </span>
    </div>
   {visible==='capture' && <div className='recapture__note'><img className='not__captured' src='static/imgs/not-captured.png'/><span style={{paddingLeft: "0.2rem"}}><strong>Note :</strong>This will completely refresh all Captured Objects on the screen. In case you want Capture only additional elements use the "Add More" option</span></div>}
   </Dialog>
      {currentDialog==='addObject' && <ActionPanel isOpen={currentDialog} OnClose={handleClose}/>}
       {currentDialog==='mapObject' && <ActionPanel isOpen={currentDialog} OnClose={handleClose}/>}  
       {currentDialog==='replaceObject' && <ActionPanel isOpen={currentDialog} OnClose={handleClose}/>}
       {currentDialog==='createObject' && <ActionPanel isOpen={currentDialog} OnClose={handleClose}/>}
       {currentDialog==='compareObject' && <ActionPanel isOpen={currentDialog} OnClose={handleClose}/>}
    </>
  );
}

export default CaptureModal;