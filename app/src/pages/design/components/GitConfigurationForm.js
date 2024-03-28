import  { useState, useRef, useEffect } from 'react';
import { FormInputGit } from '../../admin/components/FormComp';


const GitConfigurationForm = (props) => {
    return (
        <div className="flex flex-column align-items-center" style={{width:'75%',marginLeft:'17%', marginTop:'2rem',gap:"1rem",alignItems:'center'}}>

                <FormInputGit label={`${props.configName === 'git' ? 'Git' : 'Bitbucket'} Configuration `} data-test="name_git" inpRef={props.gitconfigRef} placeholder={'Enter Git Configuration Name'} />
                
                <FormInputGit label={`${props.configName === 'git' ? 'Git' : 'Bitbucket'}  Access Token`} data-test="token_git" inpRef={props.tokenRef} placeholder={'Enter Git Access Token'} />
              
                <FormInputGit label={`${props.configName === 'git' ? 'Git' : 'Bitbucket'}  URL`} data-test="url_git" inpRef={props.urlRef} placeholder={'Enter Git URL'} />
             
                <FormInputGit label={`${props.configName === 'git' ? 'Git' : 'Bitbucket'}  User Name`} data-test="username_git" inpRef={props.gituserRef} placeholder={'Enter Git Username'} />
          
                <FormInputGit label={`${props.configName === 'git' ? 'Git' : 'Bitbucket'}  User Email`} data-test="email_git" inpRef={props.gitemailRef} placeholder={'Enter Git Email Id'} />
              
                <FormInputGit label={`${props.configName === 'git' ? 'Git' : 'Bitbucket'}  Branch`} data-test="email_git" inpRef={props.gitbranchRef} placeholder={'Enter Branch'} />

                {props.configName === "bit" && <FormInputGit label={`${props.screenName} Project Key`} data-test="project_key" inpRef={props.bitProjectKey} placeholder={'Enter key'} />}
             
          </div>
    )
}
export default GitConfigurationForm;