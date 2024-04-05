import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { geniusMigrate, showGenuis, migrateProject } from '../../global/globalSlice';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProjects } from '../api';
import { loadUserInfoActions } from '../../landing/LandingSlice';
import { convertIdIntoNameOfAppType, DateTimeFormat } from "../../design/components/UtilFunctions";




const MigrateScreen = props => {
    const dispatch=useDispatch();
    const migrateProjectValue = useSelector((state) => state.progressbar.migrateProject);
    
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
    if (!userInfo) userInfo = userInfoFromRedux;
    else userInfo = userInfo;
    const isQualityEngineer = userInfo && userInfo.rolename === 'Quality Engineer';

    useEffect(() => {
        (async () => {
            const projectList = await fetchProjects({ readme: "projects" });
            const arrayNew = projectList.map((element, index) => {
                const lastModified = DateTimeFormat(element.modifiedon, element.releases[0].createdon);
                return {
                    key: index,
                    projectName: element.name,
                    progressStep: element.progressStep,
                    modifiedName: element.firstname,
                    modifieDateProject: element.modifiedon,
                    modifiedDate: lastModified,
                    createdDate: element.releases[0].createdon,
                    appType: convertIdIntoNameOfAppType(element.type),
                    projectId: element._id,
                    projectLevelRole: element?.projectlevelrole?.assignedrole ?? ""
                }
            });
            const sortedProject = arrayNew.sort((a, b) => new Date(b.modifieDateProject) - new Date(a.modifieDateProject));
            const selectedProject = sortedProject[0];
            if (selectedProject) {
                localStorage.setItem('DefaultProject', JSON.stringify(selectedProject));
                dispatch(loadUserInfoActions.setDefaultProject(selectedProject));
            }
        })();
    }, [migrateProjectValue]);

    const handleMigration = () => {
        dispatch(geniusMigrate(true))
        dispatch(showGenuis({ showGenuisWindow: true, geniusWindowProps: {} }))
        dispatch(migrateProject(""))
      };
    return(
        <div className='flex flex-column justify-content-center align-items-center h-full'>
            <div className='w-4'>
                <img src='static/imgs/migrateimg.svg' className='w-full'></img>
            </div>
            <div className='my-4'>Convert non-Avo automation scripts to Avo Automation</div>
            <div className='flex flex-column'>
                <Button  onClick={!isQualityEngineer?handleMigration:null} style={isQualityEngineer?{cursor:'not-allowed',opacity:'0.3'}:null}  title={isQualityEngineer ? "you dont't have previlage to perform this action" : "migrate" } size='small' className='migratebtn'> Migrate</Button>
            </div>
        </div>
    )
}
export default MigrateScreen;