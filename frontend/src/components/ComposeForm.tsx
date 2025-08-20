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
import { AutoAwesome, Send, Save, Drafts, Delete } from '@mui/icons-material';
import { EmailFormData, Email, EmailStatus } from '../types/email';
import { validateEmailForm, EmailFormErrors, hasValidationErrors } from '../utils/validation';

interface ComposeFormProps {
  selectedEmail?: Email;
  formData?: EmailFormData;
  onFormChange?: (field: keyof EmailFormData, value: string) => void;
  onSaveAsDraft?: (formData: EmailFormData) => void;
  onSendEmail?: (formData: EmailFormData) => void;
  onDeleteEmail?: (emailId: number) => void;
  onAIGenerate?: (prompt: string) => void;
  aiGenerating?: boolean;
  aiError?: string;
  isReadOnly?: boolean;
}

export default function ComposeForm({ 
  selectedEmail, 
  formData: externalFormData,
  onFormChange,
  onSaveAsDraft, 
  onSendEmail,
  onDeleteEmail,
  onAIGenerate, 
  aiGenerating = false,
  aiError,
  isReadOnly = false
}: ComposeFormProps) {
  const [internalFormData, setInternalFormData] = useState<EmailFormData>({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: ''
  });

  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [validationErrors, setValidationErrors] = useState<EmailFormErrors>({
    to: [],
    cc: [],
    bcc: [],
    subject: [],
    body: []
  });

  // Use external form data if provided, otherwise use internal
  const formData = externalFormData || internalFormData;

  // Update form when selected email changes (only if no external form data)
  useEffect(() => {
    if (selectedEmail && !externalFormData) {
      setInternalFormData({
        to: selectedEmail.to || '',
        cc: selectedEmail.cc || '',
        bcc: selectedEmail.bcc || '',
        subject: selectedEmail.subject || '',
        body: selectedEmail.body || ''
      });
    }
  }, [selectedEmail, externalFormData]);

  const handleInputChange = (field: keyof EmailFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    if (onFormChange) {
      onFormChange(field, value);
    } else {
      setInternalFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Validate field on change
    const updatedFormData = { ...formData, [field]: value };
    const errors = validateEmailForm(updatedFormData);
    setValidationErrors(errors);
  };

  const handleSaveAsDraft = () => {
    const errors = validateEmailForm(formData);
    setValidationErrors(errors);
    
    if (!hasValidationErrors(errors) && onSaveAsDraft) {
      onSaveAsDraft(formData);
    }
  };

  const handleSendEmail = () => {
    const errors = validateEmailForm(formData);
    setValidationErrors(errors);
    
    if (!hasValidationErrors(errors) && onSendEmail) {
      onSendEmail(formData);
    }
  };

  const handleDeleteEmail = () => {
    if (onDeleteEmail && selectedEmail) {
      if (window.confirm('Are you sure you want to delete this draft email?')) {
        onDeleteEmail(selectedEmail.id);
      }
    }
  };

  const handleAIGenerate = () => {
    if (onAIGenerate && aiPrompt.trim()) {
      onAIGenerate(aiPrompt.trim());
      setShowAIPrompt(false);
      setAiPrompt('');
    }
  };

  const isFormValid = formData.to.trim() && formData.subject.trim() && !hasValidationErrors(validationErrors);

  // External function to update form fields (for AI streaming)
  React.useImperativeHandle(React.createRef(), () => ({
    updateField: (field: keyof EmailFormData, value: string) => {
      if (onFormChange) {
        onFormChange(field, value);
      } else {
        setInternalFormData(prev => ({
          ...prev,
          [field]: value
        }));
      }
    }
  }));

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Box sx={{ p: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">
            {selectedEmail ? 
              (selectedEmail.status === 'sent' ? 'Sent Email' : 'Draft Email') : 
              'Compose Email'
            }
          </Typography>
          {selectedEmail?.status && (
            <Box sx={{ 
              px: 1, 
              py: 0.5, 
              bgcolor: selectedEmail.status === 'sent' ? 'success.light' : 'warning.light',
              borderRadius: 1,
              fontSize: '0.75rem'
            }}>
              <Typography variant="caption" sx={{ color: selectedEmail.status === 'sent' ? 'success.dark' : 'warning.dark' }}>
                {selectedEmail.status.toUpperCase()}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      <Divider />
      
      {aiError && (
        <Alert severity="error" sx={{ m: 2, mb: 0 }}>
          {aiError}
        </Alert>
      )}

      <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
        {/* Email Form Fields */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="To *"
            value={formData.to}
            onChange={handleInputChange('to')}
            fullWidth
            variant="outlined"
            disabled={isReadOnly || aiGenerating}
            error={validationErrors.to.length > 0}
            helperText={validationErrors.to.length > 0 ? validationErrors.to[0] : ''}
            InputProps={{
              readOnly: isReadOnly
            }}
          />
          
          <TextField
            label="CC"
            value={formData.cc}
            onChange={handleInputChange('cc')}
            fullWidth
            variant="outlined"
            disabled={isReadOnly || aiGenerating}
            error={validationErrors.cc.length > 0}
            helperText={validationErrors.cc.length > 0 ? validationErrors.cc[0] : ''}
            InputProps={{
              readOnly: isReadOnly
            }}
          />
          
          <TextField
            label="BCC"
            value={formData.bcc}
            onChange={handleInputChange('bcc')}
            fullWidth
            variant="outlined"
            disabled={isReadOnly || aiGenerating}
            error={validationErrors.bcc.length > 0}
            helperText={validationErrors.bcc.length > 0 ? validationErrors.bcc[0] : ''}
            InputProps={{
              readOnly: isReadOnly
            }}
          />
          
          <TextField
            label="Subject *"
            value={formData.subject}
            onChange={handleInputChange('subject')}
            fullWidth
            variant="outlined"
            disabled={isReadOnly || aiGenerating}
            error={validationErrors.subject.length > 0}
            helperText={validationErrors.subject.length > 0 ? validationErrors.subject[0] : ''}
            InputProps={{
              readOnly: isReadOnly
            }}
          />
          
          <TextField
            label="Body"
            value={formData.body}
            onChange={handleInputChange('body')}
            fullWidth
            multiline
            rows={12}
            variant="outlined"
            disabled={isReadOnly || aiGenerating}
            InputProps={{
              readOnly: isReadOnly
            }}
          />
        </Box>

      </Box>

      {/* Action Buttons */}
      <Divider />
      <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        {!isReadOnly && !selectedEmail && (
          <>
            <Button
              variant="contained"
              onClick={handleSendEmail}
              disabled={!isFormValid || aiGenerating}
              startIcon={<Send />}
            >
              Send Email
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleSaveAsDraft}
              disabled={!isFormValid || aiGenerating}
              startIcon={<Drafts />}
            >
              Save as Draft
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => setShowAIPrompt(true)}
              disabled={showAIPrompt || aiGenerating}
              startIcon={<AutoAwesome />}
            >
              Generate with AI
            </Button>
          </>
        )}
        
        {selectedEmail?.status === 'draft' && !isReadOnly && (
          <>
            <Button
              variant="contained"
              onClick={handleSendEmail}
              disabled={aiGenerating}
              startIcon={<Send />}
            >
              Send Email
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => setShowAIPrompt(true)}
              disabled={showAIPrompt || aiGenerating}
              startIcon={<AutoAwesome />}
            >
              Generate with AI
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              onClick={handleDeleteEmail}
              disabled={aiGenerating}
              startIcon={<Delete />}
              sx={{ ml: 'auto' }}
            >
              Delete
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

      {/* AI Prompt Overlay - Floating over buttons */}
      {showAIPrompt && (
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: 80,
            left: 16,
            right: 16,
            p: 2, 
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 3,
            border: '1px solid',
            borderColor: 'divider',
            zIndex: 1000
          }}
        >
          <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.primary' }}>
            {selectedEmail ? 
              'Describe how you want to improve or change this email:' : 
              'Describe what you want the email to be about:'
            }
          </Typography>
          <TextField
            fullWidth
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && aiPrompt.trim() && !aiGenerating) {
                e.preventDefault();
                handleAIGenerate();
              } else if (e.key === 'Escape' && !aiGenerating) {
                e.preventDefault();
                setShowAIPrompt(false);
                setAiPrompt('');
              }
            }}
            placeholder={selectedEmail ? 
              "e.g., Make it more urgent, Add a special offer, Make it friendlier..." : 
              "e.g., Meeting request for Tuesday, Follow up on proposal..."
            }
            variant="outlined"
            size="small"
            disabled={aiGenerating}
            sx={{ mb: 2 }}
            autoFocus
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