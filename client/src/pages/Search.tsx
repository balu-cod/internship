import { useState } from "react";
import { useMaterials } from "@/hooks/use-inventory";
import { Card, CardHeader, Input, Button } from "@/components/UI";
import { Search as SearchIcon, Loader2, Package, Clock, MapPin, Tag } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: materials, isLoading, isError } = useMaterials(searchTerm);

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full px-4 sm:px-0">
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
        
        {/* Quick Filters / Contextual Tags */}
        <div className="px-6 pb-6 flex flex-wrap gap-2">
          <span className="text-xs font-mono text-muted-foreground uppercase py-1 px-2 border border-border rounded flex items-center gap-1">
            <Tag className="w-3 h-3" /> Code
          </span>
          <span className="text-xs font-mono text-muted-foreground uppercase py-1 px-2 border border-border rounded flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Location
          </span>
          <span className="text-xs font-mono text-muted-foreground uppercase py-1 px-2 border border-border rounded flex items-center gap-1">
            <Clock className="w-3 h-3" /> Timeline
          </span>
        </div>
      </Card>

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
                className="group p-4 bg-card border border-border hover:border-primary/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
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
                    <span className="block text-[10px] font-mono uppercase text-muted-foreground leading-none mb-1">Location</span>
                    <span className="block font-display font-bold text-lg flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      {item.rack}-{item.bin}
                    </span>
                  </div>
                  <div className="flex-1 sm:flex-none text-right sm:text-left">
                    <span className="block text-[10px] font-mono uppercase text-muted-foreground leading-none mb-1">Total Qty</span>
                    <span className="block font-display font-bold text-2xl text-primary leading-none">{item.quantity}</span>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <Link href={`/issue?code=${item.code}&rack=${item.rack}&bin=${item.bin}`} className="flex-1 sm:flex-none">
                       <Button size="sm" variant="outline" className="w-full h-10 sm:h-9">Issue</Button>
                    </Link>
                    <Link href={`/entry?code=${item.code}&rack=${item.rack}&bin=${item.bin}`} className="flex-1 sm:flex-none">
                       <Button size="sm" variant="ghost" className="w-full h-10 sm:h-9 text-xs">Add More</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}