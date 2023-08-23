import React, { useState, useEffect } from 'react';
import {Messages as MSG, VARIANT, setMsg, ModalContainer, ScrollBar, ScreenOverlay, Footer} from '../../global';
// import { SearchBox, DetailsList, Tab } from '@avo/designcomponents';
import '../styles/Agents.scss';
// import ReactTooltip from 'react-tooltip';
import AgentsList from './AgentsList';
import AgentStatistics from './AgentStatistics'
// import GridList from './GridList';
import { Button } from 'primereact/button';
import { TabMenu } from 'primereact/tabmenu';
import { InputText } from 'primereact/inputtext';

/* Component Agents */

const Agents = () => {
    const [loading,setLoading] = useState(false);
    // const [selectedTab, setSelectedTab] = useState('grids');
    const [activeIndex, setActiveIndex] = useState(0);
    const [showConfirmPop, setShowConfirmPop] = useState(false);


    const ConfirmPopup = () => (
        <ModalContainer 
            title={showConfirmPop.title}
            content={showConfirmPop.content}
            close={()=>setShowConfirmPop(false)}
            footer={
                <>
                <Button onClick={showConfirmPop.onClick}>Yes</Button>
                <Button onClick={()=>setShowConfirmPop(false)}>No</Button>
                </>
            }
        />
    );
    const showMessageBar = (message, selectedVariant) => (
        setMsg(MSG.CUSTOM(message,VARIANT[selectedVariant]))
    );

    const items = [
        { label: 'Agent Statistics' },
        { label: 'Mange Agent' },
    ];


    return (<>
        {loading?<ScreenOverlay content={loading}/>:null}
        { showConfirmPop && <ConfirmPopup /> }
        <div className='agent-container'>
        <AgentsList setShowConfirmPop={setShowConfirmPop} showMessageBar={showMessageBar} setLoading={setLoading} />
            {/* <TabMenu options={[
                { key: 'grids', text: 'Grids' },
                { key: 'agents', text: 'Agents' }
            ]} activeIndex={selectedTab} onTabChange = {(item) => item && setSelectedTab(item.props.itemKey)} /> */}
            {/* <TabMenu className='tab-menu' model={items} activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} />
            {activeIndex === 0 && <AgentStatistics />}
            {activeIndex === 1 && <AgentsList setShowConfirmPop={setShowConfirmPop} showMessageBar={showMessageBar} setLoading={setLoading} />} */}
            {/* { selectedTab === 'agents' ? <AgentsList setShowConfirmPop={setShowConfirmPop} showMessageBar={showMessageBar} setLoading={setLoading} /> : 
                <GridList setShowConfirmPop={setShowConfirmPop} showMessageBar={showMessageBar} setLoading={setLoading} />
            } */}
        </div>
        {/* <div>
            <p>HI</p>
        </div> */}
    </>);
}

export default Agents;