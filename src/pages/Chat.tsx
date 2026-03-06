import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Search, 
  User, 
  MoreVertical, 
  Phone, 
  Video, 
  Info,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Circle
} from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { useAuthStore } from '../store/useAuthStore';
import { ChatMessage } from '../types';
import { cn } from '../lib/utils';

export default function ChatPage() {
  const { users, drivers, chatMessages, addChatMessage } = useDataStore();
  const currentUser = useAuthStore(state => state.user);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const contacts = [
    ...users.filter(u => u.id !== currentUser?.id),
    ...drivers.map(d => ({ ...d, role: 'driver' }))
  ];

  const filteredMessages = chatMessages.filter(m => 
    (m.sender_id === currentUser?.id && m.receiver_id === selectedContactId) ||
    (m.sender_id === selectedContactId && m.receiver_id === currentUser?.id)
  );

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedContactId || !currentUser) return;

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      company_id: currentUser.company_id || '1',
      sender_id: currentUser.id,
      receiver_id: selectedContactId,
      message: messageText,
      timestamp: new Date().toISOString(),
      read: false
    };

    addChatMessage(newMessage);
    setMessageText('');
  };

  return (
    <div className="h-[calc(100vh-160px)] flex bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
      {/* Contacts List */}
      <div className="w-80 border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold mb-4">Mensagens</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Procurar contacto..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-sidebar/20 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedContactId(contact.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-2xl transition-all group",
                selectedContactId === contact.id ? "bg-sidebar text-white shadow-lg shadow-sidebar/20" : "hover:bg-gray-50"
              )}
            >
              <div className="relative">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0",
                  selectedContactId === contact.id ? "bg-white/20" : "bg-gray-100 text-gray-500"
                )}>
                  {contact.full_name.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-bold text-sm truncate">{contact.full_name}</p>
                <p className={cn(
                  "text-[10px] uppercase font-bold tracking-widest",
                  selectedContactId === contact.id ? "text-white/60" : "text-gray-400"
                )}>
                  {contact.role === 'driver' ? 'Motorista' : 'Equipa'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50/30">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-500">
                  {selectedContact.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedContact.full_name}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-sidebar hover:bg-gray-100 rounded-lg transition-all">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-sidebar hover:bg-gray-100 rounded-lg transition-all">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-sidebar hover:bg-gray-100 rounded-lg transition-all">
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-6"
            >
              {filteredMessages.length > 0 ? (
                filteredMessages.map((m) => {
                  const isMe = m.sender_id === currentUser?.id;
                  return (
                    <div 
                      key={m.id}
                      className={cn(
                        "flex flex-col max-w-[70%]",
                        isMe ? "ml-auto items-end" : "items-start"
                      )}
                    >
                      <div className={cn(
                        "p-4 rounded-2xl text-sm shadow-sm",
                        isMe ? "bg-sidebar text-white rounded-tr-none" : "bg-white text-gray-900 rounded-tl-none border border-gray-100"
                      )}>
                        {m.message}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 px-1">
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && (
                          m.read ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                    <Smile className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Diga olá ao {selectedContact.full_name.split(' ')[0]}!</p>
                  <p className="text-xs text-gray-400 mt-1">Comece uma conversa agora.</p>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                <button type="button" className="p-2 text-gray-400 hover:text-sidebar hover:bg-gray-100 rounded-lg transition-all">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    placeholder="Escreva a sua mensagem..."
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-sidebar/20 transition-all"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500 transition-colors">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  type="submit"
                  disabled={!messageText.trim()}
                  className="p-3 bg-sidebar text-white rounded-2xl hover:bg-black transition-all shadow-lg shadow-sidebar/20 disabled:opacity-50 disabled:shadow-none"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-24 h-24 bg-white rounded-[32px] shadow-sm flex items-center justify-center mb-6">
              <Send className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">As Suas Mensagens</h3>
            <p className="text-gray-500 mt-2 max-w-xs mx-auto">
              Selecione um contacto da lista para começar a conversar com a sua equipa ou motoristas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
