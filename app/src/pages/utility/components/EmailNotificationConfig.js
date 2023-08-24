import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { FormInput } from '../../settings/components/AllFormComp';
import { Toggle } from '@avo/designcomponents';


const EmailNotificationConfig = React.memo(({ displayModal, onHide, handleSubmit, isEmailNotificationEnabled, defaultValues = {}, setDefaultValues, isNotifyOnExecutionCompletion, setIsNotifyOnExecutionCompletion}) => {

    return (
           <div>
                { isEmailNotificationEnabled ?
                    <div>
                        <Dialog id='email-config_dialog' header='Email Notification Configuration' visible={displayModal}
                            onHide={() => onHide('displayModal')}
                        >
                            <form id='email-config_form'>
                                <div className='Email-Config_input'>
                                    {/* <div className="flex flex-row row_gap">
                                        <label className="input-label">Sender:</label>
                                        <FormInput type="text" id="email-config_sender_email"
                                            name="email-config_sender_email"
                                            value={defaultValues.EmailSenderAddress}
                                            className="email-config_input_sender_address"
                                            disabled={true} />
                                    </div> */}
                                    <div className="flex flex-row row_gap">
                                        <label className="input-label">Receiver:</label>
                                        <FormInput type="text" id="email-config_reciever_email" name="email-config_reciever_email" value={defaultValues.EmailRecieverAddress} 
                                             onChange={(event) => {
                                                setDefaultValues({ ...defaultValues, EmailRecieverAddress: event.target.value });
                                            }}
                                            className="email-config_input_reciever_address" />
                                    </div>
                                    <div>
                                        <div data-test="intg_log_error_span" className="email-notification__bottom_msg">Add multiple receiver emails separated by a comma(,).</div>
                                    </div>
                                    <div className="flex flex-row row-gap__toggle">
                                        <label className="input-label">Notify only on Execution Completion: </label>
                                        <div className="email-notify__on_completion">
                                            <label className="email-notify__on_completion_toggle_off">Off</label>
                                            <Toggle checked={isNotifyOnExecutionCompletion} onChange={() => {
                                                setIsNotifyOnExecutionCompletion(!isNotifyOnExecutionCompletion)
                                            }} label="" inlineLabel={true} />
                                            <label className="email-notify__on_completion_toggle_on">On</label>
                                        </div>
                                    </div>
                                </div>
                            </form>
                            <Button id='email-config_submit' label="Save"
                                onClick={() => handleSubmit(defaultValues)}/>
                        </Dialog>
                    </div> : null
                }
           </div>
    )
});

export {
    EmailNotificationConfig
}