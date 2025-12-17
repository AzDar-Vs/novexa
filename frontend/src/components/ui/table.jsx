import { Table as BsTable } from 'react-bootstrap';

const Table = ({ columns = [], data = [] }) => {
  return (
    <BsTable striped bordered hover responsive>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 && (
          <tr>
            <td colSpan={columns.length} className="text-center">
              No data available
            </td>
          </tr>
        )}
        {data.map((row, idx) => (
          <tr key={idx}>
            {columns.map(col => (
              <td key={col.key}>
                {col.render
                  ? col.render(row)
                  : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </BsTable>
  );
};

export default Table;
