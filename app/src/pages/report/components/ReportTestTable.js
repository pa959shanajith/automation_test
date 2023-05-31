import React from 'react'; 
import { TabView, TabPanel } from 'primereact/tabview';
import { Breadcrumbs, Link } from '@mui/material';

export default function BasicDemo() {
    return (
        <>
        <Breadcrumbs>
        <Link>Home</Link>
        <Link>Reports</Link>
        <Link>Executions</Link>
        <Link>Test Cases</Link>
        </Breadcrumbs>
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
        </>
    )
}