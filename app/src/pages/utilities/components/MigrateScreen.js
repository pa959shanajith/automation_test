import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { geniusMigrate, showGenuis, showSmallPopup, migrateProject } from '../../global/globalSlice';
import { useSelector, useDispatch } from 'react-redux';



const MigrateScreen = props => {
    const dispatch=useDispatch();

    const handleMigration = () => {
        dispatch(geniusMigrate(true))
        dispatch(showGenuis({ showGenuisWindow: true, geniusWindowProps: {} }))
        dispatch(migrateProject(""))
      };
    return(
        <div className='flex justify-content-center align-items-center h-full'>
        <Button onClick={handleMigration} size='small' className=''> migrate</Button>
        </div>
    )
}
export default MigrateScreen;