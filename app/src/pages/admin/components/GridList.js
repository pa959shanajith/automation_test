import React, { useState, useEffect } from 'react';
import { Messages as MSG, VARIANT, setMsg, ScreenOverlay } from '../../global';
import '../styles/Agents.scss';
import CreateGrid from './CreateGrid';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { deleteAvoGrid, fetchAvoAgentAndAvoGridList } from '../api';

/* Component Grids List */

// {setShowConfirmPop, showMessageBar, setLoading },
const GridList = (props) => {
    const [loading, setLoading] = useState(false)
    const [currentGrid, setCurrentGrid] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [gridList, setGridList] = useState([]);
    // const [dialogVisible, setDialogVisible] = useState(false);
    // const [gridDialog, setGridDialog] = useState();

    // const deleteGridConfig = (grid) => {
    //     props.setShowConfirmPop({
    //         title: 'Delete Avo Grid Configuration',
    //         content: <p>Are you sure, you want to delete <b>{grid.name}</b> Configuration?</p>,
    //         onClick: () => { deleteDevopsAvoGrid(grid); }
    //     });
    // }
    // const deleteDevopsAvoGrid = (grid) => {
    //     setLoading('Please Wait...');
    //     setTimeout(async () => {
    //         const deletedAvoGrid = await deleteAvoGrid({ '_id': grid._id });
    //         if (deletedAvoGrid.error) {
    //             if (deletedAvoGrid.error.CONTENT) {
    //                 setMsg(MSG.CUSTOM(deletedAvoGrid.error.CONTENT, VARIANT.ERROR));
    //             } else {
    //                 setMsg(MSG.CUSTOM("Error While Deleting Execute Configuration", VARIANT.ERROR));
    //             }
    //         } else {
    //             const gridList = await fetchAvoAgentAndAvoGridList({
    //                 query: 'avoGridList'
    //             });
    //             if (gridList.error) {
    //                 if (gridList.error.CONTENT) {
    //                     setMsg(MSG.CUSTOM(gridList.error.CONTENT, VARIANT.ERROR));
    //                 } else {
    //                     setMsg(MSG.CUSTOM("Error While Fetching Grid List", VARIANT.ERROR));
    //                 }
    //             } else {
    //                 setGridList(gridList.avogrids);
    //                 let filteredItems = gridList.avogrids.filter(item => item.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1);
    //                 setFilteredList(filteredItems);
    //             }
    //             setMsg(MSG.CUSTOM(grid.name + " Deleted Successfully.", VARIANT.SUCCESS));
    //         }
    //         setLoading(false);
    //     }, 500);
    //     props.setShowConfirmPop(false);
    // }

    // const [filteredList, setFilteredList] = useState(gridList);
    // const handleSearchChange = (value) => {
    //     let filteredItems = gridList.filter(item => item.name.toLowerCase().indexOf(value.toLowerCase()) > -1);
    //     setFilteredList(filteredItems);
    //     setSearchText(value);
    // }
    // const [hideDialog, setHideDialog] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading('Loading...');
            try {
                const gridList = await fetchAvoAgentAndAvoGridList({
                    query: 'avoGridList'
                });
                console.log(gridList);
                if (gridList.error) {
                    if (gridList.error.CONTENT) {
                        setMsg(MSG.CUSTOM(gridList.error.CONTENT, VARIANT.ERROR));
                    } else {
                        setMsg(MSG.CUSTOM("Error While Fetching Grid List", VARIANT.ERROR));
                    }
                } else {
                    setGridList(gridList.avogrids);
                }
                setLoading(false);
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);


    const fetchGridList = (bool) => {
        // setCurrentGrid(bool);
        (async () => {
            setLoading('Loading...');
            const gridList = await fetchAvoAgentAndAvoGridList({
                query: 'avoGridList'
            });


            if (gridList.error) {
                if (gridList.error.CONTENT) {
                    setMsg(MSG.CUSTOM(gridList.error.CONTENT, VARIANT.ERROR));
                } else {
                    setMsg(MSG.CUSTOM("Error While Fetching Grid List", VARIANT.ERROR));
                }
            } else {
                setGridList(gridList.avogrids);
            }
            setLoading(false);
        }
        )();
    }

    // const actionBodyTemplate = (grid) => {
    //     return (
    //         <React.Fragment>
    //             <img
    //                 style={{ marginRight: '10%' }}
    //                 // onClick={() => setCurrentGrid(grid)}
    //                 src="static/imgs/EditIcon.svg"
    //                 className="agents__action_icons"
    //                 alt="Edit Icon"
    //             />
    //             <img
    //                 onClick={() => deleteGridConfig(grid)}
    //                 src="static/imgs/DeleteIcon.svg"
    //                 className="agents__action_icons"
    //                 alt="Delete Icon"
    //             />
    //         </React.Fragment>
    //     );
    // }

    // const showDialog = () => {
    //     setCurrentGrid({name: '',agents: []})
    //     setDialogVisible(true);
    //   };

    //   const hideDialog = () => {
    //     setDialogVisible(false);
    //   };

    return (
        <>
            {/* {loading ? <ScreenOverlay content={loading} /> : null} */}
            {/* <CreateGrid gridDialog={props.dialogVisible} setGridDialog={props.setDialogVisible} setCurrentGrid={fetchGridList} currentGrid={currentGrid} /> */}
            <div className="newGridbtn_grid">
                <Button className="newGrid__grid" label="New Grid" onClick={() => {props.setCreateDialog(true); }}></Button>
                <div className='searchBoxInput'>
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText placeholder="Search" width='20rem'
                            value={searchText}
                            onClear={() => handleSearchChange('')}
                            onChange={(event) => event && event.target && handleSearchChange(event.target.value)}
                        />
                    </span>
                </div>
                {gridList ? <div style={{ position: 'absolute', width: '27%', height: '-webkit-fill-available', marginTop: '1.5%', marginLeft: '1rem' }}>
                    <DataTable value={(searchText.length > 0) ? filteredList : gridList} selectionMode="single">
                        <Column header="Name" field="name" />
                        <Column header="Actions" body={actionBodyTemplate} headerStyle={{ width: '10%', minWidth: '8rem' }} ></Column>
                    </DataTable>

                </div> : <div className="no_config_img"> <img src="static/imgs/grid_page_image.svg" alt="Empty List Image" />
                    <div className="flex flex-column align-items-center gridName">
                        <span>No Grids Yet</span>
                    </div>
                </div>}
            </div>
        </>

    );
}

export default GridList;