import React from "react";

interface StatsSectionProps {
  orderCount: number;
  wishlistCount: number;
}

const StatsSection: React.FC<StatsSectionProps> = ({ orderCount, wishlistCount }) => (
  <div className="p-4 border-b border-slate-600 flex justify-between">
    <div>
      <div className="font-bold">{orderCount}</div>
      <div className="text-xs text-slate-300">Orders</div>
    </div>
    <div>
      <div className="font-bold">{wishlistCount}</div>
      <div className="text-xs text-slate-300">Wishlist</div>
    </div>
  </div>
);

export default StatsSection;