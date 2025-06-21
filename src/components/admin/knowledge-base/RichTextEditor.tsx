
import { useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Image, Bold, Italic, Link, List, ListOrdered } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  contentType: 'text' | 'html';
  onContentTypeChange: (type: 'text' | 'html') => void;
  placeholder?: string;
}

export const RichTextEditor = ({ 
  value, 
  onChange, 
  contentType, 
  onContentTypeChange,
  placeholder = "Enter your content here..." 
}: RichTextEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertAtCursor = useCallback((text: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = value || '';
    
    const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
    onChange(newValue);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  }, [value, onChange]);

  const wrapSelection = useCallback((prefix: string, suffix: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = value || '';
    const selectedText = currentValue.substring(start, end);
    
    const wrappedText = prefix + selectedText + suffix;
    const newValue = currentValue.substring(0, start) + wrappedText + currentValue.substring(end);
    onChange(newValue);
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length);
      }
    }, 0);
  }, [value, onChange]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('knowledge_base_content_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('knowledge_base_content_images')
        .getPublicUrl(filePath);

      if (contentType === 'html') {
        insertAtCursor(`<img src="${publicUrl}" alt="${file.name}" class="max-w-full h-auto rounded-lg my-4" />`);
      } else {
        insertAtCursor(`![${file.name}](${publicUrl})`);
      }
      
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error("Image upload failed: " + error.message);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toolbarButtons = [
    {
      icon: Bold,
      label: 'Bold',
      action: () => contentType === 'html' 
        ? wrapSelection('<strong>', '</strong>')
        : wrapSelection('**', '**')
    },
    {
      icon: Italic,
      label: 'Italic', 
      action: () => contentType === 'html'
        ? wrapSelection('<em>', '</em>')
        : wrapSelection('*', '*')
    },
    {
      icon: Link,
      label: 'Link',
      action: () => {
        const url = prompt('Enter URL:');
        if (url) {
          if (contentType === 'html') {
            wrapSelection(`<a href="${url}" target="_blank" rel="noopener noreferrer">`, '</a>');
          } else {
            wrapSelection('[', `](${url})`);
          }
        }
      }
    },
    {
      icon: List,
      label: 'Bullet List',
      action: () => contentType === 'html'
        ? insertAtCursor('<ul>\n  <li></li>\n</ul>')
        : insertAtCursor('- ')
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => contentType === 'html'
        ? insertAtCursor('<ol>\n  <li></li>\n</ol>')
        : insertAtCursor('1. ')
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="content">Content</Label>
        <div className="flex items-center gap-2">
          <Label htmlFor="content-type" className="text-sm">Format:</Label>
          <select
            id="content-type"
            value={contentType}
            onChange={(e) => onContentTypeChange(e.target.value as 'text' | 'html')}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="text">Plain Text/Markdown</option>
            <option value="html">HTML</option>
          </select>
        </div>
      </div>
      
      <div className="border rounded-lg">
        <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
          {toolbarButtons.map((button, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={button.action}
              title={button.label}
              type="button"
            >
              <button.icon className="h-4 w-4" />
            </Button>
          ))}
          <div className="ml-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="content-image-upload"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              title="Upload Image"
              type="button"
            >
              <Image className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Textarea
          ref={textareaRef}
          id="content"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={20}
          className="border-0 resize-none focus-visible:ring-0"
        />
      </div>
      
      {contentType === 'html' && (
        <div className="text-sm text-muted-foreground">
          <p>HTML mode: You can use HTML tags for rich formatting. Common tags include:</p>
          <code className="text-xs bg-muted px-1 rounded">
            &lt;h1&gt; &lt;h2&gt; &lt;p&gt; &lt;strong&gt; &lt;em&gt; &lt;ul&gt; &lt;ol&gt; &lt;li&gt; &lt;a&gt; &lt;img&gt;
          </code>
        </div>
      )}
    </div>
  );
};
