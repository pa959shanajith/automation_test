import  { useState, useRef, useEffect } from 'react';
import { FormInputGit } from '../../admin/components/FormComp';


const GitConfigurationForm = (props) => {
    return (
        <div className="mt-2">
            <div className='git_input'>
              <div className='flex flex-row justify-content-between align-items-center'>
                <span htmlFor='label_git' className='gitConfigurationLabel' >Git Configuration</span>
                <FormInputGit data-test="name_git" inpRef={props.gitconfigRef} placeholder={'Enter Git Configuration Name'} />
              </div>
            </div>
            <div className='git_input'>
              <div className='flex flex-row justify-content-between align-items-center'>
                <span htmlFor='label_git' className='gitConfigurationLabel'>Git Access Token</span>
                <FormInputGit data-test="token_git" inpRef={props.tokenRef} placeholder={'Enter Git Access Token'} />
              </div>
            </div>
            <div className='git_input'>
              <div className='flex flex-row justify-content-between align-items-center'>
                <span htmlFor='label_git' className='gitConfigurationLabel' >Git URL</span>
                <FormInputGit data-test="url_git" inpRef={props.urlRef} placeholder={'Enter Git URL'} />
              </div>
            </div>

            <div className='git_input'>
              <div className='flex flex-row justify-content-between align-items-center'>
                <span htmlFor='label_git' className='gitConfigurationLabel'>Git User Name</span>
                <FormInputGit data-test="username_git" inpRef={props.gituserRef} placeholder={'Enter Git Username'} />
              </div>
            </div>
            <div className='git_input'>
              <div className='flex flex-row justify-content-between align-items-center'>
                <span htmlFor='label_git' className='gitConfigurationLabel' >Git User Email</span>
                <FormInputGit data-test="email_git" inpRef={props.gitemailRef} placeholder={'Enter Git Email Id'} />
              </div>
            </div>
            <div className='git_input'>
              <div className='flex flex-row justify-content-between align-items-center'>
                <span htmlFor='label_git' className='gitConfigurationLabel' >Git Branch</span>
                <FormInputGit data-test="email_git" inpRef={props.gitbranchRef} placeholder={'Enter Branch'} />
              </div>
            </div>
          </div>
    )
}
export default GitConfigurationForm;