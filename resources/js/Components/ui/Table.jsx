import React from 'react';

const Table = ({ columns, data }) => {
    return (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                        {columns.map((col, idx) => (
                            <th key={idx} className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-gray-50/50 transition-colors">
                            {columns.map((col, colIdx) => (
                                <td key={colIdx} className="px-6 py-4 text-sm text-gray-700">
                                    {col.cell ? col.cell(row) : row[col.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
