
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { parseExcelFile } from '@/utils/dataProcessor';
import { useDashboard } from '@/context/DashboardContext';
import { UploadIcon, RefreshCwIcon } from 'lucide-react';

const FileUpload = () => {
  const { loadExcelData, isLoading } = useDashboard();
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Check if the file is an Excel file
    const isExcel = file.name.endsWith('.xlsx') || 
                    file.name.endsWith('.xls') || 
                    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                    file.type === 'application/vnd.ms-excel';
    
    if (!isExcel) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    
    try {
      setFileName(file.name);
      // Parse Excel file
      const data = await parseExcelFile(file);
      
      // Check if there's data
      if (!data || data.length === 0) {
        toast.error('No data found in the Excel file');
        return;
      }
      
      // Load data into context
      loadExcelData(data);
      toast.success('Successfully loaded data from Excel file');
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      toast.error('Error parsing Excel file. Please check the file format.');
    }
  };

  const handleRefresh = () => {
    if (fileInputRef.current?.files?.[0]) {
      handleFileChange({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
      toast.info('Reloading data from Excel file');
    } else {
      toast.info('No file loaded. Please upload an Excel file first.');
    }
  };

  return (
    <Card className="p-4 flex flex-col gap-4 dashboard-card">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">Data Source</h3>
        {fileName && (
          <p className="text-sm text-muted-foreground">
            Current file: <span className="font-medium">{fileName}</span>
          </p>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={() => fileInputRef.current?.click()} 
          className="flex-1"
          disabled={isLoading}
        >
          <UploadIcon className="w-4 h-4 mr-2" />
          Upload Excel File
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={!fileName || isLoading}
          title="Refresh data from current file"
        >
          <RefreshCwIcon className="w-4 h-4" />
        </Button>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".xlsx,.xls"
      />
    </Card>
  );
};

export default FileUpload;
