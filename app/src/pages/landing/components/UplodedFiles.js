import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const UplodedFiles = ({ userData }) => {
  const [sortedData, setSortedData] = useState([]);

  const extractFilename = (path) => {
    const parts = path.split(/[\\/]/);
    return parts[parts.length - 1];
  };
  useEffect(() => {
    if (userData.data && userData.data.length > 0) {
      const sorted = userData.data.slice().sort((a, b) => new Date(b.uploadedTime) - new Date(a.uploadedTime));
      setSortedData(sorted);
    }
  }, [userData.data]);

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const timestamp = new Date(dateString);
    return timestamp.toLocaleDateString('en-GB', options);
  };

  return (
    <>
      <div>
        <div >
          <DataTable value={sortedData} className="p-datatable-custom">
                      <Column field="path" header="File Name" body={(rowData) => extractFilename(rowData.path)} />
            <Column field="version" header="Version" />
            <Column field="uploadedTime" header="Upload Date" body={(rowData) => formatDate(rowData.uploadedTime)} />
          </DataTable>
        </div>
      </div>
    </>
  );
};

export default UplodedFiles;
