import React, { useEffect, useState } from 'react'
import { getDomains_ICE, getAssignedProjects_ICE, getDetails_ICE } from '../../admin/api'
import { ScreenOverlay, ScrollBar, Messages  as MSG, setMsg } from '../../global'
import { useSelector } from 'react-redux'

import classes from '../styles/UserProject.module.scss';

/*Component UserProject
  use: renders User Project MiddleScreen
  props: resetMiddleScreen and setMiddleScreen
  todo: 
*/

const UserProject = (props) => {

    const userInfo = useSelector(state => state.login.userinfo);
    const [assignProj, setAssignProj] = useState([]);
    const [project, setProject] = useState("-1");
    const [selProjectDtls, setSelProjectDtls] = useState();
    const [loading, setLoading] = useState(false);
    
    const getDomainICE =async() => {
        try {
            setLoading("Loading...");
            const data = await getDomains_ICE();
            setLoading(false);
            if (data.error) {
                setMsg(data.error);
                return;
            }
            setProjects(data);
        } catch (error) {
            setMsg(MSG.GLOBAL.ERR_SOMETHING_WRONG);
        }
    }


    useEffect(() => {
        getDomainICE();
        setProject("-1");
        setSelProjectDtls(null);
    }, [props.resetMiddleScreen["projectTab"]])

   

    const setProjects = async (data) => {
        const domaindata = data;
        setAssignProj([]);
        var userId = userInfo['user_id'];
        var getAssignProj = {};
        domaindata.forEach( async (domainname) => {
            getAssignProj.domainname = domainname;
            getAssignProj.userId = userId;
            try {
                setLoading("Fetching Assigned Projects...");
                let data = await getAssignedProjects_ICE(getAssignProj);
                setLoading(false);
                if (data.error) {
                    setMsg(data.error);
                    return;
                }
                data = data.map((obj)=>{
                    return {...obj, domain:domainname};
                })
                setAssignProj((prevState)=>{ return [...data, ...prevState]});
            } catch (error) {
                setMsg(MSG.GLOBAL.ERR_SOMETHING_WRONG);
            }
        })
    }

    const selectProject = async (event) => {
        const index = event.target.value;
        const projectId = assignProj[index]['_id'];
        setProject(event.target.value);
        var idtype = ["projectsdetails"];
        try {
            setLoading("Fetching details...");
            let selProjectRes = await getDetails_ICE(idtype, [projectId]);
            setLoading(false);
            if (selProjectRes.error) {
                event.preventDefault();
                setMsg(selProjectRes.error);
                return;
            }
            selProjectRes = {...selProjectRes, domain:assignProj[index]['domain']};
            setSelProjectDtls(selProjectRes);
        }
        catch (e) {
            setMsg(MSG.GLOBAL.ERR_SOMETHING_WRONG);
        }
    }

    return (
        <div style={{ height: "100%", width: "100%", }}>
            <ScrollBar thumbColor="#929397">
                <div className={classes['projAssign_container']}>
                    {loading ? <ScreenOverlay content={loading} /> : null}
                    <div id="page-taskName" style={{ paddingLeft: "0px", paddingTop: "0px", }}>
                        <span>Project Details</span>
                    </div>
                    <div className={`col-xs-9 form-group ${classes['project-container']}`}>
                        <div className={classes["project-form"]}>
                            <label className={classes["labelStyle"]}>Projects</label>
                            <select data-test="project-select-test" value={project} className={classes["select-project"]} onChange={(event) => { selectProject(event) }}>
                                <option disabled={true} key="" value="-1">Select Project</option>
                                {assignProj.map((prj, index) => (
                                    <option key={index} value={index}  >{prj.name} </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {selProjectDtls && <div data-test="project-detail-test" className={`col-xs-9 form-group ${classes['project-details-container']}`}>
                        <div className={classes["project-form"]}>
                            <label className={classes["labelStyle"]}>Project Details</label>
                            <div className={classes["project-details"]}>
                                <table className={classes['project-table']}>
                                    <tbody>
                                        <tr>
                                            <td className={classes['project-details-heading']}>App Type</td>
                                            <td data-test="app-type-test" className={classes['project-details-data']}>{selProjectDtls.appType}</td>
                                        </tr>
                                        <tr>
                                            <td className={classes['project-details-heading']}>Project Name</td>
                                            <td  data-test="project-name-test" className={classes['project-details-data']}>{selProjectDtls.projectName}</td>
                                        </tr>
                                        <tr>
                                            <td className={classes['project-details-heading']}>Domain Name</td>
                                            <td  data-test="domain-test" className={classes['project-details-data']}>{selProjectDtls.domain}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className={classes["release-details"]}>
                                    <table className={classes["detail-table"]}>
                                        <thead>
                                            <tr>
                                                <th>
                                                    Releases
                                                </th>
                                                <th>
                                                    Cycles
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selProjectDtls.projectDetails.map((dtls, i) => (
                                                <tr key={i}>
                                                    <td>{dtls.name}</td>
                                                    <td>
                                                        {dtls.cycles.map((cycle, index) => (
                                                            <span key={index}>{cycle.name}&nbsp;&nbsp;</span>
                                                        ))}
                                                    </td>
                                                </tr>
                                            )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>}
                </div>
            </ScrollBar>
        </div>
    )
}


export default UserProject;