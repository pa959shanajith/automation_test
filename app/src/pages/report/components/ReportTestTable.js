import React, {useEffect, useState} from 'react'; 
import { TabView, TabPanel } from 'primereact/tabview';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { TreeTable } from 'primereact/treetable';
import { Button } from 'primereact/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { viewReport} from '../api';

export default function BasicDemo() {
    const navigate = useNavigate()
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const location = useLocation();
    const [reportData,setReportData] = useState([]);
    const [reportViewData, setReportViewData] = useState([]);
    const [expandedKeys, setExpandedKeys] = useState(null);

    useEffect(() => {
        const documentStyle = getComputedStyle(document.documentElement);
        const data = {
            labels: ['A', 'B', 'C','D', 'E'],
            datasets: [
                {
                    data: [0, 0, 100, 0,0],
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
    
    useEffect(()=>{
        (async()=>{
            const view = await viewReport(location?.state?.id);
            setReportData(JSON.parse(view))
        })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[location])
    useEffect(() => {
        const parent = [];
        if (reportData && Array.isArray(reportData.rows)) {
            for (const obj of reportData.rows) {
                if (obj.hasOwnProperty('Step')) {
                    if (!parent[parent.length - 1].children) {
                        parent[parent.length - 1].children = [obj];  // Push the new object into parent array
                    } else {
                        parent[parent.length - 1].children.push(obj); // Push the object into existing children array
                    }
                } else {
                    parent.push(obj); // Push the object into parent array
                }
            }
        } else {
            // Handle the case when reportData or reportData.rows is not as expected.
            console.error('reportData.rows is not defined or not an array.');
        }
        setReportViewData(parent);
    },[reportData])

    const convertDataToTree = (data) => {
        const treeDataArray = [];
        for (let i = 0; i < data.length; i++) {
          const rootNode = {
            key:data[i].id,
            data: { StepDescription: data[i].StepDescription, slno: data[i].slno, key:data[i].id },
            children: [],
          };
          data[i].children?.forEach((child) => {
            rootNode.children.push({
              data: child,
            });
          });
          treeDataArray.push(rootNode); // Add the rootNode to the array
        }
        return treeDataArray; // Return the array of treeData
      };
      
    const treeData = convertDataToTree(reportViewData)
    
    // const [expandedRows, setExpandedRows] = useState([]);

    // const allowExpansion = (rowData) => {
    //     return rowData.children.length > 0;
    // };
    // const rowExpansionTemplate = (data) => {
    //     return (
    //             <DataTable value={data.children}>
    //                 <Column style={{width:'2rem'}}/>
    //                 <Column field="slno" header='S No.'></Column>
    //                 <Column field="Step" header='Steps' ></Column>
    //                 <Column field='Keyword'  header='Description'/>
    //                 <Column field="EllapsedTime"  header='Time Elapsed' ></Column>
    //                 <Column field="status"  header='Status' ></Column>
    //                 <Column field='comments'  header='Comments' />
    //                 <Column field='jira_defect_id'  header='Jira' />
    //                 <Column field='azure_defect_id' header='Azure'  />
    //                 <Column field='action'  header='Action' />
    //             </DataTable>
    //     );
    // };
    const handdleExpend = (e) =>{
        setExpandedKeys(e.value)
    }

    return (
        <div>
        <Button label="Back" onClick={()=>handdleViweReportsBack()} size="small" outlined />
        <div className="cards">
            <TabView>
                <TabPanel header="Summary">
                    <div className='flex-row flex justify-content-around'>
                        <p className='grid flex-column'>
                            <p>Avo Assure version</p>
                            <p>startEnd</p>
                            <p>Elapsed</p>
                            <p>Total Test Cases</p>
                            <p>Local OS</p>
                            <p>Platfrom</p>
                        </p>
                        <div className="card flex justify-content-center">
                            <Chart type="doughnut" data={chartData} options={chartOptions} className="w-full md:w-15rem" />
                        </div>
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
        <br></br>
        {/* <DataTable value={reportViewData} expandedRows={expandedRows}  onRowToggle={(e) => setExpandedRows(e.data)}
            rowExpansionTemplate={rowExpansionTemplate}
            dataKey="id" tableStyle={{ minWidth: '60rem' }}>
            <Column expander={allowExpansion} style={{ width: '2rem' }} />
            <Column field="slno" header="S No."/>
            <Column field='Step' header='Steps'/>
            <Column field='StepDescription' header="Description" />
            <Column field="EllapsedTime" header="Time Elapsed"/>
            <Column field="Status" header="Status"/>
            <Column field='comments' header='Comments'/>
            <Column  header="Jira Defect ID"/>
            <Column  header="Azure Defect ID"/>
            <Column header='Action'/>
        </DataTable> */}
        <TreeTable value={treeData} expandedKeys={expandedKeys} dataKey='id' onToggle={(e) => handdleExpend(e)} tableStyle={{ minWidth: '50rem' }} >
            <Column field="slno" header="S No." expander/>
            <Column field='Step' header='Steps'/>
            <Column field='StepDescription' header="Description" />
            <Column field="EllapsedTime" header="Time Elapsed"/>
            <Column field="status" header="Status"/>
            <Column field='Comments' header='Comments'/>
            <Column  header="Jira Defect ID"/>
            <Column  header="Azure Defect ID"/>
            <Column header='Action'/>
        </TreeTable>
        </div>
    )
}