import React from 'react';
import { Package } from 'lucide-react';

interface OrderHistoryProps {
  orders: any[];
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders }) => {
  if (orders.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-black/10 rounded-sm">
        <p className="text-[10px] font-bold tracking-widest text-black/30 uppercase">NO ORDERS PLACED YET</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id} className="border border-black/5 p-6 rounded-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Package size={16} className="text-luxury-red" />
              <span className="text-[10px] font-bold tracking-widest uppercase">ORDER #{String(order.id).padStart(6, '0')}</span>
            </div>
            <span className="text-[9px] font-bold tracking-[0.2em] text-black/40 uppercase">
              {new Date(order.created_at || order.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between items-end border-t border-black/5 pt-4">
            <div className="text-[10px] tracking-widest uppercase text-black/40">
              {order.items?.length || 0} {order.items?.length === 1 ? 'ITEM' : 'ITEMS'}
            </div>
            <div className="text-sm font-bold text-luxury-red">
               Esp {Number(order.total).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderHistory;
