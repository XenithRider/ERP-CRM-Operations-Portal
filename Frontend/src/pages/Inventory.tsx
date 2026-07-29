import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { inventoryService } from "@/services/inventoryService";
import type { InventoryItem } from "@/types";
import { formatCurrency, cx } from "@/lib/format";

export function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    inventoryService.list().then(setItems);
  }, []);

  const columns: Column<InventoryItem>[] = [
    { key: "sku", header: "SKU", render: (i) => <span className="num font-medium text-[var(--color-ink)]">{i.sku}</span>, sortValue: (i) => i.sku },
    { key: "name", header: "Item", render: (i) => (
      <div>
        <p className="text-[var(--color-ink)]">{i.name}</p>
        <p className="text-xs text-[var(--color-ink-faint)]">{i.category}</p>
      </div>
    ), sortValue: (i) => i.name },
    { key: "warehouse", header: "Warehouse", render: (i) => i.warehouse },
    { key: "onHand", header: "On hand", align: "right", render: (i) => {
        const low = i.onHand <= i.reorderPoint && i.reorderPoint > 0;
        return <span className={cx("num", low ? "font-semibold text-[var(--color-clay-600)]" : "text-[var(--color-ink)]")}>{i.onHand}</span>;
      }, sortValue: (i) => i.onHand },
    { key: "reserved", header: "Reserved", align: "right", render: (i) => <span className="num text-[var(--color-ink-muted)]">{i.reserved}</span>, sortValue: (i) => i.reserved },
    { key: "reorderPoint", header: "Reorder at", align: "right", render: (i) => <span className="num text-[var(--color-ink-muted)]">{i.reorderPoint}</span> },
    { key: "unitCost", header: "Unit cost", align: "right", render: (i) => <span className="num">{formatCurrency(i.unitCost)}</span>, sortValue: (i) => i.unitCost },
  ];

  const lowStockCount = items.filter((i) => i.onHand <= i.reorderPoint && i.reorderPoint > 0).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-[var(--font-display)] text-xl font-semibold tracking-tight text-[var(--color-ink)]">Inventory</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          {items.length} SKUs tracked{lowStockCount > 0 && <> · <span className="font-medium text-[var(--color-clay-600)]">{lowStockCount} at or below reorder point</span></>}.
        </p>
      </div>
      <Card>
        <DataTable
          columns={columns}
          rows={items}
          rowKey={(i) => i.id}
          searchFn={(i, q) => i.sku.toLowerCase().includes(q) || i.name.toLowerCase().includes(q)}
          searchPlaceholder="Search SKU or item…"
        />
      </Card>
    </div>
  );
}
