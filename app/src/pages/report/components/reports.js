/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { Button } from 'primereact/button';
import { SplitButton } from 'primereact/splitbutton';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import {Card} from 'primereact/card';


const reports = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [reportData, setReportData] = useState([{
        key: "Execute 1",
        value: ""
    },{
        key: "Execute 2",
        value:""
    }
])
    const tab3HeaderTemplate = (options) => {
        const items = [
            { label: 'Update', icon: 'pi pi-refresh' },
            { label: 'Delete', icon: 'pi pi-times' },
            { label: 'Upload', icon: 'pi pi-upload' }
        ];

        return (
            <SplitButton label="Reports" icon="pi pi-plus" onClick={options.onClick} className="px-2" model={items}></SplitButton>
        )
    };
    function handleClick(event) {
        event.preventDefault();
        console.info('You clicked a breadcrumb.');
      }

    return(
        <div>
            <div role="presentation" onClick={handleClick}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" href="/">
          Home
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="/material-ui/getting-started/installation/"
        >
          Reports
        </Link>
        {/* <Typography color="text.primary"></Typography> */}
      </Breadcrumbs>
    </div>
            <TabView>
                <TabPanel headerTemplate={tab3HeaderTemplate} headerClassName="flex align-items-center"></TabPanel>
            </TabView>
            <div className="card">
                <div className="flex flex-wrap gap-2 mb-3">
                    <Button onClick={() => setActiveIndex(0)} className="p-button-text" label="Activate 1st" />
                    <Button onClick={() => setActiveIndex(1)} className="p-button-text" label="Activate 2nd" />
                    <Button onClick={() => setActiveIndex(2)} className="p-button-text" label="Activate 3rd" />
                </div>
                <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                    <TabPanel>
                       {reportData.map((data)=><Card key={data.key}></Card>)}
                    </TabPanel>
                    <TabPanel>
                       {reportData.map((data)=><Card key={data.key}></Card>)}
                    </TabPanel>
                    <TabPanel>
                       {reportData.map((data)=><Card key={data.key}></Card>)}
                    </TabPanel>
                </TabView>
            </div>
        </div>
    )
}

export default reports;