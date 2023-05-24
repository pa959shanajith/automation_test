import React, {useState} from 'react';
import '../styles/MindmapHome.scss';
import Canvas from './Canvas';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
// import ControlBox from '../components/ControlBox';


const data ={
  name: 'Module_1',
  type: 'modules',
  state:'created',
  children: [
    {
      name: 'Scenario_1',
      type: 'scenarios',
      state:'created',
      children: [
        {
          name: 'Screen_1',
          type: 'screens',
          state:'created',
          children:[
            {
              name:'Test Case_1',
              type: 'testcases',
              state:'created',
            }
          ]
        }
      ]
    },
    {
      name: 'Scenario_2',
      type: 'scenarios',
      state:'created',
      children: [
        {
          name: 'Screen_2',
          type: 'screens',
          state:'created',
          children:[
            {
              name:'Test Case_2',
              type: 'testcases',
              state:'created',
            }
          ]
        }
      ]
    }
  ]
};

function StaticDataForMindMap() {
  const [showMindmap, setShowMindmap] = useState(false);
  const [showGenius, setShowGenius] = useState(false);
  const [showCard, setShowCard] = useState(true);

   const handleModule = ()=>{
    setShowMindmap(true)
    setShowCard(false)
   }
   const handleGenius = () =>{
    setShowGenius(true);
    setShowCard(false);
   }
  return (
    <>
    <Card style={{width: '25rem',height: '45rem'}}/>
    {showCard && <div className='cardMindmap'>
      <Card  id='p_card' className='Module'>
        <span className='cardText'>
          <h3 id='module'>Start by creating a Mindmap</h3>
          <p>Normal and E2E Modules</p>
        </span>
        <Button className='createBatton' title='Create Mindmap' onClick={handleModule} label='Create Mindmap'/>
        <img className='createBattonImg' src='static\imgs\Normal_Module.png' alt='Create Mindmap'/>
      </Card>
      <img src='static\imgs\OR.png' className='space' alt='OR'/>
      <Card id='p_card' className='avoGenius' >
        <span className='cardText'>
          <h3 id='module'>Start by triggering Avo Genius</h3>
          <p>Used Avo Genius for create mindmap</p>
        </span>
        <Button className='geniusBatton' title='Start Avo Genius' onClick={handleGenius} label='Start Avo Genius'/>
        <img className='avoGeniusImg' src='static\imgs\AvoGenius.png' alt='Start Avo Genius'/>
      </Card>
    </div>}
    {showMindmap && <Canvas selectedModule={data}/>}
    {/* {showMindmap && <ControlBox />} */}
    {showGenius && <div style={{background:'#F5F5F5'}}><Card className='avoGeniusCard' title='Welcome to Avo Genius'>
            <img className='avoGeniuscardImg' src='static\imgs\AGS.svg' alt='Avo Genius Logo'/>
          </Card></div>}
    </>
  );
}

export default StaticDataForMindMap;
