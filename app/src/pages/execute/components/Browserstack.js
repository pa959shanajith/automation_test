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
import "../styles/ConfigurePage.scss";
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
  const [visible, setVisible] = useState(false);
  const [rowToDelete, setRowToDelete] = useState({});
  const [editingRows, setEditingRows] = useState([]);
  const [config, setConfig] = useState([]);
  const [editModes, setEditModes] = useState(Array(config.length).fill(false));
  const [clickedRow, setClickedRow] = useState({});
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
      const osNamesArray = Object.entries(browserstackBrowserDetails.os_names).map(([key, value]) => ({
        name: key,
        code: key,
        key: key,
        versions: value
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

  // Functions related to Normal Execution
  // const onOsChange = async (option) => {
  //   setselectedBrowserVerionDetails([]);
  //   setBrowserstackOsVersion([]);
  //   setBrowserstackBrowsers([]);
  //   setSelectedBrowserVersions('');
  //   setSelectedOsVersions('');
  //   setSelectedBrowserVersionsDetails('');
  //   setSelectedOS(option.key);
  //   setIndex1(true);
  //   setIndex2(true)
  //   let arrayOS_names = [];
  //   if (browserstackBrowserDetails.os_names[option.key]?.length) {
  //     let getValue = browserstackBrowserDetails.os_names[option.key];
  //     arrayOS_names = getValue.map((element, index) => ({
  //       key: element,
  //       text: element,
  //       title: element,
  //       index: index
  //     }));
  //   }

  //   setBrowserstackOsVersion(arrayOS_names);
  // };

  const onOsChange_Normal = async (option) => {
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

  // const onOsVersionChange = (option) => {
  //   setBrowserstackBrowsers([])
  //   setselectedBrowserVerionDetails([])
  //   setSelectedBrowserVersions('')
  //   setSelectedOsVersions(option.key)
  //   let arrayBrowser = []
  //   let os_name = selectedOS.concat(" ", option.key);
  //   if (Object.entries(browserstackBrowserDetails.browser).length) {
  //     Object.entries(browserstackBrowserDetails.browser).forEach(([browser, os_version]) => {
  //       Object.entries(os_version).forEach(([os_version_key, browser_version]) => {
  //         if (os_version_key === os_name) {
  //           arrayBrowser.push({
  //             key: browser,
  //             text: browser,
  //             title: browser
  //           });
  //         }
  //       });
  //     });
  //   }
  //   setBrowserstackBrowsers(arrayBrowser)
  // }

  const onOsVersionChange_Normal = (option) => {
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

  // const onBrowserSelect = (option) => {
  //   setselectedBrowserVerionDetails([])
  //   setSelectedBrowserVersionsDetails('')
  //   setSelectedBrowserVersions('')
  //   setSelectedBrowserVersions(option.key)
  //   let arrayBrowserVersion = []
  //   let os_name = selectedOS.concat(" ", selectedOsVersions);
  //   if (Object.entries(browserstackBrowserDetails.browser[option.key]).length) {
  //     if (Object.entries(browserstackBrowserDetails.browser[option.key][os_name]).length) {
  //       browserstackBrowserDetails.browser[option.key][os_name].forEach((element, index) => {
  //         arrayBrowserVersion.push({
  //           key: element,
  //           text: element,
  //           title: element,
  //           index: index
  //         });
  //       });
  //     }
  //   }
  //   setselectedBrowserVerionDetails(arrayBrowserVersion.sort((a, b) => {
  //     return Number(b.key) - Number(a.key);
  //   }));
  // }

  const onBrowserSelect_Normal = (option) => {
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

  const onBrowserVersionChange_Normal = (option) => {
    setSelectedBrowserVersionsDetails(option.key)
  }

  // Functions related to Parallel Execution
  const onOsChange_Parallel = async (option, { field, rowIndex }) => {
    setselectedBrowserVerionDetails2([]);
    // setBrowserstackOsVersion2([]);
    setBrowserstackBrowsers2([]);
    setSelectedBrowserVersions1('');
    setSelectedOsVersions1('');
    setSelectedBrowserVersionsDetails1('');
    setSelectedOS1(option.name);
    setIndex2(true);

    let arrayOS_names = [];
    if (browserstackBrowserDetails.os_names[option.name]?.length) {
      let getValue = browserstackBrowserDetails.os_names[option.name];
      arrayOS_names = getValue.map((element) => ({
        name: element,
        code: element
      }));
    }

    setConfig(prev => {
      return prev.map((item, index) => {
        if (index === rowIndex) {
          return {
            id: index, osname: option.name, osversion: "", browsername: "", browserversion: "",
          };
        }
        return item;
      });
    });

    setBrowserstackOsVersion2(arrayOS_names);
  };

  const onOsVersionChange_Parallel = (option, { field, rowIndex }) => {
    // setBrowserstackBrowsers2([]);
    setselectedBrowserVerionDetails2([]);
    setSelectedBrowserVersions1('');
    // setBrowserstackOsVersion2([]);
    setSelectedOsVersions1(option.name);

    let arrayBrowser = []
    let os_name = selectedOS1.concat(" ", option.name);
    if (Object.entries(browserstackBrowserDetails.browser).length) {
      Object.entries(browserstackBrowserDetails.browser).forEach(([browser, os_version]) => {
        Object.entries(os_version).forEach(([os_version_key, browser_version]) => {
          if (os_version_key === os_name) {
            arrayBrowser.push({
              name: browser,
              code: browser
            });
          }
        });
      });
    }

    setConfig(prev => {
      return prev.map((item, index) => {
        if (index === rowIndex) {
          return { ...item, [field]: option.name };
        }
        return item;
      });
    });

    setBrowserstackBrowsers2(arrayBrowser);
  };

  const onBrowserSelect_Parallel = (option, { field, rowIndex }) => {
    // setselectedBrowserVerionDetails2([])
    setSelectedBrowserVersionsDetails1('')
    setSelectedBrowserVersions1('')
    setSelectedBrowserVersions1(option.name)
    // setBrowserstackOsVersion2([]);
    // setBrowserstackBrowsers2([]);
    let arrayBrowserVersion = [];
    let os_name = selectedOS1.concat(" ", selectedOsVersions1);
    if (Object.entries(browserstackBrowserDetails.browser[option.name]).length) {
      if (Object.entries(browserstackBrowserDetails.browser[option.name][os_name]).length) {
        browserstackBrowserDetails.browser[option.name][os_name].forEach((element) => {
          arrayBrowserVersion.push({
            name: element,
            code: element
          });
        });
      }
    }

    setConfig(prev => {
      return prev.map((item, index) => {
        if (index === rowIndex) {
          return { ...item, [field]: option.name };
        }
        return item;
      });
    });

    const browserVersions = arrayBrowserVersion.sort((a, b) => {
      return Number(b.name) - Number(a.name);
    })

    setselectedBrowserVerionDetails2(browserVersions);
  };

  const onBrowserVersionChange_Parallel = (option, { field, rowIndex }) => {
    setSelectedBrowserVersionsDetails1(option.name);
    // setBrowserstackOsVersion2([]);
    // setBrowserstackBrowsers2([]);
    // setselectedBrowserVerionDetails2([]);

    setConfig(prev => {
      return prev.map((item, index) => {
        if (index === rowIndex) {
          return { ...item, [field]: option.name };
        }
        return item;
      });
    });
  };

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

  const editExecutionRow = (rowData) => {
    const newEditModes = [...editModes];
    newEditModes[rowData.rowIndex] = !newEditModes[rowData.rowIndex];
    setEditModes(newEditModes);
  };

  const onRowEditSave = (event) => {
    setEditingRows([]);
  };

  const deleteExecutionRow = (id) => {
    const updatedConfig = config.filter((rowData) => rowData.id !== id);
    setConfig(updatedConfig);
    setVisible(false);
  };

  const reject = () => {
    setVisible(false);
  }

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
  };

  const handleAddClick = (count) => {
    let emptyrow = {
      id: 0,
      osname: "",
      osversion: "",
      browsername: "",
      browserversion: "",
    };

    const addedRows = [];
    for (let i = 0; i < count; i++) {
      addedRows.push({ ...emptyrow, id: config.length + i });
    }

    setConfig([...config, ...addedRows]);
    setCount(0);
  };

  const headerConfigs = [
    { field: "osname", header: "OS Name" },
    { field: "osversion", header: "OS Version" },
    { field: "browsername", header: "Browser Name" },
    { field: "browserversion", header: "Browser Version" },
    { field: "actions", header: "Actions" },
  ];

  const statusEditor = (options, place) => {
    return (
      //2nd dropDown
      Object.keys(options).map((key) => {

        if (key != "id") {
          return (
            <Dropdown
              value={`${key == "osname" ? { name: config[clickedRow.rowIndex][key], code: config[clickedRow.rowIndex][key], versions: [] } : { name: config[clickedRow.rowIndex][key], code: config[clickedRow.rowIndex][key] }}`}
              options={getOptions(key)}
              onChange={(e) => {
                onChangeFunctions(e.value, { ...clickedRow, field: key });
              }}
              placeholder={placeHolder(key)}
              optionLabel='name'
            />
          )
        }
      })
    );
  };

  const placeHolder = (field) => {
    switch (field) {
      case "osname":
        return "Select OS 2nd Name";
      case "osversion":
        return "Select OS Version";
      case "browsername":
        return "Select Browser Name";
      case "browserversion":
        return "Select Browser Version";
    }
  };

  const getOptions = (field) => {
    switch (field) {
      case "osname":
        return newOsNames;
      case "osversion":
        return browserstackOsVersion2;
      case "browsername":
        return browserstackBrowsers2;
      case "browserversion":
        return selectedBrowserVerionDetails2;
    }
  };

  const onChangeFunctions = (value, rowData) => {
    if (rowData.field == "osname") {
      onOsChange_Parallel(value, rowData);
    } else if (rowData.field == "osversion") {
      onOsVersionChange_Parallel(value, rowData);
    } else if (rowData.field == "browsername") {
      onBrowserSelect_Parallel(value, rowData);
    } else if (rowData.field == "browserversion") {
      onBrowserVersionChange_Parallel(value, rowData);
    }
  };

  // function hasEmptyStringValue(obj) {
  //   for (let key in obj) {
  //     if (obj.hasOwnProperty(key) && obj[key] === "") {
  //       return true;  
  //     }
  //   }
  //   return false;
  // };

  // const emptyCheck = config.filter((conf) => hasEmptyStringValue(conf)).length;

  const statusEditorForNewFields = (options, field, rowData) => {
    const value = options[field];

    const selectedValue = (field) => {
      switch (field) {
        case "osname":
          return options.osname
        case "osversion":
          return options.osversion;
        case "browsername":
          return options.browsername;
        case "browserversion":
          return options.browserversion;
      }
    };

    if (options[field] == "") {
      const getOptions = (field) => {
        switch (field) {
          case "osname":
            return newOsNames;
          case "osversion":
            return browserstackOsVersion2;
          case "browsername":
            return browserstackBrowsers2;
          case "browserversion":
            return selectedBrowserVerionDetails2;
        }
      };

      const placeHolder = (field) => {
        switch (field) {
          case "osname":
            return "Select OS 1st Name";
          case "osversion":
            return "Select OS Version";
          case "browsername":
            return "Select Browser Name";
          case "browserversion":
            return "Select Browser Version";
        }
      };

      //1st dropDown
      return (
        <Dropdown
          value={selectedValue(field)}
          options={getOptions(field)}
          onChange={(e) => {
            onChangeFunctions(e.value, rowData);
          }}
          placeholder={selectedValue(field) !== "" ? null : placeHolder(field)}
          optionLabel="name"
        />
      );
    } else {
      if (field == "actions") {
        return (
          <div style={{ display: "flex" }}>
            <button style={{ marginRight: "5px" }} onClick={() => editExecutionRow(rowData)}>
              <img src="static/imgs/ic-edit.png"
                style={{ height: "20px", width: "20px" }}
                className="pencil_button p-button-edit"
              />
            </button>
            <button onClick={() => {
              setVisible(true);
              setRowToDelete(rowData);
            }}>
              <img src="static/imgs/ic-delete-bin.png" style={{ height: "20px", width: "20px" }}
                className="trash_button p-button-edit" label="Bottom"
              />
            </button>
          </div>
        )
      } else {
        return <p className='m-auto'>{selectedValue(field)}</p>
      }
    }
    // else {
    //   const valueTemplate = () => {
    //     if (field == "actions") {
    //       return (
    //         <div style={{ display: "flex" }}>
    //           <button style={{ marginRight: "5px" }} onClick={() => editExecutionRow(rowData)}>
    //             <img src="static/imgs/ic-edit.png"
    //               style={{ height: "20px", width: "20px" }}
    //               className="pencil_button p-button-edit"
    //             />
    //           </button>
    //           <button onClick={() => {
    //             setVisible(true);
    //             setRowToDelete(rowData);
    //           }}>
    //             <img src="static/imgs/ic-delete-bin.png" style={{ height: "20px", width: "20px" }}
    //               className="trash_button p-button-edit" label="Bottom"
    //             />
    //           </button>
    //         </div>
    //       )
    //     } else {
    //       return <p className='m-auto'>{selectedValue(field)}</p>
    //     }
    //   };

    //   //2nd dropDown
    //   return (
    //     <div className="inline-flex gap-2 m-auto">{
    //       (editMode && options.id == rowData.rowIndex) ? statusEditor(options, "status editor new") : valueTemplate()
    //     }</div>
    //   )
    // }
  };

  const onRowEditComplete = (e) => {
    let updatedConfig = [...config];
    let { newData, index } = e;
    updatedConfig[index] = newData;

    setConfig(updatedConfig);
  };

  const statusEditorForNewFieldsNew = (options, field) => {
    const selectedValue = (field) => {
      switch (field) {
        case "osname":
          return options.osname
        case "osversion":
          return options.osversion;
        case "browsername":
          return options.browsername;
        case "browserversion":
          return options.browserversion;
      }
    };

    if (editModes[field.rowIndex] || options[field.field] == "") {
      const getOptions = (field) => {
        switch (field) {
          case "osname":
            return newOsNames;
          case "osversion":
            return browserstackOsVersion2;
          case "browsername":
            return browserstackBrowsers2;
          case "browserversion":
            return selectedBrowserVerionDetails2;
        }
      };

      const placeHolder = (field) => {
        switch (field) {
          case "osname":
            return "Select OS 1st Name";
          case "osversion":
            return "Select OS Version";
          case "browsername":
            return "Select Browser Name";
          case "browserversion":
            return "Select Browser Version";
        }
      };

      let values = {};
      if (editModes[field.rowIndex]) {
        if (field.field !== "osname") {
          values = {
            name: selectedValue(field.field),
            code: selectedValue(field.field),
          }
        } else {
          values = {
            name: selectedValue(field.field),
            code: selectedValue(field.field),
            versions: []
          }
        }
      }
      else {
        values = selectedValue(field.field)
      };


      //1st dropDown
      return (
        <>
          {
            field.field != "actions" ?
              <Dropdown
                value={values}
                options={getOptions(field.field)}
                onChange={(e) => onChangeFunctions(e.value, field)}
                placeholder={selectedValue(field.field) !== "" ? null : placeHolder(field.field)}
                optionLabel="name"
              />
              : <div style={{ display: "flex" }}>
                <button style={{ marginRight: "5px" }} onClick={() => editExecutionRow(field)}>
                  <img src="static/imgs/ic-edit.png"
                    style={{ height: "20px", width: "20px" }}
                    className="pencil_button p-button-edit"
                  />
                </button>
                <button onClick={() => {
                  setVisible(true);
                  setRowToDelete(field);
                }}>
                  <img src="static/imgs/ic-delete-bin.png" style={{ height: "20px", width: "20px" }}
                    className="trash_button p-button-edit" label="Bottom"
                  />
                </button>
              </div>}
        </>
      );
    } else {
      if (field.field == "actions") {
        return (
          <div style={{ display: "flex" }}>
            <button style={{ marginRight: "5px" }} onClick={() => editExecutionRow(field)}>
              <img src="static/imgs/ic-edit.png"
                style={{ height: "20px", width: "20px" }}
                className="pencil_button p-button-edit"
              />
            </button>
            <button onClick={() => {
              setVisible(true);
              setRowToDelete(field);
            }}>
              <img src="static/imgs/ic-delete-bin.png" style={{ height: "20px", width: "20px" }}
                className="trash_button p-button-edit" label="Bottom"
              />
            </button>
          </div>
        )
      } else {
        return <p className='m-auto'>{selectedValue(field.field)}</p>
      }
    }
  };

  // useEffect(() => {
  //   if (editMode) {
  //     statusEditor(clickedRow, "useEffect");
  //   }
  // }, [editMode]);

  return (
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
                          onChange={(e) => onOsChange_Normal(e.value)}
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
                          onChange={(e) => onOsVersionChange_Normal(e.target.value)}
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
                          onChange={(e) => onBrowserSelect_Normal(e.value)}
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
                          onChange={(e) => onBrowserVersionChange_Normal(e.value)}
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
                      <Button icon="pi pi-plus-circle" disabled={count == 0} onClick={() => handleAddClick(count)} />
                      <div>Add</div>
                    </div>
                  </div>
                  <div className="table_cls">
                    <Toast ref={toast} />
                    <ConfirmDialog group="declarative" visible={visible} onHide={() => setVisible(false)} message="Do you want to delete this record?"
                      header="Delete Confirmation" icon="pi pi-exclamation-triangle" accept={() => deleteExecutionRow(rowToDelete.rowIndex)} reject={reject} />
                    <DataTable value={config} editMode="row" onRowEditComplete={onRowEditComplete}>
                      {headerConfigs.map((headerConfig) => {
                        const { field, header } = headerConfig;
                        return (
                          <Column
                            key={field}
                            field={field}
                            // rowEditor={true}
                            header={header}
                            style={{ width: "20%", textAlign: "center" }}
                            // body={(options, field) => statusEditorForNewFields(options, field.field, field)}
                            body={(options, field) => statusEditorForNewFieldsNew(options, field)}
                          />
                        );
                      })}
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
              let payload = {};
              let result = config.map((data) => {
                let obj = {};
                Object.keys(data).filter((key) => {
                  if (key != "id") {
                    if (obj[key] == undefined) {
                      obj[key] = data[key];
                    }
                  }
                });
                return obj;
              });


              if (activeIndex == 1) {
                payload = {
                  executionMode: "browserstack_parallel",
                  platforms_web: result || []
                }
              };

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
              //  add check for parallel empty objects
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
      headerTxt='BrowserStack Integration' modalSytle={{ height: "auto", background: "#FFFFFF" }}
    />
  )
})
export { BrowserstackLogin, BrowserstackExecute };