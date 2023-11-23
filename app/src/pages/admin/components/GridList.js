import React, { useState, useEffect, useRef } from 'react';
import { Messages as MSG, VARIANT, setMsg } from '../../global';
import '../styles/Grid.scss';
import CreateGrid from './CreateGrid';
import { deleteAvoGrid, fetchAvoAgentAndAvoGridList } from '../api';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';


/* Component Grids List */

const GridList = ({ setShowConfirmPop, showMessageBar, setLoading, toastError, toastSuccess, toastWarn }) => {
    const toastWrapperRef = useRef(null);
    const [currentGrid, setCurrentGrid] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [gridList, setGridList] = useState([]);
    const [filteredList, setFilteredList] = useState(gridList);

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

    useEffect(() => {
        (async () => {
            setLoading('Loading...');
            const gridList = await fetchAvoAgentAndAvoGridList({
                query: 'avoGridList',
            });
            console.log(gridList);
            if (gridList.error) {
                if (gridList.error.CONTENT) {
                    toastError(MSG.CUSTOM(gridList.error.CONTENT, VARIANT.ERROR));
                } else {
                    toastError(MSG.CUSTOM('Error While Fetching Grid List', VARIANT.ERROR));
                }
            } else {
                setGridList(gridList.avogrids);
            }
            setLoading(false);
        })();
    }, []);

    const fetchGridList = (bool) => {
        setCurrentGrid(bool);
        console.log(currentGrid);
        (async () => {
            setLoading('Loading...');
            const gridList = await fetchAvoAgentAndAvoGridList({
                query: 'avoGridList',
            });

            if (gridList.error) {
                console.log(gridList);
                if (gridList.error.CONTENT) {
                    toastError(MSG.CUSTOM(gridList.error.CONTENT, VARIANT.ERROR));
                } else {
                    toastError(MSG.CUSTOM('Error While Fetching Grid List', VARIANT.ERROR));
                }
            } else {
                console.log(gridList.avogrids);
                setGridList(gridList.avogrids);
            }
            setLoading(false);
        })();
    };

    return (
        (currentGrid) ? (
            <CreateGrid setCurrentGrid={fetchGridList} currentGrid={currentGrid} showMessageBar={showMessageBar} setLoading={setLoading} toastError={toastError} toastSuccess={toastSuccess} toastWarn={toastWarn} />
        ) : (
            <>
                <Toast ref={toastWrapperRef} position="bottom-center" />
                <div className="create_grid surface-100">
                    <div className='search_newGrid'>
                    {gridList && gridList.length > 0 && (
                        <InputText placeholder="Search" className='search_grid' value={searchText} onClear={() => handleSearchChange('')} onChange={(event) => event && event.target && handleSearchChange(event.target.value)} />
                    )}
                    {(gridList && gridList.length > 0) && <Button className="grid_btn_list" label="New Grid" onClick={() => { setCurrentGrid({ name: '', agents: [] }) }} ></Button>}
                    </div>
                {gridList && gridList.length > 0 ? (
                    <div style={{ position: 'absolute', width: '98%', height: '-webkit-fill-available', top: '13rem' }}>
                        <DataTable value={(searchText.length > 0 ? filteredList : gridList)}
                            selectionMode="single"
                            className="p-datatable-striped"
                            scrollable
                            scrollHeight="29rem">
                            <Column field="name" header="Grid Name" sortable />
                            <Column field="actions" header="Actions" body={(rowData) => (
                                <div>
                                    <img style={{ marginRight: '10%' }} onClick={() => setCurrentGrid(rowData)} src="static/imgs/EditIcon.svg" className="agents__action_icons" alt="Edit Icon" />
                                    <img onClick={() => deleteGridConfig(rowData)} src="static/imgs/DeleteIcon.svg" className="agents__action_icons" alt="Delete Icon" />
                                </div>
                            )} />
                        </DataTable>
                    </div>
                ) : (
                    <div className="grid_img"> <img src="static/imgs/grid_page_image.svg" alt="Empty List Image" height="255" width='204' />
                        <span>No Grids Yet</span>
                        <Button className="grid_btn" label="New Grid" onClick={() => { setCurrentGrid({ name: '', agents: [] }) }} ></Button>
                    </div>
                )}
                 </div>
            </>)
    );
};

export default GridList;
