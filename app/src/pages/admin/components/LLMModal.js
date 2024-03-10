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
import { createModel } from '../api';


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
    const [openAiExtras, setOpenAiExtras] = useState({
        name: "",
        api_type: "",
        api_version: "",
        api_base: "",
    });
    const [input2, setInput2] = useState('');
    const [selectedDropdownValue, setSelectedDropdownValue] = useState(null);
    const [dataTableValues, setDataTableValues] = useState([]);
    const [deleteRow, setDeleteRow] = useState(false);
    // const [llmModel, setLlmModel] = useState(false);
    const [inputDeploymentName, setInputDeploymentName] = useState('');
    const [inputApiType, setInputApiType] = useState('');
    const [inputApiVersion, setInputApiVersion] = useState('');
    const [inputBaseUrl, setInputBaseUrl] = useState('');
    // const [selectedDropdownValue, setSelectedDropdownValue] = useState(null);


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
          let payload = {};
          payload["name"]=modalName;
          payload["modeltype"]=modalType;
          payload["api_key"]=modalToken;
          if(modalType=="openAi"){
            payload = {...payload, ...openAiExtras}
          }
      
          const response = await createModel(payload);
      
          if (response.error) {
            // Handle error response
            console.error('Failed to create model:', response.error);
          } else {
            // Model created successfully
            // Add any additional logic or state updates as needed
            // toast.current.show({
            //   severity: 'success',
            //   summary: 'Success',
            //   detail: 'The model was successfully created!',
            //   life: 5000,
            // });
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
      



    const footerContent = (
        <div>
            <Button label="Cancel" onClick={() => setLlmModel(false)} className="p-button-text" />
            <Button label="Save" onClick={saveModel}  autoFocus />
        </div>
    );

    const NoDataFound = () => {
        return <div className="grid_img"> <img src="static/imgs/grid_page_image.svg" alt="Empty List Image" height="255" width='204' />
            <span>No Grids Yet</span>
            <Button className="grid_btn" label="New Grid" onClick={() => { setLlmModel(true); }} ></Button>
        </div>
    }

    const dropdownOptions = [
        { label: 'OpenAi', value: 'openAi' },
        { label: 'Cohere', value: 'Cohere' },
        { label: 'Anthropic', value: 'Anthropic' },
        // Add more options as needed
      ];

    const actionTemplate=()=>{
        return( <div>
            <span className='pi pi-pencil' ></span>
            <span className='pi pi-trash' onClick={()=> setDeleteRow(true) }  style={{marginLeft:'1rem'}} ></span>
        </div>)
        
    }
    return (
        <>
            {!tableData.length && <NoDataFound />}
            {(tableData.length) &&
            <div className="card">
                <DataTable value={tableData} paginator rows={10} dataKey="id"
                    header={header} emptyMessage="No customers found." tableStyle={{ minWidth: '50rem' }}>
                    <Column field="name" header="Name" style={{ minWidth: '12rem' }} />
                    <Column field="token" header="Token" style={{ minWidth: '12rem' }} />
                    <Column field="actions" header="Actions" style={{ minWidth: '6rem' }} body={actionTemplate}/>
                </DataTable>
            </div>
            }
            {
                llmModel && <Dialog className='llm_modal_container' visible={llmModel} onHide={() => setLlmModel(false)} header='Add LLM Modal' footer={footerContent} style={{ width: '60vh' }} >

                    <div className="flex flex-column">
                        <div className="flex flex-column pb-2">
                            <label className="pb-2 font-medium">Name <span className='ml-1' style={{ color: "#d50000" }}>*</span></label>
                            <InputText placeholder='Enter Modal Name' onChange={(e) => setModalName(e.target.value)} />

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
                        {modalType == 'openAi' && <div className="flex flex-column pb-2">
                            <label className="pb-2 font-medium">Deployment Name <span style={{ color: "#d50000" }}>*</span></label>
                            <InputText onChange={(e) => setOpenAiExtras((prev) => { return { ...prev, name: e.target.value } })} placeholder='Enter Deployment Name' />
                        </div>}
                        {modalType == 'openAi' && <div className="flex flex-column pb-2">
                            <label className="pb-2 font-medium">API Type <span style={{ color: "#d50000" }}>*</span></label>
                            <InputText onChange={(e) => setOpenAiExtras((prev) => { return { ...prev, api_type: e.target.value } })} placeholder='Enter Api Type' />
                        </div>}
                        {modalType == 'openAi' && <div className="flex flex-column pb-2">
                            <label className="pb-2 font-medium">API Version <span style={{ color: "#d50000" }}>*</span></label>
                            <InputText onChange={(e) => setOpenAiExtras((prev) => { return { ...prev, api_version: e.target.value } })} placeholder='Enter Api Version'
                            />
                        </div>}
                        {modalType == 'openAi' && <div className="flex flex-column pb-2">
                            <label className="pb-2 font-medium">Base URL <span style={{ color: "#d50000" }}>*</span></label>
                            <InputText onChange={(e) => setOpenAiExtras((prev) => { return { ...prev, api_base: e.target.value } })} placeholder='Enter Base URL'
                            />
                        </div>}
                        <div className="flex flex-column pb-2">
                            <label className="pb-2 font-medium">Token<span style={{ color: "#d50000" }}>*</span></label>
                            <InputText onChange={(e) => setModalToken(e.target.value)} placeholder='Enter Token' />
                        </div>
                    </div>

                    {/* <AvoConfirmDialog 
                        visible={deleteRow}
                        onHide={() => setDeleteRow(false)}
                        showHeader={false}
                        message="Are you sure you want to delete the repository?"
                        icon="pi pi-exclamation-triangle"
                        accept={() =>setDeleteRow(false) } 
                        /> */}

                </Dialog>
            }
        </>

    );
};
{/* loading={loading} */ }

export default LLMList;
