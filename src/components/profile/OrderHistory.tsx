import React, { useState } from 'react';
import { Package, ChevronDown, ChevronUp, MapPin, CreditCard } from 'lucide-react';

interface OrderHistoryProps {
  orders: any[];
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (orders.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-black/10 rounded-sm">
        <p className="text-[10px] font-bold tracking-widest text-black/30 uppercase">NO ORDERS PLACED YET</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const isExpanded = expandedId === order.id;
        const status = order.status?.toUpperCase() || 'PENDING';

        return (
          <div key={order.id} className="border border-black/5 rounded-sm overflow-hidden">
            {/* Header / Summary */}
            <div 
              onClick={() => setExpandedId(isExpanded ? null : order.id)}
              className="p-6 cursor-pointer hover:bg-black/[0.02] transition-colors"
            >
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${status === 'PAID' ? 'bg-green-50 text-green-600' : 'bg-luxury-red/10 text-luxury-red'}`}>
                    <Package size={18} />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold tracking-widest uppercase">ORDER #{String(order.id).padStart(6, '0')}</span>
                    <span className="text-[9px] font-bold tracking-[0.2em] text-black/30 uppercase">
                      {new Date(order.created_at || order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-8 ml-auto">
                  <div className="text-right hidden sm:block">
                    <span className={`block text-[8px] font-black tracking-widest uppercase mb-1 ${status === 'PAID' ? 'text-green-600' : 'text-luxury-red'}`}>
                      {status}
                    </span>
                    <span className="text-sm font-bold">Esp {Number(order.total).toLocaleString()}</span>
                  </div>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
            </div>

            {/* Detailed Content */}
            {isExpanded && (
              <div className="px-6 pb-8 border-t border-black/5 pt-8 space-y-10 animate-fade-in">
                {/* Items List */}
                <div className="space-y-6">
                  <h3 className="text-[9px] font-black tracking-widest uppercase text-black/40">Purchased Items</h3>
                  <div className="divide-y divide-black/5">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="py-4 flex gap-6 items-center">
                        <div className="w-16 h-20 bg-gray-100 flex-shrink-0">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-xs font-bold uppercase tracking-tight">{item.name}</h4>
                          <p className="text-[10px] text-black/40 uppercase tracking-widest mt-1">
                            Size: {item.size} | Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-xs font-bold">
                          Esp {Number(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6 border-t border-black/5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase text-black/40">
                      <MapPin size={12} /> Shipping Address
                    </div>
                    <p className="text-xs text-black/60 leading-relaxed font-serif">
                      {order.customer_name}<br />
                      {order.customer_address}<br />
                      {order.customer_city}, {order.customer_postal_code}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase text-black/40">
                      <CreditCard size={12} /> Payment & Shipping
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-tight font-bold">Method: {order.payment_method}</p>
                      <p className="text-xs uppercase tracking-tight text-black/40 font-bold">Delivery: {order.shipping_method}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderHistory;
