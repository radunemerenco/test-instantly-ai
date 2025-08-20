import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import { Email } from '../types/email';

interface EmailListProps {
  emails: Email[];
  selectedId?: number;
  onSelect: (id: number) => void;
  loading?: boolean;
}

export default function EmailList({ emails, selectedId, onSelect, loading }: EmailListProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <Paper sx={{ height: '100%', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Loading emails...
        </Typography>
      </Paper>
    );
  }

  if (emails.length === 0) {
    return (
      <Paper sx={{ height: '100%', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Email List
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No emails yet. Create your first email using the compose form!
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ height: '100%', overflow: 'auto' }}>
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="h6">
          Email List ({emails.length})
        </Typography>
      </Box>
      <Divider />
      <List sx={{ p: 0 }}>
        {emails.map((email, index) => (
          <React.Fragment key={email.id}>
            <ListItem disablePadding>
              <ListItemButton
                selected={selectedId === email.id}
                onClick={() => onSelect(email.id)}
                sx={{
                  py: 1.5,
                  px: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" noWrap>
                      {email.subject || 'No Subject'}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        To: {truncateText(email.to)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(email.created_at)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
            {index < emails.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
}