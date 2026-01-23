import { QRCodeSVG } from 'qrcode.react';
import { Card } from './UI';

interface Material {
  id: number;
  code: string;
  quantity: number;
  rack: string;
  bin: string;
  lastUpdated: Date | null | string;
}

interface RackQRCodeProps {
  rack: string;
  bin: string;
  materials: Material[];
}

export function RackQRCode({ rack, bin, materials }: RackQRCodeProps) {
  // Generate a URL that points to the search page with this specific rack and bin
  const qrValue = `${window.location.origin}/search?rack=${rack}&bin=${bin}`;

  const totalQuantity = materials.reduce((sum, m) => sum + m.quantity, 0);
  const distinctMaterials = new Set(materials.map(m => m.code)).size;

  return (
    <Card className="w-full max-w-[280px] flex flex-col items-center p-4 border-primary/20 bg-secondary/30">
      <div className="mb-4 w-full text-center">
        <h3 className="text-2xl font-display font-bold uppercase tracking-wider text-primary">Location {rack}-{bin}</h3>
        <p className="text-[10px] font-mono text-muted-foreground mt-1 uppercase">Specific Section Identifier</p>
      </div>
      
      <div className="p-3 bg-white rounded-lg shadow-inner mb-4">
        <QRCodeSVG 
          value={qrValue}
          size={180}
          level="H"
          includeMargin={false}
        />
      </div>

      <div className="w-full space-y-2 border-t border-border/50 pt-4 font-mono text-[10px] uppercase text-muted-foreground">
        <div className="flex justify-between">
          <span>Rack/Bin:</span>
          <span className="text-foreground font-bold">{rack}-{bin}</span>
        </div>
        <div className="flex justify-between">
          <span>Asset Types:</span>
          <span className="text-foreground font-bold">{distinctMaterials}</span>
        </div>
        <div className="flex justify-between border-t border-border/20 pt-1">
          <span>Total Volume:</span>
          <span className="text-primary font-bold">{totalQuantity} Units</span>
        </div>
      </div>

      <div className="mt-4 text-[9px] font-mono uppercase text-muted-foreground flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        Scan for Entry / Issue / Search
      </div>
    </Card>
  );
}
