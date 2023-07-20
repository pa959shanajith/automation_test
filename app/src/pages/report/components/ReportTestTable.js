import React, {useEffect, useState} from 'react'; 
import { TabView, TabPanel } from 'primereact/tabview';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function BasicDemo() {
    const navigate = useNavigate()
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        const documentStyle = getComputedStyle(document.documentElement);
        const data = {
            labels: ['A', 'B', 'C','D', 'E'],
            datasets: [
                {
                    data: [100, 50, 10, 20,40],
                    backgroundColor: [
                        documentStyle.getPropertyValue('--blue-500'), 
                        documentStyle.getPropertyValue('--yellow-500'), 
                        documentStyle.getPropertyValue('--green-500'),
                        documentStyle.getPropertyValue('--red-500'),
                        documentStyle.getPropertyValue('--orange-500')
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--blue-400'), 
                        documentStyle.getPropertyValue('--yellow-400'), 
                        documentStyle.getPropertyValue('--green-400'),
                        documentStyle.getPropertyValue('--red-500'),
                        documentStyle.getPropertyValue('--orange-500')
                    ]
                }
            ]
        };
        const options = {
            cutout: '60%'
        };

        setChartData(data);
        setChartOptions(options);
    }, []);
    function handdleViweReportsBack(){
        navigate('/reports')
    }
    return (
        <>
        <Button label="Back" onClick={()=>handdleViweReportsBack()} size="small" outlined />
        <div className="cards">
            <TabView>
                <TabPanel header="Summary">
                    <div>
                        Avo Assure version
                        startEnd
                        Elapsed
                        Total Test Cases
                        Local OS
                        Platfrom
                    </div>
                    <div className="card flex justify-content-center">
                        <Chart type="doughnut" data={chartData} options={chartOptions} className="w-full md:w-15rem" />
                    </div>
                </TabPanel>
                <TabPanel header="Execution Settings">
                    <p className="m-0">
                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, 
                        eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo
                        enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui 
                        ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi.
                    </p>
                </TabPanel>
                <TabPanel header="Execution Environment">
                    <p className="m-0">
                        At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti 
                        quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in
                        culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. 
                        Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
                    </p>
                </TabPanel>
            </TabView>
        </div>
        <DataTable/>
        </>
    )
}