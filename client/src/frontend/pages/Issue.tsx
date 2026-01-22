import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@shared/routes";
import { useMaterialAction, useMaterial } from "../hooks/use-inventory";
import { Card, CardHeader, Input, Button } from "../components/UI";
import { Loader2, PackageMinus, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

const formSchema = api.actions.issue.input.extend({
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Issue() {
  const { issue } = useMaterialAction();
  const [scannedCode, setScannedCode] = useState("");
  
  // Fetch material info when user enters code to show current stock
  const { data: material } = useMaterial(scannedCode);
  
  const [, setLocation] = useLocation();
  
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      materialCode: "",
      quantity: undefined,
      rack: "",
      bin: "",
      issuedBy: "",
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const rack = params.get("rack");
    const bin = params.get("bin");

    if (code) {
      setValue("materialCode", code);
      setScannedCode(code);
    }
    if (rack) setValue("rack", rack);
    if (bin) setValue("bin", bin);
  }, [setValue]);

  // Watch code input to trigger lookups
  const watchedCode = watch("materialCode");
  useEffect(() => {
    if (watchedCode && watchedCode !== scannedCode && watchedCode.length >= 3) {
      setScannedCode(watchedCode);
    }
  }, [watchedCode, scannedCode]);

  const onSubmit = (data: FormValues) => {
    issue.mutate(data, {
      onSuccess: () => reset()
    });
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-0">
      <Card className="border-accent/20">
        <CardHeader 
          title="Material Issue" 
          subtitle="Disburse inventory for production usage." 
        />
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Input
              label="Material Code"
              placeholder="MAT-XXXX"
              {...register("materialCode")}
              error={errors.materialCode?.message}
              className="uppercase"
              autoFocus
            />
            
            {/* Real-time Stock Info */}
            {material && (
              <div className="p-3 bg-secondary/30 border border-primary/20 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                <div className="text-xs font-mono text-muted-foreground uppercase">
                  Available Stock
                </div>
                <div className="text-xl font-display font-bold text-primary">
                  {material.quantity} Units
                </div>
                <div className="text-xs font-mono text-accent">
                  Loc: {material.rack}-{material.bin}
                </div>
              </div>
            )}
            
            {!material && scannedCode.length > 3 && (
              <div className="p-2 text-xs font-mono text-destructive flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" />
                Material not found
              </div>
            )}
          </div>

          <Input
            label="Quantity to Issue"
            type="number"
            placeholder="0"
            {...register("quantity")}
            error={errors.quantity?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="From Rack"
              placeholder="A1"
              {...register("rack")}
              error={errors.rack?.message}
              className="uppercase"
            />
            <Input
              label="From Bin"
              placeholder="01"
              {...register("bin")}
              error={errors.bin?.message}
            />
          </div>

          <Input
            label="Issued By (Person Name)"
            placeholder="Enter Name..."
            {...register("issuedBy")}
            error={errors.issuedBy?.message}
          />

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={issue.isPending}
            >
              {issue.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <PackageMinus className="w-5 h-5 mr-2" />
                  Authorize Issue
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
