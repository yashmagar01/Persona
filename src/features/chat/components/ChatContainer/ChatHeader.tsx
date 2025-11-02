// ChatHeader.tsx
// Sticky top bar with conversation info, persona avatar, and actions (ChatGPT-inspired)

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Menu, MoreVertical, Copy, FileDown, Trash2, Settings, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/sonner';

export interface ChatHeaderProps {
  title?: string;
  conversationId?: string;
  personaName?: string;
  personaAvatarUrl?: string | null;
  onToggleSidebar?: () => void;
  onNewChat?: () => void;
  onRename?: (title: string) => void;
  onCopyConversation?: () => void;
  onExportPdf?: () => void;
  onDeleteConversation?: () => void;
  onOpenSettings?: () => void;
  className?: string;
}

export function ChatHeader({
  title = 'New Conversation',
  conversationId,
  personaName = 'College Sahayak',
  personaAvatarUrl,
  onToggleSidebar,
  onNewChat,
  onRename,
  onCopyConversation,
  onExportPdf,
  onDeleteConversation,
  onOpenSettings,
  className,
}: ChatHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setDraftTitle(title), [title]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitRename = useCallback(() => {
    const next = draftTitle.trim() || 'New Conversation';
    setEditing(false);
    if (next !== title) {
      onRename?.(next);
      toast('Title updated');
    }
  }, [draftTitle, onRename, title]);

  const iconBtn =
    'inline-flex items-center justify-center h-9 w-9 rounded-md text-[#b4b4b4] hover:text-[#ececec] hover:bg-[#3f3f3f] focus:outline-none focus:ring-2 focus:ring-[#10a37f] transition-transform duration-150 hover:scale-[1.05]';

  return (
    <header
      className={cn(
        'sticky top-0 z-10 h-14 px-4 py-3', // 56px height, 12px/16px padding
        'bg-[#212121] border-b border-[rgba(77,77,77,0.2)]',
        className
      )}
    >
      <div className="flex items-center gap-2 text-[#ececec]">
        {/* Left: hamburger (mobile only) */}
        <button
          aria-label="Toggle sidebar"
          className={cn(iconBtn, 'md:hidden')}
          onClick={onToggleSidebar}
        >
          <Menu size={20} />
        </button>

        {/* Center: avatar + title (editable) */}
        <div className="flex items-center gap-2 min-w-0 mr-auto">
          <Avatar className="h-7 w-7">
            <AvatarImage src={personaAvatarUrl || undefined} alt={personaName} />
            <AvatarFallback>CS</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            {!editing ? (
              <div
                className="text-sm sm:text-base font-medium truncate cursor-text"
                title={title || 'New Conversation'}
                onDoubleClick={() => setEditing(true)}
              >
                {title || 'New Conversation'}
              </div>
            ) : (
              <input
                ref={inputRef}
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename();
                  if (e.key === 'Escape') {
                    setEditing(false);
                    setDraftTitle(title);
                  }
                }}
                className="bg-[#2f2f2f] text-[#ececec] px-2 py-1 rounded-md border border-transparent focus:border-[#10a37f] focus:outline-none text-sm sm:text-base w-[220px]"
                aria-label="Rename conversation"
              />
            )}
            <div className="text-[12px] text-[#b4b4b4] truncate">{personaName}</div>
          </div>
        </div>

        {/* Right side: new chat, menu */}
        <button
          aria-label="New chat"
          className={cn(iconBtn, 'hidden sm:inline-flex')}
          onClick={onNewChat}
          title="New Chat"
        >
          <Plus size={20} />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button aria-label="More options" className={iconBtn}>
              <MoreVertical size={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52 motion-safe:animate-fade-in-up">
            <DropdownMenuLabel>Conversation</DropdownMenuLabel>
            <DropdownMenuItem onClick={onCopyConversation || (() => toast('Copied conversation'))}>
              <Copy className="mr-2 h-4 w-4" /> Copy conversation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportPdf || (() => toast('Exporting as PDF…'))}>
              <FileDown className="mr-2 h-4 w-4" /> Export as PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onOpenSettings || (() => toast('Open settings'))}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (confirm('Delete this conversation? This cannot be undone.')) {
                  if (onDeleteConversation) onDeleteConversation();
                  else toast('Conversation deleted');
                }
              }}
              className="text-red-500 focus:text-red-500"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default ChatHeader;
