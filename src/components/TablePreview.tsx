import React, {useMemo} from 'react';
import DataGrid, { Column } from 'react-data-grid';

type TablePreviewProps = {
  data: Array<Record<string, any>>;
  columns: Array<string>;
  code?: string;
  total?: number;
};

const TablePreview: React.FC<TablePreviewProps> = ({ data, columns, code, total }) => {
    // const gridColumns: Column [] = columns.map((colName) => ({
  const gridColumns: any [] = columns.map((colName) => ({
    key: colName,
    name: colName,
    resizable: true,
  }));
  const headerRowHeight = 35; // adjust this value if you change the header row height
  const rowHeight = 40; // adjust this value if you change the row height
  const gridHeight = useMemo(() => {
    return headerRowHeight + rowHeight * data.length;
  }, [data.length]);

  return (
    <div className="m-[1rem]">
      {code && <code className="text-sm">{code}</code>}
      <div className="w-full h-max-[300px]" >
        <DataGrid columns={gridColumns} rows={data} style={{ height: gridHeight, maxHeight: '300px' }}/>
      </div>
    </div>
  );
};

export default TablePreview;