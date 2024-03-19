import React, { useEffect, useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { InputText } from "primereact/inputtext";
import DropDownList from '../../global/components/DropDownList';
import { getDetails_BROWSERSTACK } from '../api';
import { Messages as MSG, setMsg } from '../../global';
import AvoModal from '../../../globalComponents/AvoModal';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import 'primeicons/primeicons.css';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from "primereact/toast";
import { classNames } from 'primereact/utils';


const BrowserstackLogin = React.memo(({ setLoading, displayBasic6, onHidedia, handleBrowserstackSubmit, setBrowserstackUser, browserstackValues, setBrowserstackValues }) => {

  const [isEmpty, setIsEmpty] = useState(false);
  const getBrowserstackDetails = async () => {
    try {
      setLoading("Loading...")
      const data = await getDetails_BROWSERSTACK()
      if (data.error) { setMsg(data.error); return; }
      if (data !== "empty") {
        setIsEmpty(true);
        setBrowserstackValues(data);
        setBrowserstackUser(data);
      } else {
        setIsEmpty(false);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setMsg(MSG.GLOBAL.ERR_SOMETHING_WRONG);
    }
  }
  useEffect(() => {
    getBrowserstackDetails();
  }, [])
  return (
    <>
      <AvoModal id='Browserstack_dialog' header='Browserstack login' visible={displayBasic6}
        onModalBtnClick={() => onHidedia('displayBasic6')}
        content={
          <>
            <form id='Browserstack-form'>
              <div className='Browserstack_input'>
                <div className="flex flex-row">
                  {/* <FormInput value={defaultValues.BrowserstackURL} type="text" id="Browserstack-URL"
                                name="Browserstack-URL"
                                placeholder="Enter Saucelabs Remote URL"
                                onChange={(event) => {
                                    setDefaultValues({ ...defaultValues, BrowserstackURL: event.target.value })
                                }}
                                className="saucelabs_input" /> */}
                </div>
                <div className="flex flex-row">
                  <InputText value={browserstackValues.BrowserstackUsername} type="text" id="Browserstack-username" name="Browserstack-username" placeholder="Enter Browserstack username"
                    onChange={(event) => {
                      setBrowserstackValues({ ...browserstackValues, BrowserstackUsername: event.target.value })
                    }}
                    className="Browserstack_input_URL" />
                </div>
                <div className="flex flex-row">
                  <InputText value={browserstackValues.Browserstackkey} type="text" id="Browserstack-API" name="Browserstack-API" placeholder="Enter Browserstack Access key"
                    onChange={(event) => {
                      setBrowserstackValues({ ...browserstackValues, Browserstackkey: event.target.value })
                    }}
                    className="Borwserstack_input_Accesskey" />
                </div>
                <div>
                  {isEmpty && browserstackValues.BrowserstackUsername && browserstackValues.Browserstackkey ? "" : <div data-test="intg_log_error_span" className="Browserstack_ilm__error_msg">Save Credentials in Settings for Auto Login </div>}
                </div>
              </div>
            </form>

            <Button id='Saucelabs_submit' label="Submit"
              onClick={() => handleBrowserstackSubmit(browserstackValues)}
            //activeIndex !== 1?browserstackValues:browserstackValuesPrallel
            />
          </>} headerTxt='BrowserStack login' modalSytle={{
            width: "39vw",
            height: "44vh",
            background: "#FFFFFF",
            minWidth: "38rem",
          }} />


    </>
  )
});
const BrowserstackExecute = React.memo(({ browserstackBrowserDetails, selectProjects, mobileDetailsBrowserStack, displayBasic7, onHidedia, changeLable, poolType, ExeScreen, inputErrorBorder, setInputErrorBorder,
  smartMode, selectedICE, setSelectedICE, availableICE, dataExecution, browserlist, CheckStatusAndExecute, iceNameIdMap, browserstackUser, showBrowserstack, setBrowserstackValues, browserstackValues, setSelectedTab, selectedTab }) => {
  const [newOsNames, setNewOsNames] = useState([])
  const [selectedOS, setSelectedOS] = useState('');
  const [selectedOS1, setSelectedOS1] = useState('');
  const [browserstackOsVersion, setBrowserstackOsVersion] = useState([]);
  const [browserstackOsVersion2, setBrowserstackOsVersion2] = useState([]);
  const [selectedOsVersions, setSelectedOsVersions] = useState('');
  const [selectedOsVersions1, setSelectedOsVersions1] = useState('');
  const [selectedBrowserVersions, setSelectedBrowserVersions] = useState('');
  const [selectedBrowserVersions1, setSelectedBrowserVersions1] = useState('');
  const [browserstackBrowsers, setBrowserstackBrowsers] = useState([]);
  const [browserstackBrowsers2, setBrowserstackBrowsers2] = useState([]);
  const [selectedBrowserVersionsDetails, setSelectedBrowserVersionsDetails] = useState('');
  const [selectedBrowserVersionsDetails1, setSelectedBrowserVersionsDetails1] = useState('');
  const [selectedBrowserVerionDetails, setselectedBrowserVerionDetails] = useState([]);
  const [selectedBrowserVerionDetails2, setselectedBrowserVerionDetails2] = useState([]);
  const [selectedMobilePlatforms, setSelectedMobilePlatforms] = useState('');
  const [selectedMobileVersion, setSelectedMobileVersion] = useState('');
  const [selectedDevices, setSelectedDevices] = useState('');
  const [selectDevices, setDevices] = useState([]);
  const [selectPlatforms, setPlatforms] = useState([]);
  const [mobileVersion, setMobileVersion] = useState([]);
  const [selectApk, setSelectApk] = useState('');
  const [selectedApk, setApk] = useState([]);
  const [selectApkId, setSelectApkId] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [index1, setIndex1] = useState(false);
  const [index2, setIndex2] = useState(false);
  const [count, setCount] = useState(0);
  const [data1, setData1] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [editingRows, setEditingRows] = useState([]);
  let emptyrow = {
    id: "",
    osname: "",
    osversion: "",
    browsername: "",
    browserversion: "",
  };

  const [config, setConfig] = useState([]);
  const toast = useRef(null);
  useEffect(() => {
    setNewOsNames([]);
    setselectedBrowserVerionDetails([]);
    setBrowserstackOsVersion([]);
    setBrowserstackBrowsers([]);
    setSelectedBrowserVersions('');
    setSelectedOsVersions('');
    setSelectedOS('');
    setSelectedBrowserVersionsDetails('');
    setSelectedMobilePlatforms('');
    setSelectedMobileVersion('');
    setSelectedDevices('');
    setSelectApk('');
    setDevices([]);
    setPlatforms([]);
    setApk([]);

    if (Object.keys(browserstackBrowserDetails).length) {
      const osNamesArray = Object.entries(browserstackBrowserDetails.os_names).map(([key, value], index) => ({
        key: key,
        text: key,
        title: key,
        index: index,
        versions: value,
      }));

      setNewOsNames(osNamesArray);
          setBrowserstackOsVersion(
        Object.entries(browserstackBrowserDetails.os_names).map(([key, value], index) => ({
          key: key,
          text: key,
          title: key,
          index: index,
        })
        ));
    }

    if (mobileDetailsBrowserStack && Object.keys(mobileDetailsBrowserStack).length) {
      const platformArray = Object.entries(mobileDetailsBrowserStack.devices).map(([key, value], index) => ({
        key: key,
        text: key,
        title: key,
        index: index,
        versions: value,
        name: value,
      }));
      let findapk = Object.keys(mobileDetailsBrowserStack.stored_files).map((element, index) => ({
        key: element,
        text: element,
        title: element,
        index: element,
        versions: element,
        name: element,
        id: mobileDetailsBrowserStack.stored_files[element],
      }))
      setApk(findapk);
      setPlatforms(platformArray);
    }
  }, [browserstackBrowserDetails, mobileDetailsBrowserStack]);

  const onOsChange = async (option) => {
      setselectedBrowserVerionDetails([]);
    setBrowserstackOsVersion([]);
    setBrowserstackBrowsers([]);
    setSelectedBrowserVersions('');
    setSelectedOsVersions('');
    setSelectedBrowserVersionsDetails('');
    setSelectedOS(option.key);
    setIndex1(true);
    setIndex2(true)
    let arrayOS_names = [];
    if (browserstackBrowserDetails.os_names[option.key]?.length) {
      let getValue = browserstackBrowserDetails.os_names[option.key];
      arrayOS_names = getValue.map((element, index) => ({
        key: element,
        text: element,
        title: element,
        index: index
      }));
    }

    setBrowserstackOsVersion(arrayOS_names);
  };
  const onOsChange1 = async (option) => {
        setselectedBrowserVerionDetails2([]);
    setBrowserstackOsVersion2([]);
    setBrowserstackBrowsers2([]);
    setSelectedBrowserVersions1('');
    setSelectedOsVersions1('');
    setSelectedBrowserVersionsDetails1('');
    setSelectedOS1(option.key);
    //setIndex1(true);
    setIndex2(true);
    let arrayOS_names = [];
    if (browserstackBrowserDetails.os_names[option.key]?.length) {
      let getValue = browserstackBrowserDetails.os_names[option.key];
      arrayOS_names = getValue.map((element, index) => ({
        key: element,
        text: element,
        title: element,
        index: index
      }));
    }

    setBrowserstackOsVersion2(arrayOS_names);
  };
  const onOsVersionChange = (option) => {
    setBrowserstackBrowsers([])
    setselectedBrowserVerionDetails([])
    setSelectedBrowserVersions('')
    setSelectedOsVersions(option.key)
    let arrayBrowser = []
    let os_name = selectedOS.concat(" ", option.key);
    if (Object.entries(browserstackBrowserDetails.browser).length) {
      Object.entries(browserstackBrowserDetails.browser).forEach(([browser, os_version]) => {
        Object.entries(os_version).forEach(([os_version_key, browser_version]) => {
          if (os_version_key === os_name) {
            arrayBrowser.push({
              key: browser,
              text: browser,
              title: browser
            });
          }
        });
      });
    }
    setBrowserstackBrowsers(arrayBrowser)
  }
  const onOsVersionChange1 = (option) => {
    setBrowserstackBrowsers2([])
    setselectedBrowserVerionDetails2([])
    setSelectedBrowserVersions1('')
    setSelectedOsVersions1(option.key)
    let arrayBrowser = []
    let os_name = selectedOS1.concat(" ", option.key);
    if (Object.entries(browserstackBrowserDetails.browser).length) {
      Object.entries(browserstackBrowserDetails.browser).forEach(([browser, os_version]) => {
        Object.entries(os_version).forEach(([os_version_key, browser_version]) => {
          if (os_version_key === os_name) {
            arrayBrowser.push({
              key: browser,
              text: browser,
              title: browser
            });
          }

        });
      });
    }
    setBrowserstackBrowsers2(arrayBrowser)
  }
  const onBrowserSelect = (option) => {
    setselectedBrowserVerionDetails([])
    setSelectedBrowserVersionsDetails('')
    setSelectedBrowserVersions('')
    setSelectedBrowserVersions(option.key)
    let arrayBrowserVersion = []
    let os_name = selectedOS.concat(" ", selectedOsVersions);
    if (Object.entries(browserstackBrowserDetails.browser[option.key]).length) {
      if (Object.entries(browserstackBrowserDetails.browser[option.key][os_name]).length) {
        browserstackBrowserDetails.browser[option.key][os_name].forEach((element, index) => {
          arrayBrowserVersion.push({
            key: element,
            text: element,
            title: element,
            index: index
          });
        });
      }
    }
    setselectedBrowserVerionDetails(arrayBrowserVersion.sort((a, b) => {
      return Number(b.key) - Number(a.key);
    }));
  }
  const onBrowserSelect1 = (option) => {
    setselectedBrowserVerionDetails2([])
    setSelectedBrowserVersionsDetails1('')
    setSelectedBrowserVersions1('')
    setSelectedBrowserVersions1(option.key)
    let arrayBrowserVersion = []
    let os_name = selectedOS1.concat(" ", selectedOsVersions1);
    if (Object.entries(browserstackBrowserDetails.browser[option.key]).length) {
      if (Object.entries(browserstackBrowserDetails.browser[option.key][os_name]).length) {
        browserstackBrowserDetails.browser[option.key][os_name].forEach((element, index) => {
          arrayBrowserVersion.push({
            key: element,
            text: element,
            title: element,
            index: index
          });
        });
      }
    }
    setselectedBrowserVerionDetails2(arrayBrowserVersion.sort((a, b) => {
      return Number(b.key) - Number(a.key);
    }));
  }
  const onBrowserVersionChange = (option) => {
    setSelectedBrowserVersionsDetails(option.key)
  }
  const onBrowserVersionChange1 = (option) => {
    setSelectedBrowserVersionsDetails1(option.key)
  }

  const onMobilePlatformChange = async (option) => {
    setSelectedMobilePlatforms(option.key)
    setSelectedMobileVersion('')
    setSelectedDevices('')
    setDevices([])
    let findVersions = Object.keys(mobileDetailsBrowserStack.devices[option.key]).map((element, index) => ({
      key: element,
      text: element,
      title: element,
      index: index,
      name: element,
    }))
    setMobileVersion(findVersions);
  }

  const onMobileVersionChange = (option) => {
       setSelectedMobileVersion(option.key);
    setSelectedDevices('')
    setDevices([])
    let findDevices = Object.values(mobileDetailsBrowserStack.devices[selectedMobilePlatforms][option.key]).map((element, index) => ({
      key: element,
      text: element,
      title: element,
      index: index,
      name: element,
    }))
    setDevices(findDevices);
  }

  const onDeviceChange = async (option) => {
    setSelectedDevices(option.key)
  }

  const onApkChange = async (option) => {
    setSelectApk(option.key)
    setSelectApkId(option.id)
  }
  const headerTemplate = () => {
    return (
      <div>
        <img
          alt="icon"
          src="./static/imgs/browserstack_icon.svg"
          style={{ width: '1rem', marginRight: '0.5rem' }}
        />
        Browserstack Integration
      </div>
    );
  };
  const onEditClick = (rowData) => {
    const isEditing = editingRows.includes(rowData);
    setEditingRows((prevEditingRows) => (isEditing ? prevEditingRows.filter(row => row !== rowData) : [...prevEditingRows, rowData]));
  };

  const onRowEditSave = (event) => {
    setEditingRows([]);
  };
  const actionTemplate = (rowData) => (
    <div>
      <button onClick={() => onEditClick(rowData)}> <img src="static/imgs/ic-edit.png"
        style={{ height: "20px", width: "20px" }}
        className=" pencil_button p-button-edit"
      /></button>
      <button> <img
        src="static/imgs/ic-delete-bin.png"
        style={{ height: "20px", width: "20px" }}
        className="trash_button p-button-edit" label="Bottom"
        onClick={() => confirmDelete(rowData)} /> </button>
    </div>
  );

  const confirmDelete = (rowData) => {
    confirmDialog({
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      acceptClassName: 'p-button-danger',
      accept: () => {
        deleteRow(rowData);
      },
      reject: () => { },
    });
  };
  const deleteRow = (rowDataToDelete) => {
      const updatedData = data1.filter((rowData) => rowData !== rowDataToDelete);
    setData1(updatedData);
  };
  const handleIncrement = () => {
    setCount(count + 1);
  };

  const handleDecrement = () => {
    setCount(count - 1);
  };
  const handleTabChange = (e) => {
    setActiveIndex(e.index);
       if (activeIndex == 1) {
      setSelectedTab("Parallel Execution");
    }
  }
  const handleAddClick = (count) => {
    setData1([...data1, ...Array(count)])
    const addedRows = [];
    for (let i = 0; i < count; i++) {
      const newRow = { ...emptyrow, id: config.length + i, };
      addedRows.push(newRow);
    }

    setConfig([...config, ...addedRows]);
  };

  return (
    <>
      <AvoModal customClass='browserstack_modal' header={headerTemplate}
        visible={displayBasic7} onModalBtnClick={() => onHidedia('displayBasic7')}
        content={
          <>
            <div className="center-continer-cls">
              <TabView activeIndex={activeIndex} onTabChange={(e) => handleTabChange(e)} classname="tab_cls">
                <TabPanel header="Normal Execution" rightIcon="pi pi-info-circle ml-2">
                  <div classname="normal-exicution_cls" style={{ border: '2px solid #EEE', borderRadius: "5px" }}>
                    <h4 className='m-2 ml-3'>Select Combinations <span style={{ fontSize: '1em', color: "red", marginLeft: "-5px" }}>*</span></h4>
                    {!showBrowserstack && (
                      <div className="dropdown-container m-2">
                        <div>
                          <div className='os_name'><h5>Operating Systems</h5></div>
                          <Dropdown
                            onChange={(e) => onOsChange(e.value)}
                            options={newOsNames}
                            value={selectedOS}
                            valueTemplate={selectedOS}
                            filter
                            optionLabel='key'
                            placeholder='select OS'
                            className='browserstack_dropdown'
                          />
                        </div>
                        <div>
                          <div className='os_name'><h5>Operating Systems Versions</h5></div>
                          <Dropdown
                            disabled={selectedOS == ''}
                            onChange={(e) => onOsVersionChange(e.target.value)}
                            options={browserstackOsVersion}
                            value={selectedOsVersions}
                            valueTemplate={selectedOsVersions}
                            filter
                            optionLabel='key'
                            placeholder='select OS Versions'
                            className='browserstack_dropdown'
                          />
                        </div>

                        <div>
                          <div className='os_name'><h5>Browsers</h5></div>
                          <Dropdown
                            disabled={selectedOsVersions == ''}
                            onChange={(e) => onBrowserSelect(e.value)}
                            options={browserstackBrowsers}
                            value={selectedBrowserVersions}
                            filter
                            valueTemplate={selectedBrowserVersions}
                            optionLabel='key'
                            placeholder='select Browsers'
                            className='browserstack_dropdown'
                          />
                        </div>
                        <div>
                          <div className='os_name'><h5>Browser Versions</h5></div>
                          <Dropdown
                            disabled={selectedBrowserVersions == ''}
                            onChange={(e) => onBrowserVersionChange(e.value)}
                            options={selectedBrowserVerionDetails}
                            value={selectedBrowserVersionsDetails}
                            valueTemplate={selectedBrowserVersionsDetails}
                            filter
                            optionLabel='key'
                            placeholder='select Browser Versions'
                            className='browserstack_dropdown'
                          />
                        </div>
                      </div>
                    )}
                    {index1 ? (<div className='pi-check-bg'> <i class="pi pi-check" style={{ position: 'relative', top: '-1px', color: '#FFF', padding: "1px" }}  > </i></div>) :
                      (<i class="pi pi-circle" style={{ fontSize: "1.25rem", color: "#6366F1", position: "relative", top: "-78px", left: "-27px" }}>
                        <span style={{ position: "relative", left: "-14px", fontSize: "15px", top: "-4px" }}>1</span></i>)
                    }
                    <div className='progress-bar'></div>
                    {selectedICE ? (<div className='pi-check-bg' style={{ top: "111px" }}> <i class="pi pi-check" style={{ position: 'relative', top: '-1px', color: '#FFF', padding: "1px" }}  > </i></div>)
                      : (<i class="pi pi-circle" style={{ fontSize: "1.25rem", color: "#6366F1", position: "relative", top: "111px", left: "-27px" }}>
                        <span style={{ position: "relative", left: "-14px", fontSize: "15px", top: "-4px" }}>2</span></i>)
                    }
                  </div>
                </TabPanel>

                <TabPanel header="Parallel Execution" rightIcon="pi pi-info-circle ml-2" className="Parllel_cls">
                  <div>
                    <div className="counter_cls">
                      <div>
                        <p style={{ padding: '10px 5px', color: '#000', background: '#FFF', textAlign: 'center' }}>{count}</p>
                        <p>Add rows</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', height: '30px' }}>
                        <Button
                          icon="pi pi-caret-up"
                          className={classNames({ 'p-disabled': count === 10 })}
                          onClick={handleIncrement} style={{ color: '#000', border: 'none' }}
                        />
                        <Button
                          icon="pi pi-caret-down"
                          className={classNames({ 'p-disabled': count === 0 })}
                          onClick={handleDecrement} style={{ color: '#000', border: 'none' }}
                        />
                      </div>
                      <div>
                        <Button icon="pi pi-plus-circle" onClick={() => handleAddClick(count)} />
                        <div>Add</div>
                      </div>
                    </div>
                    <div className="table_cls">
                      <Toast ref={toast} />
                      <ConfirmDialog />

                      <DataTable value={data1} showGridlines editMode="row" editingRows={editingRows} onRowEditSave={onRowEditSave}>
                        <Column field="os" header="Operating System" body={() => (
                          <>
                            {!showBrowserstack && <>

                              <Dropdown
                                // noItemsText={[]}
                                onChange={(e) => onOsChange1(e.value)} options={newOsNames}
                                value={selectedOS1}
                                valueTemplate={selectedOS1}
                                filter
                                // width='15rem'
                                optionLabel='key'
                                placeholder='select OS'
                                className='browserstack_dropdown'
                              // calloutMaxHeight='12rem'
                              />

                            </>}
                          </>
                        )} />
                        <Column field="osVersion" header="Operating System Version" body={() => (
                          <>  {!showBrowserstack &&
                            <Dropdown
                              // noItemsText={[]}
                              disabled={selectedOS1 == ''}
                              onChange={(e) => onOsVersionChange1(e.value)}
                              options={browserstackOsVersion2}
                              value={selectedOsVersions1}
                              valueTemplate={selectedOsVersions1}
                              filter
                              optionLabel='key'
                              placeholder='select OS Versions'
                              className='browserstack_dropdown'
                            // calloutMaxHeight='12rem'
                            />
                          }</>
                        )} />

                        <Column field="browser" header="Browser" body={() => (<>
                          {!showBrowserstack && <>
                            <Dropdown
                              // noItemsText={[]}
                              disabled={selectedOsVersions1 == ''}
                              onChange={(e) => onBrowserSelect1(e.value)}
                              options={browserstackBrowsers2}
                              value={selectedBrowserVersions1}
                              filter
                              valueTemplate={selectedBrowserVersions1}
                              // width='15rem'
                              optionLabel='key'
                              placeholder='select Browsers'
                              className='browserstack_dropdown'
                            // calloutMaxHeight='12rem'
                            />
                          </>}
                        </>)} />
                        <Column field="browserVersion" header="Browser Version" body={() => (<>
                          {!showBrowserstack && <>
                            <Dropdown
                              // noItemsText={[]}
                              disabled={selectedBrowserVersions1 == ''}
                              onChange={(e) => onBrowserVersionChange1(e.value)}
                              options={selectedBrowserVerionDetails2}
                              value={selectedBrowserVersionsDetails1}
                              valueTemplate={selectedBrowserVersionsDetails1}
                              filter
                              // width='15rem'
                              optionLabel='key'
                              placeholder='select Browser Versions'
                              className='browserstack_dropdown'
                            // calloutMaxHeight='10rem'
                            />
                          </>}
                        </>)} />
                        <Column field="action" header="Action" body={actionTemplate} />
                      </DataTable>
                    </div>
                    {index2 ? (<div className='pi-check2-bg'> <i class="pi pi-check" style={{ position: 'relative', top: '-1px', color: '#FFF', padding: "1px" }}  > </i></div>) :
                      (<i class="pi pi-circle" style={{ fontSize: "1.25rem", color: "#6366F1", position: "absolute", top: "150px", left: "-5px" }}>
                        <span style={{ position: "relative", left: "-14px", fontSize: "15px", top: "-4px" }}>1</span></i>)
                    }
                    <div className='progress-bar2'></div>
                    {selectedICE ? (<div className='pi-check2-bg'> <i class="pi pi-check" style={{ position: 'relative', top: '-1px', color: '#FFF', padding: "1px" }}  > </i></div>)
                      : (<i class="pi pi-circle" style={{ fontSize: "1.25rem", color: "#6366F1", position: "relative", top: "90px", left: "-25px" }}>
                        <span style={{ position: "relative", left: "-14px", fontSize: "15px", top: "-4px" }}>2</span></i>)
                    }
                  </div>
                </TabPanel>
              </TabView>
            </div>

            {/* {!showBrowserstack && <>
                            <div className='os_name'><h3>Platform</h3></div>
                            <Dropdown
                                onChange={(e) => onMobilePlatformChange(e.value)}
                                options={selectPlatforms}
                                value={selectedMobilePlatforms}
                                filter
                                valueTemplate={selectedMobilePlatforms}
                                optionLabel='key'
                                placeholder='select platform'
                                className='browserstack_dropdown'
                            />
                        </>}

                        {!showBrowserstack && <>
                            <div className='os_name'><h3>Versions</h3></div>
                            <Dropdown
                                disabled={selectedMobilePlatforms == ''}
                                onChange={(e) => onMobileVersionChange(e.value)}
                                options={mobileVersion}
                                value={selectedMobileVersion}
                                filter
                                valueTemplate={selectedMobileVersion}
                                optionLabel='key'
                                placeholder='select version'
                                className='browserstack_dropdown'
                            />
                        </>} */}

            {showBrowserstack && <>
              <div className='os_name'><h3>devices</h3></div>
              <Dropdown
                disabled={selectedMobileVersion == ''}
                onChange={(e) => onDeviceChange(e.value)}
                options={selectDevices}
                value={selectedDevices}
                filter
                valueTemplate={selectedDevices}
                optionLabel='key'
                placeholder='select device'
                className='browserstack_dropdown'
              />
            </>}
            {selectProjects === 'MobileApp' && <>
              <div className='os_name'><h3>uploaded apk</h3></div>
              <Dropdown
                disabled={selectedDevices == ''}
                onChange={(e) => onApkChange(e.value)}
                options={selectedApk}
                value={selectApk}
                filter
                valueTemplate={selectApk}
                optionLabel='key'
                placeholder='select apk'
                className='browserstack_dropdown'
              // className="w-full md:w-10rem"
              />
            </>}
            <div style={{ padding: "0px 20px ", marginTop: "16px" }}>
              <div className="ice_container">
                <div className="ice_status">
                  <span className="status">Status:</span>
                  <span className="available"></span>
                  <span>Available</span>
                  <span className="unavailable"></span>
                  <span>Unavailable</span>
                  <span className="dnd"></span>
                  <span>Do Not Disturb</span>
                </div>
                <h4 >Select Avo Assure Client  to start the exicution <span style={{ fontSize: '1em', color: "red", marginLeft: "-5px" }}>*</span></h4>
                <div>
                  <h5>Avo Assure Client</h5>
                  <DropDownList
                    poolType={poolType}
                    ExeScreen={ExeScreen}
                    inputErrorBorder={inputErrorBorder}
                    setInputErrorBorder={setInputErrorBorder}
                    placeholder={"Search"}
                    data={availableICE}
                    smartMode={ExeScreen === true ? smartMode : ""}
                    selectedICE={selectedICE}
                    setSelectedICE={setSelectedICE}
                    className="saucelabs_ICE "
                  />
                </div>
              </div>
            </div>
            <div style={{ backgroundColor: 'FAFAFA' }}>

              <Button label="Execute" title="Execute" className="Sacuelab_execute_button" disabled={selectedICE == ''} onClick={async () => {
                dataExecution.type = (ExeScreen === true ? ((smartMode === "normal") ? "" : smartMode) : "")
                dataExecution.poolid = ""
                if ((ExeScreen === true ? smartMode : "") !== "normal") dataExecution.targetUser = Object.keys(selectedICE).filter((icename) => selectedICE[icename]);
                else dataExecution.targetUser = selectedICE
                dataExecution['executionEnv'] = 'browserstack'
                dataExecution['browserstackDetails'] = browserstackUser && browserstackValues;
                               if (!showBrowserstack) {
                  dataExecution['os'] = selectedOS;
                  dataExecution['osVersion'] = selectedOsVersions;
                  dataExecution['browserVersion'] = selectedBrowserVersionsDetails
                  dataExecution['browserName'] = selectedBrowserVersions;
                  dataExecution["browserType"] = [browserlist.filter((element, index) => element.text == selectedBrowserVersions)[0].key]
                } else {
                  dataExecution["browserType"] = ['1']
                  dataExecution['mobile'] = {
                    "platformName": selectedMobilePlatforms,
                    "deviceName": selectedDevices,
                    "platformVersion": selectedMobileVersion,
                    "uploadedApk": selectApkId,
                    "browserName": "Chrome"

                  }
                }
                CheckStatusAndExecute(dataExecution, iceNameIdMap);
                // setSelectdBsd(dataExecution);
                setNewOsNames([]);
                setSelectedOS('');
                onHidedia('displayBasic7');
              }
              }
                autoFocus />
              <Button id='Saucelabs_cancel' text className='Saucelabs_cancel' size='small' label="Cancel" onClick={() => onHidedia('displayBasic7')} />

            </div>
          </>}
        headerTxt='BrowserStack Integration' modalSytle={{
          // width: "65vw",
          height: "auto",
          background: "#FFFFFF",
        }}

      />
    </>
  )
})
export { BrowserstackLogin, BrowserstackExecute };