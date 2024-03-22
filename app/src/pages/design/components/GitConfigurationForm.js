import  { useState, useRef, useEffect } from 'react';
import { FormInputGit } from '../../admin/components/FormComp';


const GitConfigurationForm = (props) => {
    return (
        <div className="flex flex-column " style={{width:'75%',marginLeft:'17%', marginTop:'2rem',gap:"1rem",alignItems:'center'}}>

                <FormInputGit label="Git Configuration" data-test="name_git" inpRef={props.gitconfigRef} placeholder={'Enter Git Configuration Name'} />
                
                <FormInputGit label="Git Access Token" data-test="token_git" inpRef={props.tokenRef} placeholder={'Enter Git Access Token'} />
              
                <FormInputGit label="Git URL" data-test="url_git" inpRef={props.urlRef} placeholder={'Enter Git URL'} />
             
                <FormInputGit label="Git User Name" data-test="username_git" inpRef={props.gituserRef} placeholder={'Enter Git Username'} />
          
                <FormInputGit label="Git User Email" data-test="email_git" inpRef={props.gitemailRef} placeholder={'Enter Git Email Id'} />
              
                <FormInputGit label="Git Branch" data-test="email_git" inpRef={props.gitbranchRef} placeholder={'Enter Branch'} />
             
          </div>
    )
}
export default GitConfigurationForm;