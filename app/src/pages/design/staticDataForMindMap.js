import React, {useState} from 'react';
import './Mindmap.scss';
import Module from './node-modules.png';
import Scenario from './node-scenarios.png';
import Screen from './node-screens.png';
import Test from './node-testcases.png';
import TreeGraph from './TreeGraph';
import { ConfirmDialog } from 'primereact/confirmdialog';


const nodes = {
  1: {
    name: 'Module 1',
    img_src: Module,
    type: 'modules',
    title: 'Module 1',
    transform: 'translate(180,121.32000000000001)',
    hidden: false,
    state: 'created',
    x: 50,
    y: 50,
  },
  2: {
    name: 'Scenario 1',
    img_src: Scenario,
    type: 'scenario',
    title: 'Scenario 1',
    transform: 'translate(60,256.12)',
    hidden: false,
    state: 'created',
    x: -50,
    y: 150,
  },
  3: {
    name: 'Screen 1',
    img_src: Screen,
    type: 'screen',
    title: 'Screen 1',
    transform: 'translate(60,390.92)',
    hidden: false,
    state: 'created',
    x: -50,
    y: 250,
  },
  4: {
    name: 'Test Case 1',
    img_src: Test,
    type: 'testcases',
    title: 'Test Case 1',
    transform: 'translate(60,525.72)',
    hidden: false,
    state: 'created',
    x: -50,
    y: 350,
  },
  5:{
    name: 'Scenario 2',
    img_src: Scenario,
    type: 'scenario',
    title: 'Scenario 2',
    transform: 'translate(300,256.12)',
    hidden: false,
    state: 'created',
    x: 150,
    y: 150,
  },
  6: {
    name: 'Screen 2',
    img_src: Screen,
    type: 'screen',
    title: 'Screen 2',
    transform: 'translate(300,390.92)',
    hidden: false,
    state: 'created',
    x: 150,
    y: 250,
  },
  7: {
    name: 'Test Case 2',
    img_src: Test,
    type: 'testcases',
    title: 'Test Case 2',
    transform: 'translate(300,525.72)',
    hidden: false,
    state: 'created',
    x: 150,
    y: 350,
  },
};


const links ={
  1:{
    d:'M200,176.32C200,214.72 80,214.72 80,253.12',
    hidden:false
    },
    2:{
    d:"M200,176.32C200,214.72 320,214.72 320,253.12",
    hidden:false
    },
    3:{
    d:'M80,311.12C80,349.52 80,349.52 80,387.92',
    hidden:false
    },
    4:{
    d:'M80,445.92C80,484.32000000000005 80,484.32000000000005 80,522.72',
    hidden:false
    },
    5:{
    d:'M320,311.12C320,349.52 320,349.52 320,387.92',
    hidden:false
    },
    6:{
    d:'M320,445.92C320,484.32000000000005 320,484.32000000000005 320,522.72',
    hidden:false
    }
  };
  


const dNodes = {
  1: {
    _children: ['2','5']
  },
  2: {
    _children: ['3']
  },
  3: {
    _children: ['4']
  },
  5:{
    _children: ['6']
  },
  6:{
    _children: ['7']
  },
};



function StaticDataForMindMap() {

  const [visible, setVisible] = useState(true);
  const [showMindmap, setShowMindmap] = useState(false);

    const accept = () => {
        setShowMindmap(true)
    }

    const reject = () => {
      setShowMindmap(true)
    }

  return (
    <>
    {visible && <img src='static\imgs\MindmapImage.PNG' alt='MindMap'/>}
     <ConfirmDialog visible={visible} position='bottom-right'  onHide={() => setVisible(false)} message="Are you sure you want to proceed?"
                    header="Confirmation" icon="pi pi-info-circle" accept={accept} reject={reject} />
    {showMindmap && <TreeGraph nodes={nodes} links={links} dNodes={dNodes}/>}
    </>
  );
}

export default StaticDataForMindMap;
