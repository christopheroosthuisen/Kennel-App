
import React, { useState, useEffect } from 'react';
import { 
  Bell, Check, MessageSquare, AlertTriangle, Info, XCircle, 
  User, Dog, Phone, Mail, Clock, Send, AtSign, CheckCircle, 
  Archive, MoreHorizontal, Filter, Search 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Input, cn, Textarea, Modal } from './Common';
import { api } from '../api/api';
import { useApiQuery } from '../hooks/useApiQuery';
import { useEventStream } from '../hooks/useEventStream';
import { Notification, NotificationComment } from '../../shared/domain';
import { useAuth } from '../contexts/AuthContext';

const NotificationIcon = ({ type, priority }: { type: string, priority: string }) => {
  if (type === 'message') return <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><MessageSquare size={18} /></div>;
  if (type === 'warning') return <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><AlertTriangle size={18} /></div>;
  if (type === 'error') return <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600"><XCircle size={18} /></div>;
  if (type === 'success') return <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"><CheckCircle size={18} /></div>;
  return <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"><Info size={18} /></div>;
};

export const Notifications = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('unread');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Real data
  const { data: notifications = [], refetch } = useApiQuery('notifs', () => api.listNotifications({ unreadOnly: activeFilter === 'unread' }), [activeFilter]);
  
  // Real comments for selected
  const { data: comments = [], refetch: refetchComments } = useApiQuery(
    selectedId ? `comments-${selectedId}` : 'noop',
    async () => selectedId ? api.listNotificationComments(selectedId) : { data: [] },
    [selectedId]
  );

  const [commentText, setCommentText] = useState('');

  // Live updates
  useEventStream((event) => {
    if (event.type === 'notification') {
      refetch();
      if (selectedId && event.payload.notificationId === selectedId) {
        refetchComments();
      }
    }
  });

  const selectedNotification = notifications.find(n => n.id === selectedId);

  const isRead = (n: Notification) => n.readByUserIds.includes(user?.id || '');

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await api.markNotificationRead(id);
    refetch();
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedId) return;
    await api.createNotificationComment(selectedId, commentText);
    setCommentText('');
    refetchComments();
  };

  // Helper to get formatted date safely
  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString() + ' ' + new Date(iso).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    } catch { return ''; }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      {/* Left Sidebar: Notification List */}
      <div className="w-96 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Bell className="text-primary-600" size={24} /> Inbox
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveFilter('unread')}
              className={cn(
                "flex-1 py-1.5 text-xs font-medium rounded-md transition-colors border",
                activeFilter === 'unread' ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              Unread
            </button>
            <button 
              onClick={() => setActiveFilter('all')}
              className={cn(
                "flex-1 py-1.5 text-xs font-medium rounded-md transition-colors border",
                activeFilter === 'all' ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              All
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <div className="bg-white p-4 rounded-full inline-flex mb-3 border border-slate-100">
                <CheckCircle size={24} />
              </div>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map(notification => {
                const read = isRead(notification);
                return (
                  <div 
                    key={notification.id}
                    onClick={() => setSelectedId(notification.id)}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-slate-100 transition-colors relative group",
                      selectedId === notification.id ? "bg-white border-l-4 border-l-primary-500 shadow-sm z-10" : "bg-transparent border-l-4 border-l-transparent",
                      !read && "bg-blue-50/30"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        {!read && <div className="h-2 w-2 rounded-full bg-primary-600" title="Unread" />}
                        <span className={cn("text-xs font-bold uppercase tracking-wider", 
                          notification.priority === 'urgent' ? "text-red-600" : 
                          notification.priority === 'high' ? "text-orange-600" : "text-slate-500"
                        )}>
                          {notification.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {fmtDate(notification.createdAt)}
                      </span>
                    </div>
                    
                    <h4 className={cn("font-semibold text-sm mb-1 line-clamp-1", !read ? "text-slate-900" : "text-slate-700")}>
                      {notification.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>

                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button 
                         variant="ghost" size="icon" className="h-6 w-6 bg-white shadow-sm border border-slate-100"
                         title="Mark as Read"
                         onClick={(e) => handleMarkAsRead(notification.id, e)}
                       >
                         <Check size={12} className="text-slate-400 hover:text-green-600"/>
                       </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Content: Detail View */}
      <div className="flex-1 flex flex-col bg-white h-full">
        {selectedNotification ? (
          <>
            <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-3">
                <NotificationIcon type={selectedNotification.type} priority={selectedNotification.priority} />
                <div>
                  <h1 className="text-lg font-bold text-slate-900 leading-none">{selectedNotification.title}</h1>
                  <span className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    {fmtDate(selectedNotification.createdAt)}
                    {selectedNotification.priority === 'urgent' && <Badge variant="danger" className="ml-2 py-0 text-[10px]">Urgent</Badge>}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {!isRead(selectedNotification) && (
                  <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(selectedNotification.id)} className="text-xs gap-2">
                    <Check size={14} /> Mark Read
                  </Button>
                )}
                <Button variant="ghost" size="icon" title="Archive"><Archive size={18} className="text-slate-400"/></Button>
                <Button variant="ghost" size="icon"><MoreHorizontal size={18} className="text-slate-400"/></Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-white rounded-lg p-6 border border-slate-100 shadow-sm mb-8">
                <div className="prose prose-sm max-w-none text-slate-700">
                  <p className="text-lg leading-relaxed">{selectedNotification.message}</p>
                </div>
              </div>

              {/* Activity & Comments */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MessageSquare size={16} /> Team Activity
                </h3>
                
                <div className="space-y-4 mb-6">
                  {comments.length === 0 ? (
                    <div className="text-sm text-slate-400 italic pl-4 border-l-2 border-slate-100">
                      No internal comments yet. Tag a team member to start a discussion.
                    </div>
                  ) : (
                    comments.map(comment => (
                      <div key={comment.id} className="flex gap-3 group">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {comment.userName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline justify-between">
                            <span className="text-sm font-bold text-slate-800">{comment.userName}</span>
                            <span className="text-xs text-slate-400">{fmtDate(comment.createdAt)}</span>
                          </div>
                          <div className="text-sm text-slate-600 mt-0.5 bg-slate-50 p-2 rounded-br-lg rounded-bl-lg rounded-tr-lg border border-slate-100">
                            {comment.text}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Input */}
                <div className="flex gap-3 items-start bg-slate-50 p-4 rounded-lg border border-slate-200">
                   <div className="h-8 w-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      You
                   </div>
                   <div className="flex-1">
                      <Textarea 
                        placeholder="Write an internal note or @mention a team member..." 
                        className="min-h-[80px] text-sm bg-white mb-2"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      />
                      <div className="flex justify-between items-center">
                         <Button size="sm" onClick={handleAddComment} disabled={!commentText.trim()}>Post Comment</Button>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Bell size={32} className="opacity-20" />
            </div>
            <p>Select a notification to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};
