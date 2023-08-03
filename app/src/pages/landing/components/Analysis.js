import React from 'react';
import {Card} from 'primereact/card';
import {Button} from 'primereact/button';
import '../styles/Analysis.scss';


const Analysis = (props) => {
    const header = (
        <div className='no_report_card_content'>
            <img alt="Card" src="static/imgs/execution_report.png" height="70px"/>
            <span >No Test Report Available</span>
        </div>
    )
    const tileButtonClickHandler = () => {
        const win = window.open("https://avoautomation.gitbook.io/avo-trial-user-guide/executing-a-test-flow", "_blank");
        win.focus();
    }
    return (
    <>
    <div className='analysis_container surface-100'>
        
        <div className=' left_card_container'>
            <div className='flex flex-row'>
                <img src="static/imgs/analysis_time_icon.png" className='card_header'></img>
                <span className='card_header__text'><h5>Latest Tested Build</h5></span>
            </div>
            <Card  header={header} className='surface-card shadow-3 m-3 analysis_small_card'></Card>
            <div className='flex flex-row'>
                <img src="static/imgs/analysis_time_icon.png" className='card_header'></img>
                <span className='card_header__text'><h5>Latest Tested Build</h5></span>
            </div>
            <Card  header={header} className='surface-card shadow-3 m-3 analysis_small_card'></Card>
        </div>

        <div className='right_card_container'>
            <div className='flex flex-row'>
                <span className='card_header__Execution_text'><h5>Recent Execution Reports</h5></span>
            </div>
            <Card header={header} className='surface-card shadow-3 m-3 analysis_big_card'></Card>

            {/* <div className='flex flex-row'>
                <div className='tiles_container'>
                    <img src="static/imgs/blue_tile.png" className='avo_tile'></img>
                    <div className='first_tile_text'>  
                        <span className='tile_header'>DO MORE WITH AVO</span>
                        <h3>Use Pre-built Automation Libraries</h3>
                        <a target="_blank" href="https://avoautomation.gitbook.io/avo-trial-user-guide/executing-a-test-flow">
                            <Button className='btn' size="small" rounded text raised>Go to Learning Center</Button>
                        </a>
                     </div>
                </div>

                <div className='tiles_container'>
                    <img src="static/imgs/blue_tile.png"className='avo_tile'></img>
                    <div className='second_tile_text'> 
                        <span className='tile_header'>DO MORE WITH AVO</span>
                        <h3> Set-up Test Data Management</h3>
                        <a target="_blank" href="https://avoautomation.gitbook.io/avo-trial-user-guide/executing-a-test-flow">
                            <Button className='btn' size="small" rounded text raised>Go to Learning Center</Button>
                        </a>   
                    </div>
                </div>  
            </div> */}
        </div>

    </div>
    </>
    );
}

export default Analysis;