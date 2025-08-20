import React, { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Fab,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { AutoAwesome, Send } from '@mui/icons-material';
import { EmailFormData, Email } from '../types/email';

interface ComposeFormProps {
  selectedEmail?: Email;
  onSave?: (formData: EmailFormData) => void;
  onAIGenerate?: (prompt: string) => void;
  aiGenerating?: boolean;
  aiError?: string;
}

export default function ComposeForm({ 
  selectedEmail, 
  onSave, 
  onAIGenerate, 
  aiGenerating = false,
  aiError 
}: ComposeFormProps) {
  const [formData, setFormData] = useState<EmailFormData>({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: ''
  });

  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  // Update form when selected email changes
  useEffect(() => {
    if (selectedEmail) {
      setFormData({
        to: selectedEmail.to || '',
        cc: selectedEmail.cc || '',
        bcc: selectedEmail.bcc || '',
        subject: selectedEmail.subject || '',
        body: selectedEmail.body || ''
      });
    }
  }, [selectedEmail]);

  const handleInputChange = (field: keyof EmailFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  const handleAIGenerate = () => {
    if (onAIGenerate && aiPrompt.trim()) {
      onAIGenerate(aiPrompt.trim());
      setShowAIPrompt(false);
      setAiPrompt('');
    }
  };

  const isFormValid = formData.to.trim() && formData.subject.trim();

  // External function to update form fields (for AI streaming)
  React.useImperativeHandle(React.createRef(), () => ({
    updateField: (field: keyof EmailFormData, value: string) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  }));

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="h6">
          {selectedEmail ? 'View Email' : 'Compose Email'}
        </Typography>
      </Box>
      <Divider />
      
      {aiError && (
        <Alert severity="error" sx={{ m: 2, mb: 0 }}>
          {aiError}
        </Alert>
      )}

      <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
        {/* AI Prompt Section */}
        {showAIPrompt && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Describe what you want the email to be about:
            </Typography>
            <TextField
              fullWidth
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g., Meeting request for Tuesday, Follow up on proposal..."
              variant="outlined"
              size="small"
              disabled={aiGenerating}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleAIGenerate}
                disabled={!aiPrompt.trim() || aiGenerating}
                startIcon={aiGenerating ? <CircularProgress size={16} /> : <AutoAwesome />}
                size="small"
              >
                {aiGenerating ? 'Generating...' : 'Generate'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowAIPrompt(false)}
                disabled={aiGenerating}
                size="small"
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}

        {/* Email Form Fields */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="To *"
            value={formData.to}
            onChange={handleInputChange('to')}
            fullWidth
            variant="outlined"
            disabled={!!selectedEmail || aiGenerating}
          />
          
          <TextField
            label="CC"
            value={formData.cc}
            onChange={handleInputChange('cc')}
            fullWidth
            variant="outlined"
            disabled={!!selectedEmail || aiGenerating}
          />
          
          <TextField
            label="BCC"
            value={formData.bcc}
            onChange={handleInputChange('bcc')}
            fullWidth
            variant="outlined"
            disabled={!!selectedEmail || aiGenerating}
          />
          
          <TextField
            label="Subject *"
            value={formData.subject}
            onChange={handleInputChange('subject')}
            fullWidth
            variant="outlined"
            disabled={aiGenerating}
          />
          
          <TextField
            label="Body"
            value={formData.body}
            onChange={handleInputChange('body')}
            fullWidth
            multiline
            rows={12}
            variant="outlined"
            disabled={aiGenerating}
          />
        </Box>
      </Box>

      {/* Action Buttons */}
      <Divider />
      <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        {!selectedEmail && (
          <>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!isFormValid || aiGenerating}
              startIcon={<Send />}
            >
              Save Email
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => setShowAIPrompt(true)}
              disabled={showAIPrompt || aiGenerating}
              startIcon={<AutoAwesome />}
            >
              AI ✨
            </Button>
          </>
        )}
        
        {aiGenerating && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              AI is generating your email...
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

// Export a function to update form fields externally (for AI streaming)
export const updateComposeForm = (
  formRef: React.MutableRefObject<any>,
  field: keyof EmailFormData,
  value: string
) => {
  if (formRef.current) {
    formRef.current.updateField(field, value);
  }
};