import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function CopyableIdCell({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className='flex items-center gap-2'>
      <span className='truncate max-w-[100px]' title={value}>
        {value}
      </span>
      <Button
        variant='ghost'
        size='icon'
        className='h-6 w-6'
        onClick={handleCopy}
      >
        {copied ? (
          <Check className='h-4 w-4 text-green-500' />
        ) : (
          <Copy className='h-4 w-4' />
        )}
      </Button>
    </div>
  );
}
