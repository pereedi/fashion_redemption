import React from 'react';
import { Pencil, Trash2, Eye } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface Action<T> {
  icon: 'edit' | 'delete' | 'view';
  onClick: (row: T) => void;
  color?: string;
  title?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
}

export function DataTable<T>({ 
  data, 
  columns, 
  actions, 
  keyExtractor, 
  emptyMessage = "No records found." 
}: DataTableProps<T>) {

  const renderActionIcon = (action: Action<T>, row: T) => {
    const baseClasses = "p-1.5 rounded-md transition-colors";
    
    switch (action.icon) {
      case 'edit':
        return (
          <button 
            key="edit"
            onClick={() => action.onClick(row)} 
            className={`${baseClasses} text-blue-600 hover:bg-blue-50`}
            title={action.title || 'Edit'}
          >
            <Pencil size={16} />
          </button>
        );
      case 'delete':
        return (
          <button 
            key="delete"
            onClick={() => action.onClick(row)} 
            className={`${baseClasses} text-luxury-red hover:bg-red-50`}
            title={action.title || 'Delete'}
          >
            <Trash2 size={16} />
          </button>
        );
      case 'view':
        return (
          <button 
            key="view"
            onClick={() => action.onClick(row)} 
            className={`${baseClasses} text-gray-600 hover:bg-gray-100`}
            title={action.title || 'View Details'}
          >
            <Eye size={16} />
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {columns.map((col, index) => (
                <th 
                  key={index} 
                  className={`py-4 px-6 text-[10px] items-center font-bold tracking-widest text-gray-400 uppercase ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="py-4 px-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (actions ? 1 : 0)} 
                  className="py-12 text-center text-sm text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={keyExtractor(row)} className="hover:bg-gray-50/80 transition-colors group">
                  {columns.map((col, colIndex) => (
                    <td 
                      key={colIndex} 
                      className={`py-4 px-6 text-sm text-gray-800 ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      }`}
                    >
                      {col.cell ? col.cell(row) : (col.accessorKey ? String(row[col.accessorKey]) : '')}
                    </td>
                  ))}
                  
                  {actions && actions.length > 0 && (
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {actions.map((action) => renderActionIcon(action, row))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
