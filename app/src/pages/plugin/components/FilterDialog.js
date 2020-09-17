import React, { useState } from 'react';
import { ModalContainer } from '../../global'
import "../styles/FilterDialog.scss";

const FilterDialog = ({setShow}) => {

    const nums = [1,2,3,4,5,6,7,8,9,0,11,22,33,44,55,66,77,88,99,111,222]

    const content = () => (
        <div className="filter_body">
            <div className="body_overflow">
                <div className="body_content">
                    {
                        nums.map(num=><div>{num}</div>)
                    }
                </div>
            </div>
        </div>
    )

    const footer = () => (
        <>
            <button>Reset Fields</button>
            <button>Filter</button>
        </>
    )

    return (
        <ModalContainer 
            title="Filter Tasks"
            content={content()}
            close={()=>setShow(false)}
            footer={footer()}
        />
    );
}

export default FilterDialog;