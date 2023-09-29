
import { React, useState, useRef } from 'react'
import { Dialog } from 'primereact/dialog';
import { CompareElementSuccessful } from '../designSlice';
import { Checkbox } from 'primereact/checkbox';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { CompareFlag } from '../designSlice';
import { Button } from "primereact/button";
import { useSelector, useDispatch } from "react-redux"
import { Toast } from "primereact/toast";
import { updateScreen_ICE } from '../api';
import {RedirectPage} from '../../global';
import { useNavigate } from 'react-router-dom';
import MapElement from './MapElement';
import { ImpactAnalysisScreenLevel } from '../designSlice';




function CompareElement(props) {
  const toast = useRef();
  const history = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.landing.userinfo);
  const impactAnalysisScreenLevel = useSelector(state => state.design.impactAnalysisScreenLevel);
  const { changedObj, notChangedObj, notFoundObj } = useSelector(state => state.design.compareObj);
  const compareData = useSelector(state => state.design.compareData);
  const compareFlag = useSelector(state => state.design.compareFlag);
  const [checked, setChecked] = useState([]);
  const toastErrorMsg = (errorMsg) => {
    toast.current.show({ severity: 'error', summary: 'Error', detail: errorMsg, life: 10000 });
  }
  // Comapre element action templates
  const accordinHedaerChangedElem = () => {
    return (
      <div style={{ marginLeft: '0.5rem' }} className='accordion-header__changedObj' >
        <Checkbox onChange={oncheckAll}
          checked={(checked.length > 0 && changedObj) ? (checked.every(
            (item) => item.checked === true
          ) && checked.length === changedObj.length) : false}
        />
        <span className='header-name__changedObj' style={{ marginLeft: '0.5rem' }}>Changed Elements</span>
      </div>
    );
  };

  const replaceHandler = () => {
    dispatch(ImpactAnalysisScreenLevel(true));
  }

  const accordinHedaernotFoundElem = () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

        <span className='header-name__changedObj' style={{ marginLeft: '0.5rem' }}>Not found Elements</span>
        <Button onClick={replaceHandler} label="Replace" className="update-btn" size="small" style={{ borderRadius: '3px' }} />

      </div>
    )
  }

  const compareElementfooter = (
    <div className=''>
      {changedObj && changedObj.length ? <Button onClick={() => updateObjects()} label="Update" className="update-btn" size="small" style={{ borderRadius: '3px' }} /> : <Button label='Cancel' size="small" className="update-btn" onClick={() => { dispatch(CompareFlag(false)) }} />}
    </div>
  )
  const onCheckCheckbox = (e) => {
    let _selectedCheckbox = [...checked];

    if (e.checked) _selectedCheckbox.push({ element: e.value, checked: true });
    else
      _selectedCheckbox = _selectedCheckbox.filter(
        (element) => element.element.custname !== e.value.custname
      );

    setChecked(_selectedCheckbox);
  };
  const updateObjects = () => {
    if (!checked.length) {
      toastErrorMsg('Please select element(s) to update properties.')
      return
    }
    let viewString = { ...props.mainScrapedData }
    let updatedObjects = [];
    let updatedIds = []
    let updatedCompareData = { ...compareData };

    checked.map((element, index) => {

      let id = viewString.view[updatedCompareData.changedobjectskeys[index]]._id

      updatedObjects.push({ ...updatedCompareData.view[0].changedobject[index], _id: id });
    })


    let arg = {
      'modifiedObj': updatedObjects,
      'screenId': props.screenId,
      'userId': userInfo.user_id,
      'roleId': userInfo.role,
      'param': 'saveScrapeData',
      'orderList': props.orderList
    };

    updateScreen_ICE(arg)
      .then(data => {
        if (data.toLowerCase() === "invalid session") return RedirectPage(history);
        if (data.toLowerCase() === 'success') {
          dispatch(CompareFlag(false))
          dispatch(CompareElementSuccessful(true))
        } else {
          toastErrorMsg('Error while updating elements.');

          dispatch(CompareFlag(false))
        }
      })
      .catch(error => console.error(error));
  }

  const oncheckAll = (e) => {
    let checked = []
    if (e.checked) {
      changedObj.map(element => checked.push({ element: element, checked: true }))
      setChecked(checked)

    }
    else {
      setChecked([])
    }

  }
  const Header = () => {
    return (
      <div>Compare Elements</div>
    );
  };
  return (
    <>
      <Toast ref={toast} position="bottom-center" baseZIndex={1200}></Toast>

      <Dialog className='create__object__modal' draggable={false} header={Header} style={{ height: "40rem", width: "50.06rem", marginRight: "6rem" }} visible={compareFlag} onHide={() => { dispatch(CompareFlag(false)) }} position='right' footer={compareElementfooter}>
        <Accordion multiple activeIndex={[0]}>
          {changedObj && changedObj.length && <AccordionTab contentClassName='' className="accordin__elem" header={accordinHedaerChangedElem()}>
            <div className='accordion_changedObj'>
              {changedObj.map((element, index) => (

                <div className="changed__elem" key={index} style={{ display: 'flex', gap: '0.5rem', marginLeft: '1.3rem' }}>
                  <Checkbox inputId={element.custname}
                    value={element}
                    onChange={onCheckCheckbox}
                    checked={checked.some(
                      (item) => item.element.custname === element.custname
                    )}
                  />
                  <p>{element.custname}</p>
                </div>))}
            </div>


          </AccordionTab>
          }

          {notFoundObj && notFoundObj.length && <AccordionTab contentClassName='' className="accordin__elem accordion__notfound" header={accordinHedaernotFoundElem()} >
            <div className='accordion_notfoundObj'>
              {notFoundObj.map((element, index) => (

                <div className="changed__elem" key={index} style={{ display: 'flex', gap: '0.5rem', marginLeft: '1.3rem' }}>
                  <p>{element.custname}</p>
                </div>

              ))}
            </div>
          </AccordionTab>
          }

          {notChangedObj && notChangedObj.length && <AccordionTab contentClassName='' className="accordin__compare" header="Unchanged Elements">
            <div className='accordion_unchangedObj'>
              {notChangedObj.map((element, index) => (

                <div className="changed__elem" style={{ display: 'flex', gap: '0.5rem', marginLeft: '1.3rem' }} key={index} >
                  <p>{element.custname}</p>
                </div>

              ))}
            </div>
          </AccordionTab>
          }
        </Accordion>
      </Dialog>
      {impactAnalysisScreenLevel && <MapElement
        isOpen={"mapObject"}
        onClose={props.onClose}
        setShow={props.setShow}
        toastSuccess={props.toastSuccess}
        toastError={props.toastError}
        orderList={props.orderList}
        fetchingDetails={props.fetchingDetails}
        fetchScrapeData={props.fetchScrapeData}
        elementTypeProp={props.elementTypeProp}
      ></MapElement>
      }
    </>
  )
}

export default CompareElement

