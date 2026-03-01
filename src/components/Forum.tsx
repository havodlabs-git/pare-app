import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { MessageCircle, Send, Users, TrendingUp, Plus, Heart, ArrowLeft, X, Trash2, Pin } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";
import ReactMarkdown from "react-markdown";

// Componente para renderizar Markdown com estilos bonitos
const MarkdownContent = ({ content }: { content: string }) => (
  <ReactMarkdown
    components={{
      h1: ({ children }) => <h1 className="text-2xl font-bold text-foreground mb-4 mt-6">{children}</h1>,
      h2: ({ children }) => <h2 className="text-xl font-bold text-foreground mb-3 mt-5">{children}</h2>,
      h3: ({ children }) => <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">{children}</h3>,
      p: ({ children }) => <p className="text-foreground mb-4 leading-relaxed">{children}</p>,
      strong: ({ children }) => <strong className="font-bold text-primary">{children}</strong>,
      em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
      ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 ml-4">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2 ml-4">{children}</ol>,
      li: ({ children }) => <li className="text-foreground">{children}</li>,
      blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 bg-accent/30 rounded-r">
          {children}
        </blockquote>
      ),
      hr: () => <hr className="my-6 border-border" />,
      a: ({ href, children }) => (
        <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ),
    }}
  >
    {content}
  </ReactMarkdown>
);

interface Reply {
  id: string;
  author: string;
  authorId: string;
  content: string;
  timestamp: string;
}

interface ForumPost {
  id: string;
  author: string;
  authorId: string;
  authorLevel: number;
  dayCount: number;
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  likedBy: string[];
  replies: Reply[];
  category: string;
  isPinned?: boolean;
}

interface ForumStats {
  totalMembers: number;
  totalPosts: number;
  successRate: number;
}

// Helper function to map API response to component format
const mapApiPost = (apiPost: any): ForumPost => {
  return {
    id: apiPost.id,
    author: apiPost.authorName || apiPost.author || "Anônimo",
    authorId: apiPost.authorId || "",
    authorLevel: apiPost.authorLevel || 1,
    dayCount: apiPost.authorDays || 0,
    title: apiPost.title || "",
    content: apiPost.content || "",
    timestamp: apiPost.createdAt || new Date().toISOString(),
    likes: apiPost.likesCount || apiPost.likes?.length || 0,
    likedBy: apiPost.likes || [],
    replies: (apiPost.replies || []).map((r: any) => ({
      id: r.id,
      author: r.authorName || r.author || "Anônimo",
      authorId: r.authorId || "",
      content: r.content || "",
      timestamp: r.createdAt || r.timestamp || new Date().toISOString(),
    })),
    category: apiPost.category === "general" ? "Geral" : apiPost.category || "Geral",
    isPinned: apiPost.isPinned || false,
  };
};

export function Forum() {
  const toast = useToast();
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [stats, setStats] = useState<ForumStats>({ totalMembers: 0, totalPosts: 0, successRate: 0 });
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  
  // Post detail view
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [newReply, setNewReply] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Load posts and stats
  useEffect(() => {
    loadPosts();
    loadStats();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await api.getPosts();
      if (response.success && response.data) {
        const mappedPosts = response.data.map(mapApiPost);
        setPosts(mappedPosts);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("Erro ao carregar posts");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.getForumStats();
      if (response.success && response.data) {
        setStats({
          totalMembers: response.data.totalMembers || 0,
          totalPosts: response.data.totalPosts || 0,
          successRate: response.data.successRate || 0,
        });
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleSubmitPost = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Preencha o título e o conteúdo");
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.createPost({
        title: newTitle,
        content: newContent,
        category: newCategory,
      });

      if (response.success) {
        toast.success("Post criado com sucesso!");
        setNewTitle("");
        setNewContent("");
        setNewCategory("general");
        setShowNewPost(false);
        loadPosts(); // Reload posts
      } else {
        toast.error(response.message || "Erro ao criar post");
      }
    } catch (error) {
      toast.error("Erro ao criar post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      const response = await api.toggleLike(postId);
      if (response.success) {
        loadPosts(); // Reload to get updated likes
        if (selectedPost && selectedPost.id === postId) {
          // Update selected post too
          const updatedPost = await api.getPost(postId);
          if (updatedPost.success && updatedPost.data) {
            setSelectedPost(mapApiPost(updatedPost.data));
          }
        }
      }
    } catch (error) {
      toast.error("Erro ao curtir post");
    }
  };

  const handleSubmitReply = async () => {
    if (!selectedPost || !newReply.trim()) {
      toast.error("Digite uma resposta");
      return;
    }

    setReplySubmitting(true);
    try {
      const response = await api.addReply(selectedPost.id, { content: newReply });
      if (response.success) {
        toast.success("Resposta enviada!");
        setNewReply("");
        // Reload the post to get updated replies
        const updatedPost = await api.getPost(selectedPost.id);
        if (updatedPost.success && updatedPost.data) {
          setSelectedPost(mapApiPost(updatedPost.data));
        }
        loadPosts();
      } else {
        toast.error(response.message || "Erro ao enviar resposta");
      }
    } catch (error) {
      toast.error("Erro ao enviar resposta");
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (!confirm("Tem certeza que deseja deletar este post? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      const response = await api.deletePost(postId);
      if (response.success) {
        toast.success("Post deletado com sucesso!");
        setSelectedPost(null);
        loadPosts();
      } else {
        toast.error(response.message || "Erro ao deletar post");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar post");
    }
  };

  const openPostDetail = async (post: ForumPost) => {
    try {
      const response = await api.getPost(post.id);
      if (response.success && response.data) {
        setSelectedPost(mapApiPost(response.data));
      } else {
        setSelectedPost(post);
      }
    } catch (error) {
      console.error("Error loading post detail:", error);
      setSelectedPost(post);
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "general": return "Geral";
      case "victory": return "Vitória";
      case "tip": return "Dica";
      case "motivation": return "Motivação";
      default: return category;
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "Vitória":
      case "victory":
        return "bg-[#ECFDF5] text-[#10B981]";
      case "Dica":
      case "tip":
        return "bg-accent text-primary";
      case "Motivação":
      case "motivation":
        return "bg-[#F3E8FF] text-[#8B5CF6]";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

  // Post Detail View
  if (selectedPost) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => setSelectedPost(null)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Post Detail */}
        <Card className="p-6 bg-card border border-border">
          <div className="flex gap-4">
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarFallback className="bg-accent text-primary font-semibold">
                {selectedPost.author.split(" ").map(n => n[0]).join("").substring(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-semibold text-foreground">{selectedPost.author}</span>
                <span className="text-sm text-muted-foreground">Nível {selectedPost.authorLevel}</span>
                <Badge className={`text-xs ${getCategoryStyle(selectedPost.category)}`}>
                  {getCategoryLabel(selectedPost.category)}
                </Badge>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xl font-bold text-foreground">{selectedPost.title}</h2>
                {selectedPost.isPinned && (
                  <Badge className="bg-amber-100 text-amber-700 text-xs flex items-center gap-1">
                    <Pin className="w-3 h-3" />
                    Fixado
                  </Badge>
                )}
              </div>
              <div className="prose prose-sm max-w-none">
                <MarkdownContent content={selectedPost.content} />
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <button 
                  onClick={() => handleLike(selectedPost.id)}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  <span>{selectedPost.likes}</span>
                </button>
                <span className="text-sm text-muted-foreground">
                  {new Date(selectedPost.timestamp).toLocaleDateString('pt-BR')}
                </span>
                {user && selectedPost.authorId === user.id && (
                  <button 
                    onClick={() => handleDeletePost(selectedPost.id)}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors ml-auto"
                    title="Deletar post"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span className="text-sm">Deletar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Replies */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">
            Respostas ({selectedPost.replies?.length || 0})
          </h3>

          {selectedPost.replies && selectedPost.replies.length > 0 ? (
            selectedPost.replies.map((reply) => (
              <Card key={reply.id} className="p-4 bg-card border border-border">
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-secondary text-muted-foreground font-semibold text-xs">
                      {reply.author.split(" ").map(n => n[0]).join("").substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground text-sm">{reply.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(reply.timestamp).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{reply.content}</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">Nenhuma resposta ainda. Seja o primeiro!</p>
          )}

          {/* Reply Form */}
          <Card className="p-4 bg-card border border-border">
            <div className="flex gap-3">
              <Textarea
                placeholder="Escreva uma resposta..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                rows={2}
                className="flex-1 bg-secondary border-border resize-none"
              />
              <Button 
                onClick={handleSubmitReply}
                disabled={replySubmitting || !newReply.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Main Forum View
  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center bg-card border border-border">
          <Users className="w-5 h-5 mx-auto mb-2 text-primary" />
          <p className="text-xl font-bold text-foreground">{stats.totalMembers || 0}</p>
          <p className="text-xs text-muted-foreground">Membros</p>
        </Card>
        <Card className="p-4 text-center bg-card border border-border">
          <MessageCircle className="w-5 h-5 mx-auto mb-2 text-[#10B981]" />
          <p className="text-xl font-bold text-foreground">{stats.totalPosts || posts.length}</p>
          <p className="text-xs text-muted-foreground">Posts</p>
        </Card>
        <Card className="p-4 text-center bg-card border border-border">
          <TrendingUp className="w-5 h-5 mx-auto mb-2 text-[#F59E0B]" />
          <p className="text-xl font-bold text-foreground">{stats.successRate || 0}%</p>
          <p className="text-xs text-muted-foreground">Sucesso</p>
        </Card>
      </div>

      {/* New Post Button */}
      {!showNewPost && (
        <Button 
          onClick={() => setShowNewPost(true)} 
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova Publicação
        </Button>
      )}

      {/* New Post Form */}
      {showNewPost && (
        <Card className="p-6 bg-card border border-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-foreground">Nova Publicação</h3>
            <button onClick={() => setShowNewPost(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <Input
              placeholder="Título da publicação..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-12 bg-secondary border-border"
            />
            <Textarea
              placeholder="Compartilhe sua história, dicas ou peça ajuda..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={4}
              className="bg-secondary border-border resize-none"
            />
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "general", label: "Geral" },
                { value: "victory", label: "Vitória" },
                { value: "tip", label: "Dica" },
                { value: "motivation", label: "Motivação" }
              ].map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setNewCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    newCategory === cat.value 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleSubmitPost}
                disabled={submitting}
                className="flex-1 h-12 bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? "Publicando..." : "Publicar"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowNewPost(false)}
                className="h-12 border-border"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Forum Posts */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <Card className="p-8 text-center bg-card border border-border">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground mb-2">Nenhum post ainda</h3>
          <p className="text-muted-foreground">Seja o primeiro a compartilhar sua história!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card 
              key={post.id} 
              className={`p-5 bg-card border cursor-pointer hover:border-primary/50 transition-colors ${
                post.isPinned ? 'border-amber-300 bg-amber-50/30' : 'border-border'
              }`}
              onClick={() => openPostDetail(post)}
            >
              <div className="flex gap-4">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback className={`font-semibold text-sm ${
                    post.isPinned ? 'bg-amber-100 text-amber-700' : 'bg-accent text-primary'
                  }`}>
                    {post.isPinned ? <Pin className="w-5 h-5" /> : post.author.split(" ").map(n => n[0]).join("").substring(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {post.isPinned && (
                      <Badge className="bg-amber-100 text-amber-700 text-xs flex items-center gap-1">
                        <Pin className="w-3 h-3" />
                        Fixado
                      </Badge>
                    )}
                    <span className="font-semibold text-foreground">{post.author}</span>
                    <span className="text-sm text-muted-foreground">Nível {post.authorLevel}</span>
                    <Badge className={`text-xs ${getCategoryStyle(post.category)}`}>
                      {getCategoryLabel(post.category)}
                    </Badge>
                  </div>

                  <h3 className="font-medium text-foreground mb-2">{post.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {/* Remove markdown formatting for preview */}
                    {post.content.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#{1,6}\s/g, '').substring(0, 200)}
                    {post.content.length > 200 ? '...' : ''}
                  </p>

                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => handleLike(post.id, e)}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{post.replies?.length || 0}</span>
                    </span>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {new Date(post.timestamp).toLocaleDateString('pt-BR')}
                    </span>
                    {user && post.authorId === user.id && (
                      <button 
                        onClick={(e) => handleDeletePost(post.id, e)}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                        title="Deletar post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
