import React, { useState, useEffect, useRef } from 'react';
import { Messages as MSG, VARIANT, setMsg } from '../../global';
import '../styles/LlmModal.scss';
import { deleteAvoGrid, fetchAvoAgentAndAvoGridList } from '../api';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import AvoModal from '../../../globalComponents/AvoModal';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { classNames } from 'primereact/utils';
import { MultiSelect } from 'primereact/multiselect';
import { TriStateCheckbox } from 'primereact/tristatecheckbox';
import AvoConfirmDialog from '../../../globalComponents/AvoConfirmDialog';
import { createModel, readModel, editModel,deleteModel } from '../api';


/* Component Grids List */

const LLMList = ({ setShowConfirmPop, showMessageBar, setLoading, toastError, toastSuccess, toastWarn }) => {
    const toastWrapperRef = useRef(null);
    const [llmModel, setLlmModel] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [gridList, setGridList] = useState([]);
    const [filteredList, setFilteredList] = useState(gridList);
    const [tableData, setTableData] = useState([]);
    // const [showDataTable, setShowDataTable] = useState(false)
    const [modalName, setModalName] = useState('');
    const [modalType, setModalType] = useState({});
    const [modalToken, setModalToken] = useState('');
    const openAI_Obj = {
        name: "",
        api_type: "azure",
        api_version: "",
        api_base: "",
        deployment_name:""
    }
    const [openAiExtras, setOpenAiExtras] = useState(openAI_Obj);
    const [deleteRow, setDeleteRow] = useState(false);
    const [selectedModelType, setSelectedModelType] = useState(null);
    const [isEdit,setIsEdit] = useState(false);
    const [currentId,setCurrentId] = useState('');

    // const [versionDropdownOptions, setVersionDropdownOptions] = useState([]);
    const [version, setVersion] = useState('');

    const deleteGridConfig = (rowData) => {
        console.log(rowData);
        setShowConfirmPop({
            title: 'Delete Avo Grid Configuration',
            content: (
                <p>
                    Are you sure you want to delete <b>{rowData.name}</b> Configuration?
                </p>
            ),
            onClick: () => {
                deleteDevopsAvoGrid(rowData);
            },
        });
    };

    const deleteDevopsAvoGrid = (rowData) => {
        setLoading('Please Wait...');
        setTimeout(async () => {
            const deletedAvoGrid = await deleteAvoGrid({ '_id': rowData._id });
            console.log(deletedAvoGrid);
            if (deletedAvoGrid.error) {
                if (deletedAvoGrid.error.CONTENT) {
                    toastError(MSG.CUSTOM(deletedAvoGrid.error.CONTENT, VARIANT.ERROR));
                } else {
                    toastError(MSG.CUSTOM('Error While Deleting Execute Configuration', VARIANT.ERROR));
                }
            } else {
                const gridList = await fetchAvoAgentAndAvoGridList({
                    query: 'avoGridList',
                });
                if (gridList.error) {
                    if (gridList.error.CONTENT) {
                        toastError(MSG.CUSTOM(gridList.error.CONTENT, VARIANT.ERROR));
                    } else {
                        toastError(MSG.CUSTOM('Error While Fetching Grid List', VARIANT.ERROR));
                    }
                } else {
                    setGridList(gridList.avogrids);
                    let filteredItems = gridList.avogrids.filter((item) => item.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1);
                    setFilteredList(filteredItems);
                }
                toastSuccess(MSG.CUSTOM(rowData.name + ' Deleted Successfully.', VARIANT.SUCCESS));
            }
            setLoading(false);
        }, 500);
        setShowConfirmPop(false);
    };

    const handleSearchChange = (value) => {
        let filteredItems = gridList.filter((item) => item.name.toLowerCase().indexOf(value.toLowerCase()) > -1);
        setFilteredList(filteredItems);
        setSearchText(value);
    };

    const [filters, setFilters] = useState({
        // global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        // name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        // 'country.name': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        // representative: { value: null, matchMode: FilterMatchMode.IN },
        // status: { value: null, matchMode: FilterMatchMode.EQUALS },
        // verified: { value: null, matchMode: FilterMatchMode.EQUALS }
    });
    // const [loading, setLoading] = useState(true);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [representatives] = useState([
        { name: 'Amy Elsner', image: 'amyelsner.png' },
        { name: 'Anna Fali', image: 'annafali.png' },
        { name: 'Asiya Javayant', image: 'asiyajavayant.png' },
        { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
        { name: 'Elwin Sharvill', image: 'elwinsharvill.png' },
        { name: 'Ioni Bowcher', image: 'ionibowcher.png' },
        { name: 'Ivan Magalhaes', image: 'ivanmagalhaes.png' },
        { name: 'Onyama Limba', image: 'onyamalimba.png' },
        { name: 'Stephen Shaw', image: 'stephenshaw.png' },
        { name: 'XuXue Feng', image: 'xuxuefeng.png' }
    ]);
    const [statuses] = useState(['unqualified', 'qualified', 'new', 'negotiation', 'renewal']);

    const getSeverity = (status) => {
        switch (status) {
            case 'unqualified':
                return 'danger';

            case 'qualified':
                return 'success';

            case 'new':
                return 'info';

            case 'negotiation':
                return 'warning';

            case 'renewal':
                return null;
        }
    };

    useEffect(() => {
        // CustomerService.getCustomersMedium().then((data) => {
        //     setCustomers(getCustomers(data));
        //     setLoading(false);
        // });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const getCustomers = (data) => {
        return [...(data || [])].map((d) => {
            d.date = new Date(d.date);

            return d;
        });
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between align-items-between">
                <span>LLM model list</span>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
                </span>
                <Button label="Add New" onClick={() => setLlmModel(true)} autoFocus />
            </div>
        );
    };

    const countryBodyTemplate = (rowData) => {
        return (
            <div className="flex align-items-center gap-2">
                <img alt="flag" src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png" className={`flag flag-${rowData.country.code}`} style={{ width: '24px' }} />
                <span>{rowData.country.name}</span>
            </div>
        );
    };

    const representativeBodyTemplate = (rowData) => {
        const representative = rowData.representative;

        return (
            <div className="flex align-items-center gap-2">
                <img alt={representative.name} src={`https://primefaces.org/cdn/primereact/images/avatar/${representative.image}`} width="32" />
                <span>{representative.name}</span>
            </div>
        );
    };

    const representativesItemTemplate = (option) => {
        return (
            <div className="flex align-items-center gap-2">
                <img alt={option.name} src={`https://primefaces.org/cdn/primereact/images/avatar/${option.image}`} width="32" />
                <span>{option.name}</span>
            </div>
        );
    };

    const statusBodyTemplate = (rowData) => {
        return <Tag value={rowData.status} severity={getSeverity(rowData.status)} />;
    };

    const statusItemTemplate = (option) => {
        return <Tag value={option} severity={getSeverity(option)} />;
    };

    const verifiedBodyTemplate = (rowData) => {
        return <span className='pi pi-trash'></span>
    };

    const representativeRowFilterTemplate = (options) => {
        return (
            <MultiSelect
                value={options.value}
                options={representatives}
                itemTemplate={representativesItemTemplate}
                onChange={(e) => options.filterApplyCallback(e.value)}
                optionLabel="name"
                placeholder="Any"
                className="p-column-filter"
                maxSelectedLabels={1}
                style={{ minWidth: '14rem' }}
            />
        );
    };

    const statusRowFilterTemplate = (options) => {
        return (
            <Dropdown value={options.value} options={statuses} onChange={(e) => options.filterApplyCallback(e.value)} itemTemplate={statusItemTemplate} placeholder="Select One" className="p-column-filter" showClear style={{ minWidth: '12rem' }} />
        );
    };

    const verifiedRowFilterTemplate = (options) => {
        return <TriStateCheckbox value={options.value} onChange={(e) => options.filterApplyCallback(e.value)} />;
    };

    const header = renderHeader();

    const saveModel = async () => {
        try {
          setLoading('Saving...');
          if(isEdit){
            setIsEdit(false);
            let payload = {
                name: modalName,
                modeltype: modalType,
                // api_key: modalToken,
                // model: version
              };
          
              // Additional fields for OpenAi
              if (modalType === 'openAi') {
                payload.openai_api_base = openAiExtras.api_base;
                payload.openai_api_key = modalToken;
                payload.openai_api_type = openAiExtras.api_type;
                payload.openai_api_version = openAiExtras.api_version;
                payload.openai_deployment_name = openAiExtras.deployment_name;

                // payload = { ...payload, ...openAiExtras };
              } else if (modalType === 'cohere' || modalType === 'anthropic') {
                if(modalType === 'cohere'){
                    payload.cohere_api_key = modalToken;
                    payload.cohere_model = version;

                }
                else if(modalType === 'anthropic'){
                    payload.anthropic_api_key = modalToken;
                    payload.anthropic_model = version;
                }
                // payload = { ...payload, /* add Cohere/Anthropic specific fields here */ };
              }
          
              const response = await editModel(currentId,payload);
          
              if (response.error) {
                // Handle error response
                console.error('Failed to create model:', response.error);
              } else {
                toastSuccess('model updated')
                setLoading(false);
                setLlmModel(false);
                setOpenAiExtras(openAI_Obj);
                setModalName('');
                setModalType({});
                setModalToken('');
                setVersion('');
                setCurrentId('');
                const result = await readModel();
                if (result.status) {
                  setTableData(result.data);
    
                } else {
                  console.error(result.error);
                }
                // Model created successfully
                // Add any additional logic or state updates as needed
                // toast.current.show({
                //   severity: 'success',
                //   summary: 'Success',
                //   detail: 'The model was successfully created!',
                //   life: 5000,
                // });
              }
          }
          else{
            let payload = {
                name: modalName,
                modeltype: modalType,
                api_key: modalToken,
                model: version
              };
          
              // Additional fields for OpenAi
              if (modalType === 'openAi') {
                payload = { ...payload, ...openAiExtras };
              } else if (modalType === 'cohere' || modalType === 'anthropic') {
                // Additional fields for Cohere and Anthropic
                // Adjust the field names based on your API requirements
                payload = { ...payload, /* add Cohere/Anthropic specific fields here */ };
              }
          
              const response = await createModel(payload);
          
              if (response.error) {
                // Handle error response
                console.error('Failed to create model:', response.error);
              } else {
                toastSuccess('model created');
                setLoading(false);
                setLlmModel(false);
                setOpenAiExtras(openAI_Obj);
                setModalName('');
                setModalType({});
                setModalToken('');
                setVersion('');
                const result = await readModel();
                if (result.status) {
                  setTableData(result.data);
    
                } else {
                  console.error(result.error);
                }
                // Model created successfully
                // Add any additional logic or state updates as needed
                // toast.current.show({
                //   severity: 'success',
                //   summary: 'Success',
                //   detail: 'The model was successfully created!',
                //   life: 5000,
                // });
              }
          }
          
        } catch (error) {
          console.error('Error:', error);
        }
      };

      useEffect(() => {
        const fetchData = async () => {
          try {
            const result = await readModel();
    
            if (result.status) {
              setTableData(result.data);
            } else {
              console.error(result.error);
            }
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };
    
        fetchData();
      }, []);

    const handleEdit = async (rowData) => {
        console.log(rowData)
        setLlmModel(true);
        setIsEdit(true);
        setModalName(rowData?.name);
        setModalType(rowData?.modeltype);
        setCurrentId(rowData?._id);
        if (rowData?.modeltype === "openAi") {
            const { name, openai_api_key, openai_api_base, openai_api_type, openai_api_version, openai_deployment_name} = rowData;
            setOpenAiExtras({ name, api_key: openai_api_key, api_base: openai_api_base, api_type: openai_api_type, api_version: openai_api_version, deployment_name:openai_deployment_name})
            setModalToken(rowData?.openai_api_key)
        } else if (rowData?.modeltype === "cohere" || rowData?.modeltype === "anthropic") {
            const { name,cohere_api_key,cohere_model,anthropic_api_key,anthropic_model} = rowData;
            setModalToken( rowData?.modeltype === "cohere" ? cohere_api_key : anthropic_api_key);
            setVersion( rowData?.modeltype === "cohere" ? cohere_model : anthropic_model);
            
        }
    }
        const handleDelete = async (currId) => {
            try {
                const result = await deleteModel(currId);

                if (result.error) {
                    // Handle the error, e.g., show an error message
                    console.error(result.error);
                } else {
                    // Handle success, e.g., update the UI or perform additional actions
                    toastSuccess('Model deleted successfully');
                    const result = await readModel();
                    if (result.status) {
                    setTableData(result.data);
        
                    } else {
                    console.error(result.error);
                    }
                }
            } catch (error) {
                // Handle any unexpected errors
                toastError('Unexpected error');
            }
        };
    



    const footerContent = (
        <div>
            <Button label="Cancel" onClick={() => onHideHandle()} className="p-button-text" />
            <Button label="Save" onClick={saveModel}  autoFocus />
        </div>
    );

    const NoDataFound = () => {
        return <div className="grid_img"> <img src="static/imgs/grid_page_image.svg" alt="Empty List Image" height="255" width='204' />
            <span>No LLM Modal yet</span>
            <Button className="grid_btn" label="Create" onClick={() => { setLlmModel(true); }} ></Button>
        </div>
    }

    const dropdownOptions = [
        { label: 'OpenAi', value: 'openAi' },
        { label: 'cohere', value: 'cohere' },
        { label: 'anthropic', value: 'anthropic' },
        // Add more options as needed
      ];

      const versionDropdownOptions = {
        openAi: [
          { label: 'gpt-35-turbo-16k', value: 'gpt-35-turbo-16k' },
          { label: 'gpt-35-turbo', value: 'gpt-35-turbo' },
          { label: 'gpt-35-turbo-instruct', value: 'gpt-35-turbo-instruct' },
          { label: 'gpt-4', value: 'gpt-4' },
          // Add more options for OpenAi as needed
        ],
        cohere: [
          { label: 'command', value: 'command' },
          // Add more options for cohere as needed
        ],
        anthropic: [
          { label: 'claude-2', value: 'claude-2' },
          // Add more options for anthropic as needed
        ],
      };

      const handleSecondDropdownChange = (selectedOption) => {
        if(modalType === "openAi"){
            setOpenAiExtras((prev) => { return { ...prev, deployment_name: selectedOption.value } });
        }
        setVersion(selectedOption.value);
      };
    const actionTemplate=(rowData)=>{
        return( <div>
            {/* <span className='pi pi-pencil' onClick={()=>handleEdit(rowData)} ></span> */}
            <span className='pi pi-trash' onClick={()=> {setDeleteRow(true);setCurrentId(rowData?._id)} }  style={{marginLeft:'1rem'}} ></span>
        </div>)   
    }
    const getDeploymentValue = () =>{
        if(modalType == "openAi"){
            return openAiExtras?.deployment_name
        }else if(modalType == "cohere" || modalType == "anthropic"){
            return  version
        }
    }
    const onHideHandle = () => {
            setLlmModel(false);
            setOpenAiExtras(openAI_Obj);
            setModalName('');
            setModalType({});
            setModalToken('');
            setVersion('');
    }
    return (
        <>
            {!tableData.length && <NoDataFound />}
            {(tableData.length) &&
            <div className="card">

                    <AvoConfirmDialog
                        visible={deleteRow}
                        onHide={() => setDeleteRow(false)}
                        showHeader={false}
                        message="Are you sure you want to delete ?"
                        icon="pi pi-exclamation-triangle"
                        accept={() => handleDelete(currentId)}
                    />
                <DataTable value={tableData} paginator rows={6} dataKey="id"
                    header={header} emptyMessage="No customers found." tableStyle={{ minWidth: '50rem' }}>
                    <Column field="name" header="Name" style={{ minWidth: '12rem' }} />
                    <Column field="modeltype" header="LLM Model" style={{ minWidth: '12rem' }} />
                    <Column field="createdAt" header="Created Date" style={{ minWidth: '12rem' }} />
                    <Column field="actions" header="Actions" style={{ minWidth: '6rem' }} body={actionTemplate} />
                </DataTable>
            </div>
            }
            {
                llmModel && <Dialog className='llm_modal_container' visible={llmModel} onHide={() => onHideHandle()} header='Add LLM Modal' footer={footerContent} style={{ width: '60vh' }} >

                    <div className="flex flex-column">
                        <div className="flex flex-column pb-2">
                            <label className="pb-2 font-medium">Name <span className='ml-1' style={{ color: "#d50000" }}>*</span></label>
                            <InputText value={modalName} placeholder='Enter Modal Name' onChange={(e) => { setModalName(e.target.value); setOpenAiExtras((prev) => { return { ...prev, name: e.target.value } });}} />

                        </div>
                        <div className="flex flex-column pb-2">
                            <label className='pb-2 font-medium'>Model<span className='ml-1' style={{ color: "#d50000" }}>*</span></label>
                            <Dropdown
                                options={dropdownOptions}
                                onChange={(e) => setModalType(e.value)}
                                value={modalType}
                                placeholder="Select an option"
                            />
                        </div>
                        <div className="flex flex-column pb-2">
                            <label className='pb-2 font-medium'> {modalType == 'openAi' ? 'Deployment Name' : 'Model Version'}<span className='ml-1' style={{ color: "#d50000" }}>*</span></label>
                            <Dropdown
                                 options={versionDropdownOptions[modalType] || []}
                                 onChange={handleSecondDropdownChange}
                                 value={getDeploymentValue()}
                                 placeholder="Select an option"
                            />
                        </div>
                        {/* {modalType == 'openAi' && <div className="flex flex-column pb-2">
                            <label className="pb-2 font-medium">Deployment Name <span style={{ color: "#d50000" }}>*</span></label>
                            <InputText onChange={(e) => setOpenAiExtras((prev) => { return { ...prev, name: e.target.value } })} placeholder='Enter Deployment Name' />
                        </div>} */}
                        {/* {modalType == 'openAi' && <div className="flex flex-column pb-2">
                            <label className="pb-2 font-medium">API Type <span style={{ color: "#d50000" }}>*</span></label>
                            <InputText onChange={(e) => setOpenAiExtras((prev) => { return { ...prev, api_type: e.target.value } })} placeholder='Enter Api Type' />
                        </div>} */}
                        {modalType == 'openAi' && <div className="flex flex-column pb-2">
                            <label className="pb-2 font-medium">API Version <span style={{ color: "#d50000" }}>*</span></label>
                            <InputText value={openAiExtras?.api_version} onChange={(e) => setOpenAiExtras((prev) => { return { ...prev, api_version: e.target.value } })} placeholder='Enter Api Version'
                            />
                        </div>}
                        {modalType == 'openAi' && <div className="flex flex-column pb-2">
                            <label className="pb-2 font-medium">Base URL <span style={{ color: "#d50000" }}>*</span></label>
                            <InputText value={openAiExtras?.api_base} onChange={(e) => setOpenAiExtras((prev) => { return { ...prev, api_base: e.target.value } })} placeholder='Enter Base URL'
                            />
                        </div>}
                        <div className="flex flex-column pb-2">
                            <label className="pb-2 font-medium">Token<span style={{ color: "#d50000" }}>*</span></label>
                            <InputText value={modalToken} onChange={(e) => setModalToken(e.target.value)} placeholder='Enter Token' />
                        </div>
                    </div>


                </Dialog>
            }
        </>

    );
};
{/* loading={loading} */ }

export default LLMList;
