import { useState } from "react";
import { useMaterials, useMaterialAction, useLogs } from "../hooks/use-inventory";
import { Card, CardHeader, Input, Button } from "../components/UI";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Search as SearchIcon, Loader2, Package, Clock, MapPin, History } from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { useAuth } from "../hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

export default function Search() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { deleteMaterial } = useMaterialAction();
  const params = new URLSearchParams(location.split('?')[1]);
  const initialSearch = params.get('q') || "";
  const rackParam = params.get('rack');
  const binParam = params.get('bin');
  const isSpecificLocation = rackParam && binParam;
  
  const [searchTerm, setSearchTerm] = useState(() => {
    if (isSpecificLocation) return `rack:${rackParam}-bin:${binParam}`;
    return initialSearch;
  });
  const { data: materials, isLoading, isError } = useMaterials(searchTerm);
  const { data: allLogs } = useLogs();

  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: [`/api/materials/${selectedMaterial}/transactions`],
    queryFn: async () => {
      const res = await fetch(`/api/materials/${selectedMaterial}/transactions`);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
    enabled: !!selectedMaterial,
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full px-4 sm:px-0">
      {!isSpecificLocation && (
        <Card>
          <CardHeader 
            title="Advanced Material Search" 
            subtitle="Identify by Location, Code, or Timeline (Recent/Issued)." 
          />
          <div className="flex flex-col sm:flex-row gap-4 p-6 pt-0">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search by Code, Rack (e.g. A1), or Status..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 uppercase text-lg h-12"
                autoFocus
              />
            </div>
            <Button className="w-full sm:w-24 shrink-0 h-12">
              Search
            </Button>
          </div>
        </Card>
      )}

      {isSpecificLocation && (
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-primary uppercase">Location {rackParam?.toUpperCase()}-{binParam?.toUpperCase()} Details</h2>
          <p className="text-muted-foreground font-mono text-xs sm:text-sm mt-1 uppercase">Showing inventory in Section {rackParam?.toUpperCase()}-{binParam?.toUpperCase()}</p>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-destructive border border-destructive/20 bg-destructive/10">
            Failed to load inventory data.
          </div>
        ) : materials?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border border-border bg-card">
            No materials found matching "{searchTerm}"
          </div>
        ) : (
          <div className="grid gap-4">
            {materials?.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedMaterial(item.code)}
                className="group p-4 bg-card border border-border hover:border-primary/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-secondary rounded-sm shrink-0">
                    <Package className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xl font-display font-bold text-foreground truncate">{item.code}</h4>
                    <p className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span className="truncate">Updated: {item.lastUpdated ? format(new Date(item.lastUpdated), 'dd/MM/yyyy HH:mm') : 'N/A'}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 sm:gap-8 justify-between sm:justify-end">
                  <div className="flex-1 sm:flex-none">
                    <span className="block font-display font-bold text-lg flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      {item.rack.toUpperCase()}-{item.bin.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 sm:flex-none text-right sm:text-left">
                    <span className="block font-display font-bold text-2xl text-primary leading-none">{item.quantity}</span>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0" onClick={e => e.stopPropagation()}>
                    <Link href={`/issue?code=${item.code}&rack=${item.rack}&bin=${item.bin}`} className="flex-1 sm:flex-none">
                       <Button size="sm" variant="outline" className="w-full h-10 sm:h-9">Issue</Button>
                    </Link>
                    <Link href={`/entry?code=${item.code}&rack=${item.rack}&bin=${item.bin}`} className="flex-1 sm:flex-none">
                       <Button size="sm" variant="outline" className="w-full h-10 sm:h-9 text-xs">Add More</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedMaterial} onOpenChange={() => setSelectedMaterial(null)}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden bg-card border-primary/20 p-0 flex flex-col sm:w-full" aria-describedby={undefined}>
          <div className="p-4 sm:p-6 flex flex-col h-full overflow-hidden">
            <DialogHeader className="relative mb-2 sm:mb-4 flex-shrink-0">
              <DialogTitle className="text-xl sm:text-2xl font-display font-bold text-primary flex items-center gap-2 pr-8">
                <History className="w-5 h-5 sm:w-6 sm:h-6" />
                BIN CARD: {selectedMaterial}
              </DialogTitle>
            </DialogHeader>

            {selectedMaterial && (
              <div className="flex flex-col flex-grow overflow-hidden space-y-3 sm:space-y-4">
                <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm font-mono uppercase flex-shrink-0">
                  <div className="flex-1 p-2 bg-secondary/30 border border-border rounded-sm">
                    <span className="text-muted-foreground block text-[9px] sm:text-[10px]">Location</span>
                    <span className="text-foreground font-bold sm:text-base">
                      {materials?.find(m => m.code === selectedMaterial)?.rack.toUpperCase()}-
                      {materials?.find(m => m.code === selectedMaterial)?.bin.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 p-2 bg-secondary/30 border border-border rounded-sm">
                    <span className="text-muted-foreground block text-[9px] sm:text-[10px]">Balance</span>
                    <span className="text-primary font-bold sm:text-base">
                      {materials?.find(m => m.code === selectedMaterial)?.quantity} Units
                    </span>
                  </div>
                </div>

                <div className="border border-border rounded-sm bg-card overflow-hidden flex flex-col flex-grow min-h-0">
                  <div className="overflow-x-auto overflow-y-auto w-full touch-pan-x">
                    <table className="w-full text-left border-collapse font-mono text-[10px] sm:text-xs uppercase min-w-[550px] sm:min-w-[600px]">
                      <thead className="bg-secondary/50 border-b border-border sticky top-0 z-10">
                        <tr className="text-muted-foreground">
                          <th className="p-2 sm:p-3 font-bold">Date & Time</th>
                          <th className="p-2 sm:p-3 font-bold text-right">Received</th>
                          <th className="p-2 sm:p-3 font-bold text-right">Issued</th>
                          <th className="p-2 sm:p-3 font-bold text-right">Balance</th>
                          <th className="p-2 sm:p-3 font-bold">Action By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {isLoadingTransactions ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center">
                              <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                            </td>
                          </tr>
                        ) : transactions?.map((tx: any) => (
                          <tr key={tx.id} className="hover:bg-primary/5 transition-colors">
                            <td className="p-2 sm:p-3 text-muted-foreground whitespace-nowrap">
                              {tx.createdAt ? format(new Date(tx.createdAt), 'dd/MM/yyyy HH:mm') : 'N/A'}
                            </td>
                            <td className="p-2 sm:p-3 text-right text-primary font-bold">
                              {tx.receivedQty > 0 ? `+${tx.receivedQty}` : '-'}
                            </td>
                            <td className="p-2 sm:p-3 text-right text-destructive font-bold">
                              {tx.issuedQty > 0 ? `-${tx.issuedQty}` : '-'}
                            </td>
                            <td className="p-2 sm:p-3 text-right font-bold bg-primary/5">
                              {tx.balanceQty}
                            </td>
                            <td className="p-2 sm:p-3 truncate max-w-[100px] sm:max-w-[120px]">
                              {tx.personName}
                            </td>
                          </tr>
                        ))}
                        {(!transactions || transactions.length === 0) && !isLoadingTransactions && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-muted-foreground italic">
                              No transactions recorded for this material.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
