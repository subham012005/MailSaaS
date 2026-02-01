'use client';

import { Paperclip, Download, FileText, Image as ImageIcon, File } from 'lucide-react';
import { useState } from 'react';
import { downloadAttachment } from '@/lib/api';

interface Attachment {
    id: string;
    filename: string;
    mimeType: string;
    size: number;
}

interface AttachmentViewerProps {
    attachments: Attachment[];
    messageId: string;
    accessToken: string;
    userEmail: string;
}

export default function AttachmentViewer({ attachments, messageId, accessToken, userEmail }: AttachmentViewerProps) {
    const [downloading, setDownloading] = useState<string | null>(null);

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return ImageIcon;
        if (mimeType.includes('pdf')) return FileText;
        return File;
    };

    const handleDownload = async (attachment: Attachment) => {
        setDownloading(attachment.id);
        try {
            const { data } = await downloadAttachment(userEmail, messageId, attachment.id, accessToken);

            // Convert base64 to blob
            const byteCharacters = atob(data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: attachment.mimeType });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = attachment.filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download attachment');
        } finally {
            setDownloading(null);
        }
    };

    if (!attachments || attachments.length === 0) return null;

    return (
        <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider font-bold">
                <Paperclip className="w-3 h-3" />
                <span>{attachments.length} Attachment{attachments.length > 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-2">
                {attachments.map((attachment) => {
                    const Icon = getFileIcon(attachment.mimeType);
                    return (
                        <div
                            key={attachment.id}
                            className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{attachment.filename}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                            </div>
                            <button
                                onClick={() => handleDownload(attachment)}
                                disabled={downloading === attachment.id}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                                title="Download"
                            >
                                {downloading === attachment.id ? (
                                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4 text-gray-400" />
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
