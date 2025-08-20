import React, { useState, useEffect } from 'react';
import { Grid, Container, Box, ThemeProvider, createTheme } from '@mui/material';
import EmailList from '../components/EmailList';
import ComposeForm from '../components/ComposeForm';
import { useStreamingAI } from '../hooks/useStreamingAI';
import { Email, EmailFormData } from '../types/email';
import { emailApi } from '../utils/api';

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

  const handleSaveEmail = async (emailData: EmailFormData) => {
    console.log('Saving email:', emailData);
    // The API will be called via the AI generation process
    // For now, just refresh the list
    await loadEmails();
  };

  const handleAIGenerate = async (prompt: string) => {
    console.log('AI Generate:', prompt);
    await startGeneration({
      prompt,
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
            <Grid item xs={12} md={4}>
              <EmailList
                emails={emails}
                selectedId={selectedEmailId}
                onSelect={handleEmailSelect}
                loading={loading}
              />
            </Grid>
            
            {/* Compose/View Form */}
            <Grid item xs={12} md={8}>
              <ComposeForm
                selectedEmail={selectedEmail}
                onSave={handleSaveEmail}
                onAIGenerate={handleAIGenerate}
                aiGenerating={isGenerating}
                aiError={aiError}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
}