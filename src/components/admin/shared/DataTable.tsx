import React, { useState } from 'react';
import { Pencil, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  header: React.ReactNode;
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
  pageSize?: number;
}

export function DataTable<T>({ 
  data, 
  columns, 
  actions, 
  keyExtractor, 
  emptyMessage = "No records found.",
  pageSize
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = pageSize ? Math.max(1, Math.ceil(data.length / pageSize)) : 1;
  const safePage = Math.min(currentPage, totalPages);
  const pagedData = pageSize
    ? data.slice((safePage - 1) * pageSize, safePage * pageSize)
    : data;

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
               pagedData.map((row) => (
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
      {pageSize && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-5 border-t border-gray-100">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="p-2 border border-gray-200 hover:border-black transition-colors text-gray-400 hover:text-black disabled:opacity-20"
          >
            <ChevronLeft size={16} />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-9 h-9 flex items-center justify-center text-xs font-bold transition-all ${
                safePage === i + 1
                  ? 'bg-luxury-red text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-black'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="p-2 border border-gray-200 hover:border-black transition-colors text-gray-400 hover:text-black disabled:opacity-20"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
