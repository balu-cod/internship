import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@shared/routes";
import { useMaterialAction } from "@/hooks/use-inventory";
import { Card, CardHeader, Input, Button } from "@/components/UI";
import { Loader2, PackagePlus } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

// Client-side schema with coercions for number inputs
const formSchema = api.actions.entry.input.extend({
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Entry() {
  const { entry } = useMaterialAction();
  const [location] = useLocation();
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      materialCode: "",
      quantity: undefined,
      rack: "",
      bin: "",
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const rack = params.get("rack");
    const bin = params.get("bin");

    if (code) setValue("materialCode", code);
    if (rack) setValue("rack", rack);
    if (bin) setValue("bin", bin);
  }, [setValue]);

  const onSubmit = (data: FormValues) => {
    entry.mutate(data, {
      onSuccess: () => reset()
    });
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-0">
      <Card>
        <CardHeader 
          title="Material Entry" 
          subtitle="Log incoming inventory into storage system." 
        />
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          <Input
            label="Material Code"
            placeholder="MAT-XXXX"
            {...register("materialCode")}
            error={errors.materialCode?.message}
            className="uppercase"
            autoFocus
          />

          <Input
            label="Quantity"
            type="number"
            placeholder="0"
            {...register("quantity")}
            error={errors.quantity?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Rack ID"
              placeholder="A1"
              {...register("rack")}
              error={errors.rack?.message}
              className="uppercase"
            />
            <Input
              label="Bin Number"
              placeholder="01"
              {...register("bin")}
              error={errors.bin?.message}
            />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={entry.isPending}
            >
              {entry.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <PackagePlus className="w-5 h-5 mr-2" />
                  Confirm Entry
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
