// ChatSidebar.tsx
// Fully featured ChatGPT-inspired sidebar with animations and accessibility

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Settings, ChevronLeft, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/lib/toast.utils';
import { cn } from '@/lib/utils';
import { useChatStore, useSidebarState } from '@/features/chat/hooks/useChatStore';
import { messageVariants, sidebarVariants, interactions } from '@/styles/animations';
import { useIsMobile } from '@/hooks/use-responsive';
import { useSwipe, useClickOutside } from '@/hooks/use-touch';

type ConversationItem = {
  id: string;
  title: string;
  preview: string;
  updatedAt: number;
};

const mockConversations: ConversationItem[] = [
  {
    id: 'guest-1730544000001',
    title: 'Marie Curie — Radioactivity',
    preview: 'Let us explore the nature of radioactivity and its implications...',
    updatedAt: Date.now() - 1000 * 60 * 5,
  },
  {
    id: 'guest-1730544000002',
    title: 'Leonardo da Vinci — Invention',
    preview: 'The interplay of art and engineering begins with observation...',
    updatedAt: Date.now() - 1000 * 60 * 60,
  },
  {
    id: 'guest-1730544000003',
    title: 'Cleopatra — Diplomacy',
    preview: 'Power is negotiated as much as it is taken; consider your allies...',
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
  },
];

export interface ChatSidebarProps {
  className?: string;
}

export default function ChatSidebar({ className }: ChatSidebarProps) {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const location = useLocation();

  const { isOpen, setOpen, toggle } = useSidebarState();
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const isMobile = useIsMobile();

  const [conversations, setConversations] = useState<ConversationItem[]>(mockConversations);

  // Swipe gestures for mobile
  const sidebarRef = useSwipe<HTMLDivElement>({
    onSwipeRight: () => {
      if (isMobile && isOpen) {
        setOpen(false);
      }
    },
  });

  // Click outside to close on mobile
  const overlayRef = useClickOutside<HTMLDivElement>(() => {
    if (isMobile && isOpen) {
      setOpen(false);
    }
  });

  // Sync URL param to store
  useEffect(() => {
    if (conversationId && conversationId !== activeConversationId) {
      setActiveConversation(conversationId);
    }
  }, [conversationId, activeConversationId, setActiveConversation]);

  // Smooth scroll to active item
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  useEffect(() => {
    if (activeConversationId && itemRefs.current[activeConversationId]) {
      itemRefs.current[activeConversationId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeConversationId]);

  // Derived sorted list (most recent first)
  const sortedConversations = useMemo(
    () => [...conversations].sort((a, b) => b.updatedAt - a.updatedAt),
    [conversations]
  );

  const createNewConversation = () => {
    const id = `guest-${Date.now()}`;
    const newItem: ConversationItem = {
      id,
      title: 'New Chat',
      preview: 'Start the conversation…',
      updatedAt: Date.now(),
    };
    setConversations((prev) => [newItem, ...prev]);
    setActiveConversation(id);
    navigate(`/chat/${id}`);
    toast.success?.('New chat created');
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    toast.success('Conversation deleted');
    if (activeConversationId === id) {
      setActiveConversation(null);
      // If deleting current conversation, go home
      if (location.pathname.startsWith('/chat/')) {
        navigate('/');
      }
    }
  };

  const onSelectConversation = (id: string) => {
    setActiveConversation(id);
    navigate(`/chat/${id}`);
    // On mobile, close overlay when selecting
    setOpen(false);
  };

  // Sidebar container classes
  const baseAside = cn(
    'bg-[#171717] text-[#ececec] border-r border-[rgba(77,77,77,0.2)]',
    'flex flex-col h-full w-full md:w-[260px] select-none',
    'md:relative md:translate-x-0',
    className
  );

  return (
    <>
      {/* Mobile overlay with click-outside and safe areas */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={overlayRef}
            aria-hidden
            className={cn(
              "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden",
              // Respect safe areas on mobile
              "pt-safe pb-safe pl-safe pr-safe"
            )}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sidebarVariants.fadeIn()}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar with swipe support */}
      <AnimatePresence initial={false}>
        {(isOpen || typeof window === 'undefined') && (
          <motion.aside
            ref={sidebarRef}
            role="navigation"
            aria-label="Chat sidebar"
            className={cn(
              baseAside,
              'fixed z-50 inset-y-0 left-0 md:z-auto md:inset-auto md:static',
              'shadow-[0_10px_20px_-10px_rgba(0,0,0,0.4)]',
              // Mobile: full screen with safe areas
              isMobile && 'pt-safe pb-safe',
              // Enable smooth scrolling on mobile
              'mobile-scroll'
            )}
            // Width is responsive: full-width on mobile overlay, fixed on md+
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sidebarVariants.slideInLeft()}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {/* Top controls (mobile hamburger + desktop collapse) */}
            <div className="flex items-center justify-between px-3 py-2 md:px-3 md:py-2">
              <button
                aria-label="Toggle sidebar"
                className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-md text-[#b4b4b4] hover:text-[#ececec] hover:bg-[#3f3f3f] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                onClick={() => setOpen(false)}
              >
                <Menu size={18} />
              </button>
              <div className="flex-1" />
              <button
                aria-label="Collapse sidebar"
                className="hidden md:inline-flex items-center justify-center h-8 w-8 rounded-md text-[#b4b4b4] hover:text-[#ececec] hover:bg-[#3f3f3f] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                onClick={toggle}
              >
                <ChevronLeft size={18} />
              </button>
            </div>

            {/* Header: New Chat */}
            <div className="px-3 pb-2">
              <button
                aria-label="New chat"
                onClick={createNewConversation}
                className={cn(
                  'w-full inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 font-medium',
                  'bg-gradient-to-r from-[#0e8c6f] via-[#10a37f] to-[#19c37d]',
                  'text-white shadow-md hover:brightness-[1.05] active:brightness-95',
                  'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10a37f] focus:ring-offset-[#171717]'
                )}
              >
                <Plus size={18} />
                New Chat
              </button>
            </div>

            {/* Conversation list */}
            <motion.div
              className="flex-1 overflow-y-auto px-1"
              variants={messageVariants.staggerContainer()}
              initial="hidden"
              animate="visible"
            >
              <ul role="list" className="space-y-1 pb-2">
                {sortedConversations.map((c, idx) => {
                  const active = (activeConversationId ?? conversationId) === c.id;
                  return (
                    <motion.li key={c.id} variants={messageVariants.fadeInUp()}>
                      <div
                        ref={(el) => (itemRefs.current[c.id] = el)}
                        className={cn(
                          'group relative flex items-center gap-2 rounded-md px-2 py-2',
                          'text-[#ececec] hover:bg-[#3f3f3f] transition-colors',
                          active && 'bg-[#2f2f2f]'
                        )}
                      >
                        {/* Active left border */}
                        <span
                          aria-hidden
                          className={cn('absolute left-0 top-0 h-full', active ? 'bg-[#10a37f]' : 'bg-transparent')}
                          style={{ width: active ? 3 : 0 }}
                        />

                        {/* Clickable area */}
                        <motion.button
                          whileHover={interactions.hoverScale}
                          whileTap={interactions.pressScale}
                          onClick={() => onSelectConversation(c.id)}
                          aria-label={`Open conversation: ${c.title}`}
                          className={cn(
                            'flex-1 text-left outline-none',
                            'focus-visible:ring-2 focus-visible:ring-[#10a37f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#171717] rounded'
                          )}
                        >
                          <div className="flex flex-col -space-y-0.5">
                            <span className="text-[13px] font-medium leading-tight truncate">{c.title}</span>
                            <span className="text-[12px] text-[#b4b4b4] leading-tight truncate">
                              {c.preview}
                            </span>
                          </div>
                        </motion.button>

                        {/* Delete icon (hover reveal) */}
                        <button
                          aria-label={`Delete conversation ${c.title}`}
                          onClick={() => deleteConversation(c.id)}
                          className={cn(
                            'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
                            'inline-flex items-center justify-center h-8 w-8 rounded-md text-[#b4b4b4] hover:text-[#ececec] hover:bg-[#3f3f3f]',
                            'focus:outline-none focus:ring-2 focus:ring-[#10a37f]'
                          )}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>

            {/* Footer: User profile */}
            <div className="mt-auto px-3 py-3 border-t border-[rgba(77,77,77,0.2)]">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://i.pravatar.cc/40?img=68" alt="User avatar" />
                  <AvatarFallback>YM</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">Yash Magar</p>
                  <p className="text-[12px] text-[#b4b4b4] truncate">Free plan</p>
                </div>
                <button
                  aria-label="Open settings"
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md text-[#b4b4b4] hover:text-[#ececec] hover:bg-[#3f3f3f] focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
                  onClick={() => toast.info('Settings coming soon')}
                >
                  <Settings size={18} />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
