import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Clipboard } from 'react-native';
import { formatDate } from './formatters';
import type { HistoryEntry } from '@/types';

export async function copyToClipboard(text: string): Promise<void> {
  Clipboard.setString(text);
}

export function historyToCSV(entries: HistoryEntry[]): string {
  const header = 'Date,Module,Expression,Result,Label,Note,Tags,Favorited';
  const rows = entries
    .filter((e) => !e.isDeleted)
    .map((e) => {
      const row = [
        formatDate(e.timestamp, 'yyyy-MM-dd HH:mm:ss'),
        e.module,
        `"${(e.expression ?? '').replace(/"/g, '""')}"`,
        `"${e.result.replace(/"/g, '""')}"`,
        `"${(e.label ?? '').replace(/"/g, '""')}"`,
        `"${(e.note ?? '').replace(/"/g, '""')}"`,
        `"${(e.tags ?? []).join(';')}"`,
        e.isFavorited ? 'Yes' : 'No',
      ];
      return row.join(',');
    });
  return [header, ...rows].join('\n');
}

export function historyToText(entries: HistoryEntry[]): string {
  return entries
    .filter((e) => !e.isDeleted)
    .map((e) => {
      const lines = [
        `[${e.module.toUpperCase()}] ${formatDate(e.timestamp, 'MMM d, yyyy h:mm a')}`,
        e.expression ? `  Expression: ${e.expression}` : '',
        `  Result: ${e.result}`,
        e.label ? `  Label: ${e.label}` : '',
        e.note ? `  Note: ${e.note}` : '',
      ].filter(Boolean);
      return lines.join('\n');
    })
    .join('\n\n');
}

export async function exportHistory(
  entries: HistoryEntry[],
  format: 'csv' | 'text' = 'csv'
): Promise<void> {
  const content = format === 'csv' ? historyToCSV(entries) : historyToText(entries);
  const filename = `calcpro-history-${Date.now()}.${format === 'csv' ? 'csv' : 'txt'}`;
  const file = new File(Paths.document, filename);
  file.write(content);
  await Sharing.shareAsync(file.uri);
}
