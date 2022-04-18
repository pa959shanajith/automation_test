import React, { useState } from "react";
import "../styles/WelcomeWizard.scss";

const WelcomeWizard = () => {
  const [page, setPage] = useState(0);

  const PageDisplay = () => {
    if (page === 0) {
      return <>
                <div className="step1">
                    <div>Welcome...</div>
                    <div>Terms and Conditions...</div>
                </div>
                <button className="type1-button"
                onClick={() => {
                    setPage((currPage) => currPage + 1);
                }}
                    >Next
                </button>
            </>;
    } else if (page === 1) {
      return <div className="welcomeInstall">
            <span>
                    <img src={"static/imgs/WelcomInstall.svg"} className="" alt=""/>
            </span>
            <div className="step2">Please install Avo Assure Client</div>
            <button className="type2-button"
                    onClick={() => {
                        setPage((currPage) => currPage + 1);
                    }}
                >Install Now
                </button>
            </div>
    } else {
        return <div className="welcomeInstall">
            <span>
                <img src={"static/imgs/WelcomeStart.svg"} className="" alt=""/>
            </span>
            <div className="step2">Thanks for installing</div>
            <button className="type2-button"
                onClick={() => {
                    setPage((currPage) => currPage + 1);
                }}
            >Start your free trial
            </button>
        </div>
    }
  };

  return (
      <div className="container1">
        <div className="form">
        <div className="progressbar">
            Step {page} of 3
        </div>
        <div className="form-container">
            {PageDisplay()}
        </div>
        </div>
    </div>
  );
}

export default WelcomeWizard;