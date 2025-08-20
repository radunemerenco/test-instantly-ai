import React, { useState, useEffect } from 'react';
import { Grid, Container, Box, ThemeProvider, createTheme } from '@mui/material';
import EmailList from '../components/EmailList';
import ComposeForm from '../components/ComposeForm';
import { useStreamingAI } from '../hooks/useStreamingAI';
import { Email, EmailFormData } from '../types/email';
import { emailApi } from '../utils/api';

// Wrapper component to handle form data updates
function ComposeFormWithData({
  selectedEmail,
  formData,
  setFormData,
  onSaveAsDraft,
  onSendEmail,
  onDeleteEmail,
  onAIGenerate,
  aiGenerating,
  aiError
}: {
  selectedEmail?: Email;
  formData: EmailFormData;
  setFormData: React.Dispatch<React.SetStateAction<EmailFormData>>;
  onSaveAsDraft?: (formData: EmailFormData) => void;
  onSendEmail?: (formData: EmailFormData) => void;
  onDeleteEmail?: (emailId: number) => void;
  onAIGenerate?: (prompt: string) => void;
  aiGenerating?: boolean;
  aiError?: string;
}) {
  // Update formData when selectedEmail changes
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
  }, [selectedEmail, setFormData]);

  const handleFormChange = (field: keyof EmailFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isReadOnly = selectedEmail?.status === 'sent';

  return (
    <ComposeForm
      selectedEmail={selectedEmail}
      formData={formData}
      onFormChange={handleFormChange}
      onSaveAsDraft={onSaveAsDraft}
      onSendEmail={onSendEmail}
      onDeleteEmail={onDeleteEmail}
      onAIGenerate={onAIGenerate}
      aiGenerating={aiGenerating}
      aiError={aiError}
      isReadOnly={isReadOnly}
    />
  );
}

const theme = createTheme();

export default function Home() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<number | undefined>();
  const [selectedEmail, setSelectedEmail] = useState<Email | undefined>();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<EmailFormData>({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: ''
  });

  const {
    isGenerating,
    error: aiError,
    startGeneration,
  } = useStreamingAI({
    onSubjectUpdate: (subject) => {
      setFormData(prev => ({ ...prev, subject }));
    },
    onBodyUpdate: (body) => {
      setFormData(prev => ({ ...prev, body }));
    },
    onComplete: () => {
      console.log('AI generation complete');
      // Refresh emails list after generation
      loadEmails();
    }
  });

  const loadEmails = async () => {
    try {
      const emailList = await emailApi.getEmails();
      setEmails(emailList);
    } catch (error) {
      console.error('Failed to load emails:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmails();
  }, []);

  useEffect(() => {
    if (selectedEmailId) {
      const email = emails.find(e => e.id === selectedEmailId);
      setSelectedEmail(email);
    } else {
      setSelectedEmail(undefined);
    }
  }, [selectedEmailId, emails]);

  const handleEmailSelect = (id: number) => {
    setSelectedEmailId(id === selectedEmailId ? undefined : id);
    // Reset form data when selecting an email
    if (id !== selectedEmailId) {
      setFormData({ to: '', cc: '', bcc: '', subject: '', body: '' });
    }
  };

  const handleNewEmail = () => {
    setSelectedEmailId(undefined);
    setSelectedEmail(undefined);
    setFormData({ to: '', cc: '', bcc: '', subject: '', body: '' });
  };

  const handleSaveAsDraft = async (emailData: EmailFormData) => {
    try {
      if (selectedEmail) {
        // Update existing email
        await emailApi.updateEmailStatus(selectedEmail.id, 'draft');
      } else {
        // Create new email as draft
        await emailApi.createEmail(emailData);
      }
      await loadEmails();
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const handleSendEmail = async (emailData: EmailFormData) => {
    try {
      if (selectedEmail) {
        // Update existing email to sent
        await emailApi.updateEmailStatus(selectedEmail.id, 'sent');
      } else {
        // Create new email and mark as sent
        const result = await emailApi.createEmail(emailData);
        await emailApi.updateEmailStatus(result.id, 'sent');
      }
      await loadEmails();
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const handleDeleteEmail = async (emailId: number) => {
    try {
      await emailApi.deleteEmail(emailId);
      // Clear selection and reset form
      setSelectedEmailId(undefined);
      setSelectedEmail(undefined);
      setFormData({ to: '', cc: '', bcc: '', subject: '', body: '' });
      await loadEmails();
    } catch (error) {
      console.error('Failed to delete email:', error);
    }
  };

  const handleAIGenerate = async (prompt: string) => {
    console.log('AI Generate:', prompt, selectedEmail ? `updating email ${selectedEmail.id}` : 'creating new email');
    await startGeneration({
      prompt,
      emailId: selectedEmail?.id, // Pass email ID if updating existing draft
      context: {
        recipient: formData.to,
        senderName: 'User'
      }
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl" sx={{ py: 2, height: '100vh' }}>
        <Box sx={{ height: '100%' }}>
          <Grid container spacing={2} sx={{ height: '100%' }}>
            {/* Email List Sidebar */}
            <Grid item xs={12} md={4} sx={{ height: '100%', overflow: 'hidden' }}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <EmailList
                  emails={emails}
                  selectedId={selectedEmailId}
                  onSelect={handleEmailSelect}
                  onNewEmail={handleNewEmail}
                  loading={loading}
                />
              </Box>
            </Grid>
            
            {/* Compose/View Form */}
            <Grid item xs={12} md={8} sx={{ height: '100%', overflow: 'hidden' }}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <ComposeFormWithData 
                  selectedEmail={selectedEmail}
                  formData={formData}
                  setFormData={setFormData}
                  onSaveAsDraft={handleSaveAsDraft}
                  onSendEmail={handleSendEmail}
                  onDeleteEmail={handleDeleteEmail}
                  onAIGenerate={handleAIGenerate}
                  aiGenerating={isGenerating}
                  aiError={aiError}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
}