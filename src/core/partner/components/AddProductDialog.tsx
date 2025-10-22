import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, Upload, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const productSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  code: z.string().min(1, 'Código é obrigatório'),
  brand: z.string().min(1, 'Marca é obrigatória'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  description: z.string().optional(),
  price: z.string().min(1, 'Preço é obrigatório'),
  stock: z.string().min(1, 'Quantidade é obrigatória'),
  status: z.enum(['active', 'inactive', 'pending']),
  technical_specs: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface VehicleCompatibility {
  brand: string;
  model: string;
  year: string;
}

export function AddProductDialog({ onSuccess, children }: { onSuccess: () => void; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [compatibility, setCompatibility] = useState<VehicleCompatibility[]>([]);
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: 'pending',
      technical_specs: '',
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addVehicleCompatibility = () => {
    if (vehicleBrand && vehicleModel && vehicleYear) {
      setCompatibility((prev) => [
        ...prev,
        { brand: vehicleBrand, model: vehicleModel, year: vehicleYear },
      ]);
      setVehicleBrand('');
      setVehicleModel('');
      setVehicleYear('');
    }
  };

  const removeVehicle = (index: number) => {
    setCompatibility((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (partnerId: string): Promise<string[]> => {
    const urls: string[] = [];
    
    for (const image of images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${partnerId}/${Date.now()}-${Math.random()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('product-images')
        .upload(fileName, image);

      if (error) throw error;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      urls.push(data.publicUrl);
    }

    return urls;
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await uploadImages(user.id);
      }

      const technicalSpecs = data.technical_specs 
        ? JSON.parse(data.technical_specs)
        : {};

      const { error } = await supabase.from('products').insert([{
        partner_id: user.id,
        name: data.name,
        code: data.code,
        brand: data.brand,
        category: data.category,
        description: data.description || '',
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        status: data.status,
        images: imageUrls,
        compatibility: compatibility as any,
        technical_specs: technicalSpecs as any,
      }]);

      if (error) throw error;

      toast({
        title: 'Produto cadastrado!',
        description: 'O produto foi adicionado ao seu catálogo.',
      });

      setOpen(false);
      form.reset();
      setImages([]);
      setCompatibility([]);
      onSuccess();
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: 'Erro ao cadastrar produto',
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-gradient-primary hover:bg-primary-hover">
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Cadastrar Novo Produto</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Images Upload */}
            <div className="space-y-2">
              <FormLabel>Imagens do Produto</FormLabel>
              <div className="border-2 border-dashed rounded-lg p-4 border-border">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center cursor-pointer py-6"
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Clique para selecionar imagens
                  </span>
                </label>
                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {images.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Filtro de Óleo Premium" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: FOP-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Bosch" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Filtros" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="45.90" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="120" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva as características do produto..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="technical_specs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especificações Técnicas (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='{"peso": "1kg", "dimensoes": "10x10x5cm"}'
                      className="min-h-[80px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Vehicle Compatibility */}
            <div className="space-y-4">
              <FormLabel>Compatibilidade com Veículos</FormLabel>
              <div className="grid grid-cols-4 gap-2">
                <Input
                  placeholder="Marca"
                  value={vehicleBrand}
                  onChange={(e) => setVehicleBrand(e.target.value)}
                />
                <Input
                  placeholder="Modelo"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                />
                <Input
                  placeholder="Ano"
                  value={vehicleYear}
                  onChange={(e) => setVehicleYear(e.target.value)}
                />
                <Button type="button" onClick={addVehicleCompatibility} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {compatibility.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {compatibility.map((vehicle, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {vehicle.brand} {vehicle.model} ({vehicle.year})
                      <button
                        type="button"
                        onClick={() => removeVehicle(index)}
                        className="ml-2"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={uploading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? 'Cadastrando...' : 'Cadastrar Produto'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
