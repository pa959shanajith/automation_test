import React from 'react';
import "../styles/DesignContent.scss";

const DesignContent = ({taskName, status}) => {

    const tableActionBtnGroup = [
        {'title': 'Add Test Step', 'img': 'static/imgs/ic-jq-addstep.png', 'alt': 'Add Steps', 'onClick': ''},
        {'title': 'Edit Test Step', 'img': 'static/imgs/ic-jq-editstep.png', 'alt': 'Edit Steps', 'onClick': ''},
        {'title': 'Drag & Drop Test Step', 'img': 'static/imgs/ic-jq-dragstep.png', 'alt': 'Drag Steps', 'onClick': ''},
        {'title': 'Copy Test Step', 'img': 'static/imgs/ic-jq-copystep.png', 'alt': 'Copy Steps', 'onClick': ''},
        {'title': 'Paste Test Step', 'img': 'static/imgs/ic-jq-pastestep.png', 'alt': 'Paste Steps', 'onClick': ''},
        {'title': 'Skip Test Step', 'img': 'static/imgs/ic-jq-commentstep.png', 'alt': 'Comment Steps', 'onClick': ''}
    ]

    return (
        <div className="d__content">

            { /* Task Name */ }
            <div className="d__task_title">
                <div className="d__task_name">{taskName || "Design 8_Sep"}</div>
            </div>

            { /* Button Group */ }
            <div className="d__btngroup">
                <div className="d__table_ac_btn_grp">
                {
                    tableActionBtnGroup.map(btn => 
                        <button className="d__tblBtn"><img className="d__tblBtn_ic" src={btn.img} alt={btn.alt} title={btn.title}/> </button>
                    )
                }
                </div>

                <div className="d__taskBtns">
                    <button className="d__taskBtn d__btn">Save</button>
                    <button className="d__taskBtn d__btn">Delete</button>
                </div>

                <div className="d__submit">
                    { status === "underReview" && <button className="d__reassignBtn d__btn">Reassign</button>}
                    <button className="d__submitBtn d__btn">{status === "underReview" ? "Approve" : "Submit"}</button>
                </div>

            </div>

        </div>
    );

}




export default DesignContent;