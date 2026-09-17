import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, KeyRound } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { api, getErrorMessage } from '../lib/api';

const SettingsDialog = ({ open, onOpenChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [configured, setConfigured] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setApiKey('');
      api
        .getApiKeyStatus()
        .then((status) => setConfigured(status.configured))
        .catch(() => setConfigured(false));
    }
  }, [open]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error('Enter an API key.');
      return;
    }
    setSaving(true);
    try {
      await api.setApiKey(apiKey.trim());
      toast.success('API key saved');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save API key', error);
      toast.error(getErrorMessage(error) || 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Quiz generation uses the DeepSeek API. Paste your API key below — it is stored only on
            this computer.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <KeyRound className="w-4 h-4" />
            DeepSeek API key
          </label>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            disabled={saving}
          />
          <p className="text-xs text-gray-500">
            {configured
              ? 'A key is currently configured — saving will replace it.'
              : 'No key configured yet.'}
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
