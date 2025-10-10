import { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, Download, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

interface ImportProductsDialogProps {
  onSuccess?: () => void;
}

export function ImportProductsDialog({ onSuccess }: ImportProductsDialogProps) {
  const [open, setOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Formato inválido',
          description: 'Por favor, selecione um arquivo .xlsx, .xls ou .csv',
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simular upload com progresso
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simular processamento
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setIsUploading(false);
      
      toast({
        title: 'Importação concluída!',
        description: 'Os produtos foram importados com sucesso.',
      });
      
      setSelectedFile(null);
      setUploadProgress(0);
      setOpen(false);
      onSuccess?.();
    }, 2500);
  };

  const handleDownloadTemplate = () => {
    toast({
      title: 'Download iniciado',
      description: 'O modelo de planilha está sendo baixado.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Importar Produtos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Produtos em Lote</DialogTitle>
          <DialogDescription>
            Importe múltiplos produtos de uma vez usando nossa planilha modelo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Baixe nosso modelo de planilha para garantir que seus dados sejam importados corretamente.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Download Modelo */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Download className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">1. Baixar Modelo</CardTitle>
                    <CardDescription className="text-xs">
                      Planilha com campos pré-configurados
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleDownloadTemplate}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Baixar Template.xlsx
                </Button>
              </CardContent>
            </Card>

            {/* Upload Planilha */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Upload className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">2. Fazer Upload</CardTitle>
                    <CardDescription className="text-xs">
                      Planilha preenchida com produtos
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                />
                <label htmlFor="file-upload">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium truncate max-w-[150px]">
                          {selectedFile.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedFile(null);
                          }}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm font-medium mb-1">Selecionar arquivo</p>
                        <p className="text-xs text-muted-foreground">
                          .xlsx, .xls, .csv
                        </p>
                      </>
                    )}
                  </div>
                </label>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Processando importação...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Campos Obrigatórios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Campos Obrigatórios na Planilha</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { field: 'Código', example: 'FOP-001', required: true },
                  { field: 'Nome', example: 'Filtro de Óleo Premium', required: true },
                  { field: 'Categoria', example: 'Filtros', required: true },
                  { field: 'Marca', example: 'Bosch', required: true },
                  { field: 'Preço', example: '45.90', required: true },
                  { field: 'Estoque', example: '120', required: true },
                  { field: 'Descrição', example: 'Descrição do produto', required: false },
                  { field: 'Compatibilidade', example: 'Gol, Palio, Uno', required: false },
                ].map((item) => (
                  <div 
                    key={item.field} 
                    className="p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{item.field}</p>
                      {item.required && (
                        <span className="text-xs text-destructive">*</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Ex: {item.example}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex-1 bg-gradient-primary"
            >
              {isUploading ? 'Importando...' : 'Importar Produtos'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
