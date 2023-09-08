import React, { useEffect, useState, Fragment } from 'react';
import socketIOClient from "socket.io-client";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ModalContainer, VARIANT, RedirectPage, Messages as MSG, setMsg } from './pages/global';
import { v4 as uuid } from 'uuid';
import { loadUserInfoActions } from './pages/landing/LandingSlice';
import { url } from './App'
import { UpdateUserInfoforLicence } from './pages/login/api';
import { Buffer } from 'buffer';
import { NavLink } from 'react-router-dom';
import { Button } from 'primereact/button';

/*Component SocketFactory
  use: creates/updates socket connection
  1 : notify -> used in mindmap screen assign notification updates header header notify
  2 : result_ExecutionDataInfo -> execution completion popups
*/

const SocketFactory = () => {
    const [showAfterExecution, setShowAfterExecution] = useState({ show: false })
    const [showAfterExecutionIsTrial, setShowAfterExecutionIsTrial] = useState({ show: false })
    const [reportData, setReportData] = useState(undefined)
    const userInfo = useSelector(state => state.landing.userinfo);
    const socket = useSelector(state => state.landing.socket);
    const dispatch = useDispatch();
    const history = useNavigate();
    useEffect(() => {
        if (socket) {
            socket.on('notify', (value) => {
                if (value.count === 0 && 'notifyMsg' in value) {
                    dispatch(loadUserInfoActions.updateNotify(value));
                }
            });
            socket.on("result_ExecutionDataInfo", (result) => {
                executionDATA(result)
            });
            socket.on('display_execution_popup', (value) => {
                displayExecutionPopup(value);
            });
            socket.on('killSession', (by, reason) => {
                return RedirectPage(history, { by: by, reason: reason })
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket])

    useEffect(() => {
        var userName = Buffer.from((userInfo && userInfo.username) ? userInfo.username : uuid()).toString('base64')
        var socket = socketIOClient(url, { forceNew: true, reconnect: true, query: { check: 'notify', key: userName } });
        dispatch(loadUserInfoActions.setSocket(socket));
        return (() => {
            socket.close();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userInfo])

    const PostExecution = () => {
        return (
            <div className="afterExecution-modal">
                <ModalContainer
                    show={showAfterExecution.show}
                    title={"Execution Status"}
                    content={<>
                        <p className='pt-4' style={{ cursor: 'default' }}>{showAfterExecution.content} <br />
                            Go to
                            <NavLink
                                to="/profile"
                                state={{
                                    execution: reportData.configurename,
                                    configureKey: reportData.configurekey,
                                }}
                                className="Profile_Name"
                                activeClassName="active"
                            >
                                <span
                                    style={{ color: '#643693', cursor: 'pointer', fontWeight: 'bold' }}
                                    onClick={() => { redirectToReports(); setShowAfterExecution({ show: false }) }}
                                > Reports </span>
                            </NavLink>
                        </p>
                    </>}
                    close={() => setShowAfterExecution({ show: false })}
                    footer={
                        <Button label="Ok" size="small" onClick={() => setShowAfterExecution({ show: false })}></Button>
                    }
                />
            </div>
        )
    };

    const closeTrial = () => {
        if (userInfo.isTrial) {
            userInfo.isTrial = false;
            dispatch(loadUserInfoActions.setUserInfo(userInfo));
        }
    }

    const PostExecutionIsTrial = () => {
        return (
            <div className="afterExecution-modal1">
                <ModalContainer
                    show={showAfterExecutionIsTrial.show}
                    title={"Congratulations"}
                    content={
                        <><p style={{ cursor: 'default', color: 'green', fontSize: '24px' }}><span>You have done it !!</span></p>
                            {/* <p style={{ cursor: 'default' }}>{showAfterExecution.content} <br /> */}
                            <p style={{ cursor: 'default' }}>{showAfterExecutionIsTrial.content}
                                <p><span onClick={() => { redirectToReports(); setShowAfterExecutionIsTrial({ show: false }); closeTrial(); }} style={{ color: '#643693', cursor: 'pointer', fontWeight: 'bold' }}>Click Here</span> to view your execution report</p>
                                <p style={{ fontWeight: 'bold' }}>As a valued user, we have also upgraded you to Free variant of Avo Assure. Click <span><a style={{ color: '#643693', cursor: 'pointer' }} href="https://avoautomation.ai/cloud-pricing/" target="_blank" rel="noopener noreferrer"> View Plans</a> </span> to know more.</p>
                            </p>
                            <p>Please Logout and Login back to access your work in upgraded version of Avo Assure</p>
                        </>

                    }

                    close={() => { setShowAfterExecutionIsTrial({ show: false }); closeTrial(); }}
                    footer={

                        <Button label="Ok" size="small" onClick={() => setShowAfterExecutionIsTrial({ show: false })}></Button>
                    }
                />
            </div>
        )
    };

    const redirectToReports = () => {
        dispatch(loadUserInfoActions.updateReport(reportData));
    }

    const executionDATA = async (result) => {
        var data = result.status
        var testSuiteIds = result.testSuiteDetails;
        var msg = "";
        testSuiteIds[0]["projectidts"] = testSuiteIds[0]["projectid"];
        msg = testSuiteIds[0]["testsuitename"]
        setReportData(result)

        if (data === "Terminate") {
            setShowAfterExecution({ show: true, title: msg, content: "Execution terminated - By Program." })
            setShowAfterExecutionIsTrial({ show: true, title: msg, content: "Execution terminated - By Program." })
        }
        else if (data === "UserTerminate") {
            setShowAfterExecution({ show: true, title: msg, content: "Execution terminated - By User." })
            setShowAfterExecutionIsTrial({ show: true, title: msg, content: "Execution terminated - By User." })
        }
        else if (data === "unavailableLocalServer") {
            setMsg(MSG.GENERIC.UNAVAILABLE_LOCAL_SERVER);
        }
        else if (data === "success") {
            if (userInfo.isTrial === true) {
                await UpdateUserInfoforLicence(userInfo.username)
                // setShowAfterExecution({show:true,title:msg,content:"Execution completed successfully." })
                setShowAfterExecutionIsTrial({ show: true, title: msg, content: "You have successfully automated your first test scenario." })
            }
            else {
                setShowAfterExecution({ show: true, title: msg, content: "Execution completed successfully." })
                // setShowAfterExecutionIsTrial({show:true,title:msg,content:"You have successfully automated your test scenario." })
            }
        } else if (data === "Completed") {
            setMsg(MSG.CUSTOM(msg, VARIANT.SUCCESS));
        } else if (data === 'accessibilityTestingSuccess') {
            setMsg(MSG.CUSTOM(msg + ": Accessibility Testing completed Successfully.", VARIANT.SUCCESS));
        } else if (data === 'accessibilityTestingTerminate') {
            setMsg(MSG.CUSTOM("Accessibility Testing Terminated.", VARIANT.ERROR));
        }
        else setMsg(MSG.CUSTOM("Failed to execute.", VARIANT.ERROR));
    }



    return (
        <Fragment>
            {userInfo.isTrial ? (
                (
                    (showAfterExecutionIsTrial.show && < PostExecutionIsTrial />)
                )
            ) : (
                (showAfterExecution.show && <PostExecution />)
            )}
        </Fragment>
    )
}

const displayExecutionPopup = (value) => {
    var msg = "";
    var val, executionVariant = VARIANT.WARNING;
    for (val in value) {
        var data = value[val].status;
        var testSuite = value[val].testSuiteIds;
        var exec = testSuite[0].testsuitename + ": "
        if (data == "begin") continue;
        if (data == "unavailableLocalServer") { data = exec + "No Intelligent Core Engine (ICE) connection found with the Avo Assure logged in username. Please run the ICE batch file once again and connect to Server."; executionVariant = VARIANT.ERROR; }
        else if (data == "NotApproved") { data = exec + "All the dependent tasks (design, scrape) needs to be approved before execution"; executionVariant = VARIANT.ERROR; }
        else if (data == "NoTask") { data = exec + "Task does not exist for child node"; executionVariant = VARIANT.ERROR; }
        else if (data == "Modified") { data = exec + "Task has been modified, Please approve the task"; executionVariant = VARIANT.ERROR; }
        else if (data == "Completed") { data = exec + "Execution Complete"; executionVariant = VARIANT.SUCCESS; }
        else if (data == "Terminate") { data = exec + "Terminated"; executionVariant = VARIANT.ERROR; }
        else if (data == "UserTerminate") { data = exec + "Terminated by User"; executionVariant = VARIANT.ERROR; }
        else if (data == "success") { data = exec + "success"; executionVariant = VARIANT.SUCCESS; }
        else if (data == "API Execution Completed") { data = exec + "API Execution Completed"; executionVariant = VARIANT.SUCCESS; }
        else if (data == "API Execution Fail") { data = exec + "API Execution Failed"; executionVariant = VARIANT.ERROR; }
        else { data = exec + "Failed to execute."; executionVariant = VARIANT.ERROR; }
        msg = msg + "\n" + data;
    }
    if (msg && msg.trim() != "") {
        setMsg(MSG.CUSTOM(msg, executionVariant));
    }
}

export default SocketFactory;