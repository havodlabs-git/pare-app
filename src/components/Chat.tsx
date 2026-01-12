import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

interface Message {
  id: string;
  senderId: string;
  senderType: 'user' | 'professional';
  senderName: string;
  content: string;
  createdAt: string;
  read: boolean;
}

interface Conversation {
  id: string;
  professionalId: string;
  professionalName: string;
  professionalPhotoUrl: string | null;
  professionalSpecialty: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadByUser: number;
  status: string;
}

interface Professional {
  id: string;
  name: string;
  specialty: string;
  photoUrl: string | null;
  bio: string;
}

interface ChatProps {
  userPlan: string;
  userId?: string;
  userName?: string;
  onUpgrade?: () => void;
}

const Chat: React.FC<ChatProps> = ({ userPlan, userId, userName, onUpgrade }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showProfessionalList, setShowProfessionalList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  const isPremium = ['premium', 'elite'].includes(userPlan?.toLowerCase());

  useEffect(() => {
    if (isPremium) {
      loadConversations();
      loadProfessionals();
    }
  }, [isPremium]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      // Poll for new messages every 3 seconds
      pollInterval.current = setInterval(() => {
        loadMessages(selectedConversation.id, true);
      }, 3000);
    }
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [selectedConversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await api.get('/chat/conversations');
      if (response.success) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfessionals = async () => {
    try {
      const response = await api.get('/chat/professionals');
      if (response.success) {
        setProfessionals(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    }
  };

  const loadMessages = async (conversationId: string, silent = false) => {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}/messages`);
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      if (!silent) console.error('Erro ao carregar mensagens:', error);
    }
  };

  const startConversation = async (professionalId: string) => {
    try {
      setLoading(true);
      const response = await api.post('/chat/conversations', { professionalId });
      if (response.success) {
        setSelectedConversation(response.data);
        setShowProfessionalList(false);
        await loadConversations();
      }
    } catch (error: any) {
      if (error.requiresPremium) {
        onUpgrade?.();
      }
      console.error('Erro ao iniciar conversa:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    // Optimistic update
    const optimisticMessage: Message = {
      id: 'temp-' + Date.now(),
      senderId: userId,
      senderType: 'user',
      senderName: userName,
      content: messageContent,
      createdAt: new Date().toISOString(),
      read: false
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      await api.post('/chat/messages', {
        conversationId: selectedConversation.id,
        content: messageContent
      });
      await loadMessages(selectedConversation.id, true);
      await loadConversations();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    }
    return date.toLocaleDateString('pt-BR');
  };

  // Premium gate
  if (!isPremium) {
    return (
      <div style={styles.premiumGate}>
        <div style={styles.premiumIcon}>💬</div>
        <h2 style={styles.premiumTitle}>Chat com Psicólogos</h2>
        <p style={styles.premiumText}>
          Converse em tempo real com psicólogos especializados em vícios e comportamentos compulsivos.
        </p>
        <p style={styles.premiumSubtext}>
          Disponível para assinantes Premium e Elite.
        </p>
        <button style={styles.upgradeButton} onClick={onUpgrade}>
          Fazer Upgrade para Premium
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Sidebar - Lista de conversas */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h3 style={styles.sidebarTitle}>Conversas</h3>
          <button 
            style={styles.newChatButton}
            onClick={() => setShowProfessionalList(true)}
          >
            + Nova
          </button>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
          </div>
        ) : conversations.length === 0 ? (
          <div style={styles.emptyState}>
            <p>Nenhuma conversa ainda</p>
            <button 
              style={styles.startButton}
              onClick={() => setShowProfessionalList(true)}
            >
              Iniciar Conversa
            </button>
          </div>
        ) : (
          <div style={styles.conversationList}>
            {conversations.map(conv => (
              <div
                key={conv.id}
                style={{
                  ...styles.conversationItem,
                  ...(selectedConversation?.id === conv.id ? styles.conversationItemActive : {})
                }}
                onClick={() => setSelectedConversation(conv)}
              >
                <div style={styles.avatar}>
                  {conv.professionalPhotoUrl ? (
                    <img src={conv.professionalPhotoUrl} alt="" style={styles.avatarImg} />
                  ) : (
                    <span>{conv.professionalName.charAt(0)}</span>
                  )}
                </div>
                <div style={styles.conversationInfo}>
                  <div style={styles.conversationHeader}>
                    <span style={styles.conversationName}>{conv.professionalName}</span>
                    {conv.lastMessageAt && (
                      <span style={styles.conversationTime}>
                        {formatDate(conv.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <div style={styles.conversationPreview}>
                    <span style={styles.specialty}>{conv.professionalSpecialty}</span>
                    {conv.lastMessage && (
                      <p style={styles.lastMessage}>{conv.lastMessage}</p>
                    )}
                  </div>
                  {conv.unreadByUser > 0 && (
                    <span style={styles.unreadBadge}>{conv.unreadByUser}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main chat area */}
      <div style={styles.chatArea}>
        {selectedConversation ? (
          <>
            {/* Chat header */}
            <div style={styles.chatHeader}>
              <div style={styles.chatHeaderInfo}>
                <div style={styles.avatar}>
                  {selectedConversation.professionalPhotoUrl ? (
                    <img src={selectedConversation.professionalPhotoUrl} alt="" style={styles.avatarImg} />
                  ) : (
                    <span>{selectedConversation.professionalName.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h4 style={styles.chatHeaderName}>{selectedConversation.professionalName}</h4>
                  <span style={styles.chatHeaderSpecialty}>{selectedConversation.professionalSpecialty}</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={styles.messagesContainer}>
              {messages.map((msg, index) => {
                const isUser = msg.senderType === 'user';
                const showDate = index === 0 || 
                  formatDate(messages[index - 1].createdAt) !== formatDate(msg.createdAt);
                
                return (
                  <React.Fragment key={msg.id}>
                    {showDate && (
                      <div style={styles.dateDivider}>
                        <span>{formatDate(msg.createdAt)}</span>
                      </div>
                    )}
                    <div style={{
                      ...styles.messageWrapper,
                      justifyContent: isUser ? 'flex-end' : 'flex-start'
                    }}>
                      <div style={{
                        ...styles.messageBubble,
                        ...(isUser ? styles.userMessage : styles.professionalMessage)
                      }}>
                        <p style={styles.messageText}>{msg.content}</p>
                        <span style={styles.messageTime}>{formatTime(msg.createdAt)}</span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div style={styles.inputArea}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Digite sua mensagem..."
                style={styles.messageInput}
                disabled={sending}
              />
              <button 
                style={{
                  ...styles.sendButton,
                  opacity: sending || !newMessage.trim() ? 0.5 : 1
                }}
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
              >
                {sending ? '...' : '➤'}
              </button>
            </div>
          </>
        ) : (
          <div style={styles.noChatSelected}>
            <div style={styles.noChatIcon}>💬</div>
            <h3>Selecione uma conversa</h3>
            <p>Ou inicie uma nova conversa com um psicólogo</p>
          </div>
        )}
      </div>

      {/* Modal - Lista de profissionais */}
      {showProfessionalList && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>Escolha um Psicólogo</h3>
              <button 
                style={styles.closeButton}
                onClick={() => setShowProfessionalList(false)}
              >
                ✕
              </button>
            </div>
            <div style={styles.professionalList}>
              {professionals.map(prof => (
                <div 
                  key={prof.id} 
                  style={styles.professionalCard}
                  onClick={() => startConversation(prof.id)}
                >
                  <div style={styles.professionalAvatar}>
                    {prof.photoUrl ? (
                      <img src={prof.photoUrl} alt="" style={styles.avatarImg} />
                    ) : (
                      <span>{prof.name.charAt(0)}</span>
                    )}
                  </div>
                  <div style={styles.professionalInfo}>
                    <h4>{prof.name}</h4>
                    <span style={styles.professionalSpecialty}>{prof.specialty}</span>
                    {prof.bio && <p style={styles.professionalBio}>{prof.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    height: '100%',
    minHeight: '500px',
    backgroundColor: '#f5f5f5',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  // Premium Gate
  premiumGate: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    textAlign: 'center',
    backgroundColor: '#fff',
    borderRadius: '12px',
    minHeight: '400px'
  },
  premiumIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  premiumTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '16px'
  },
  premiumText: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '8px',
    maxWidth: '400px'
  },
  premiumSubtext: {
    fontSize: '14px',
    color: '#999',
    marginBottom: '24px'
  },
  upgradeButton: {
    padding: '14px 32px',
    backgroundColor: '#7C3AED',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  // Sidebar
  sidebar: {
    width: '300px',
    backgroundColor: '#fff',
    borderRight: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column'
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #e0e0e0'
  },
  sidebarTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold'
  },
  newChatButton: {
    padding: '8px 16px',
    backgroundColor: '#7C3AED',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px'
  },
  spinner: {
    width: '30px',
    height: '30px',
    border: '3px solid #e0e0e0',
    borderTop: '3px solid #7C3AED',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    color: '#999'
  },
  startButton: {
    marginTop: '16px',
    padding: '10px 20px',
    backgroundColor: '#7C3AED',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  conversationList: {
    flex: 1,
    overflowY: 'auto'
  },
  conversationItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.2s'
  },
  conversationItemActive: {
    backgroundColor: '#f0e6ff'
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#7C3AED',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    marginRight: '12px',
    flexShrink: 0,
    overflow: 'hidden'
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  conversationInfo: {
    flex: 1,
    minWidth: 0,
    position: 'relative'
  },
  conversationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px'
  },
  conversationName: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#333'
  },
  conversationTime: {
    fontSize: '12px',
    color: '#999'
  },
  conversationPreview: {
    fontSize: '13px',
    color: '#666'
  },
  specialty: {
    fontSize: '12px',
    color: '#7C3AED'
  },
  lastMessage: {
    margin: '4px 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#999'
  },
  unreadBadge: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: '#7C3AED',
    color: '#fff',
    fontSize: '12px',
    padding: '2px 8px',
    borderRadius: '10px'
  },
  // Chat Area
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff'
  },
  chatHeader: {
    padding: '16px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#fff'
  },
  chatHeaderInfo: {
    display: 'flex',
    alignItems: 'center'
  },
  chatHeaderName: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold'
  },
  chatHeaderSpecialty: {
    fontSize: '13px',
    color: '#7C3AED'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    backgroundColor: '#f9f9f9'
  },
  dateDivider: {
    textAlign: 'center',
    margin: '16px 0',
    color: '#999',
    fontSize: '12px'
  },
  messageWrapper: {
    display: 'flex',
    marginBottom: '12px'
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '16px',
    position: 'relative'
  },
  userMessage: {
    backgroundColor: '#7C3AED',
    color: '#fff',
    borderBottomRightRadius: '4px'
  },
  professionalMessage: {
    backgroundColor: '#e8e8e8',
    color: '#333',
    borderBottomLeftRadius: '4px'
  },
  messageText: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.4'
  },
  messageTime: {
    fontSize: '11px',
    opacity: 0.7,
    marginTop: '4px',
    display: 'block',
    textAlign: 'right'
  },
  inputArea: {
    display: 'flex',
    padding: '16px',
    borderTop: '1px solid #e0e0e0',
    backgroundColor: '#fff'
  },
  messageInput: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #e0e0e0',
    borderRadius: '24px',
    fontSize: '14px',
    outline: 'none'
  },
  sendButton: {
    marginLeft: '8px',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#7C3AED',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  noChatSelected: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999'
  },
  noChatIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  // Modal
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '80vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e0e0e0'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#666'
  },
  professionalList: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px'
  },
  professionalCard: {
    display: 'flex',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    marginBottom: '12px',
    cursor: 'pointer',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  },
  professionalAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#7C3AED',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    marginRight: '16px',
    flexShrink: 0,
    overflow: 'hidden'
  },
  professionalInfo: {
    flex: 1
  },
  professionalSpecialty: {
    fontSize: '13px',
    color: '#7C3AED'
  },
  professionalBio: {
    fontSize: '13px',
    color: '#666',
    marginTop: '8px',
    lineHeight: '1.4'
  }
};

export default Chat;
