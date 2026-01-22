import { useStats, useLogs, useMaterials } from "@/hooks/use-inventory";
import { Card, CardHeader, StatMetric, Button } from "@/components/UI";
import { Package, PackagePlus, PackageMinus, Clock, Download } from "lucide-react";
import { format } from "date-fns";
import * as XLSX from 'xlsx';

export default function Dashboard() {
  const { data: stats } = useStats();
  const { data: logs } = useLogs();
  const { data: materials } = useMaterials();

  const exportToExcel = () => {
    if (!materials) return;
    
    const worksheet = XLSX.utils.json_to_sheet(materials.map(m => ({
      Code: m.code,
      'Total Quantity': m.quantity,
      Rack: m.rack,
      Bin: m.bin,
      'Last Updated': m.lastUpdated ? format(new Date(m.lastUpdated), 'yyyy-MM-dd HH:mm:ss') : 'N/A'
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, `inventory_report_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <h2 className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-widest text-foreground">
          System Overview
        </h2>
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <Button onClick={exportToExcel} variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
            <Download className="w-4 h-4" /> Export Excel
          </Button>
          <span className="text-[10px] sm:text-xs font-mono text-primary animate-pulse whitespace-nowrap">● LIVE UPDATE</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatMetric 
          label="Total Materials" 
          value={stats?.totalMaterials || 0} 
          icon={Package}
          trend="In Stock"
        />
        <StatMetric 
          label="Entered Today" 
          value={stats?.enteredToday || 0} 
          icon={PackagePlus}
          trend="+ Today"
        />
        <StatMetric 
          label="Issued Today" 
          value={stats?.issuedToday || 0} 
          icon={PackageMinus}
          trend="- Today"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Table */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader title="Inventory Status" />
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-xs font-mono uppercase text-muted-foreground">
                    <th className="p-4">Material Code</th>
                    <th className="p-4">Entered Qty</th>
                    <th className="p-4">Issued Qty</th>
                    <th className="p-4">Balance Qty</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Issued By</th>
                    <th className="p-4">Last Updated (IST)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {materials?.map((m) => {
                    const lastIssueLog = stats?.recentLogs.find(l => l.materialCode === m.code && l.action === 'issue');
                    const materialLogs = stats?.recentLogs.filter(l => l.materialCode === m.code) || [];
                    const totalEntered = materialLogs.filter(l => l.action === 'entry').reduce((sum, l) => sum + l.quantity, 0);
                    const totalIssued = materialLogs.filter(l => l.action === 'issue').reduce((sum, l) => sum + l.quantity, 0);
                    
                    return (
                      <tr key={m.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="p-4 font-bold font-display">{m.code}</td>
                        <td className="p-4 font-mono text-primary font-bold">{totalEntered || '-'}</td>
                        <td className="p-4 font-mono text-accent font-bold">{totalIssued || '-'}</td>
                        <td className="p-4 font-mono text-foreground font-bold">{m.quantity}</td>
                        <td className="p-4 font-mono">{m.rack}-{m.bin}</td>
                        <td className="p-4 font-mono text-xs">{lastIssueLog?.issuedBy || '-'}</td>
                        <td className="p-4 text-xs font-mono text-muted-foreground">
                          {m.lastUpdated ? format(new Date(m.lastUpdated), 'dd/MM/yyyy HH:mm') : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                  {(!materials || materials.length === 0) && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">No inventory data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Recent Logs Feed */}
        <Card className="h-full flex flex-col">
          <CardHeader title="Recent Logs" />
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {stats?.recentLogs.map((log) => (
              <div key={log.id} className="flex gap-3 items-start border-b border-border pb-3 last:border-0">
                <div className={`mt-1 p-1.5 rounded-full ${log.action === 'entry' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}`}>
                  {log.action === 'entry' ? <PackagePlus className="w-4 h-4" /> : <PackageMinus className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold font-display text-lg">{log.materialCode}</span>
                    <span className={`font-mono font-bold ${log.action === 'entry' ? 'text-primary' : 'text-accent'}`}>
                      {log.action === 'entry' ? '+' : '-'}{log.quantity}
                    </span>
                  </div>
                  {log.issuedBy && (
                    <div className="text-[10px] font-mono text-accent uppercase mt-0.5">
                      Issued By: {log.issuedBy}
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-mono text-muted-foreground mt-1">
                     <span className="flex items-center gap-1">
                       Loc: {log.rack}-{log.bin}
                     </span>
                     <span className="flex items-center gap-1">
                       <Clock className="w-3 h-3" />
                       {format(new Date(log.timestamp!), 'HH:mm')}
                     </span>
                  </div>
                </div>
              </div>
            ))}
            {(!stats?.recentLogs || stats.recentLogs.length === 0) && (
              <div className="text-center text-muted-foreground py-8">No recent activity</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
