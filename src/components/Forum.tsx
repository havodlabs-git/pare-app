import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { MessageCircle, ThumbsUp, Send, Users, TrendingUp, Plus, Heart } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface ForumPost {
  id: string;
  author: string;
  authorLevel: number;
  dayCount: number;
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
  category: string;
}

export function Forum() {
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const mockPosts: ForumPost[] = [
    {
      id: "1",
      author: "João Silva",
      authorLevel: 8,
      dayCount: 47,
      title: "47 dias limpo! Compartilhando minha história",
      content: "Pessoal, consegui chegar aos 47 dias! Nunca pensei que conseguiria. A chave foi manter-me ocupado e ter um propósito maior. Toda vez que sentia vontade, ia correr ou lia um livro. Força a todos!",
      timestamp: "2026-01-03T10:30:00",
      likes: 24,
      replies: 8,
      category: "Vitória",
    },
    {
      id: "2",
      author: "Pedro Costa",
      authorLevel: 5,
      dayCount: 21,
      title: "Dicas para superar os primeiros dias",
      content: "Para quem está começando: os primeiros 7 dias são os mais difíceis. Mantenha-se ocupado, exercite-se, e evite ficar sozinho por muito tempo. Vocês conseguem!",
      timestamp: "2026-01-02T15:20:00",
      likes: 18,
      replies: 12,
      category: "Dica",
    },
    {
      id: "3",
      author: "Lucas Mendes",
      authorLevel: 12,
      dayCount: 120,
      title: "4 meses - A vida mudou completamente",
      content: "Estou com 120 dias e posso dizer que minha vida mudou em todos os aspectos. Mais energia, foco, confiança... Vale cada segundo de esforço. Nunca desistam!",
      timestamp: "2026-01-01T20:15:00",
      likes: 45,
      replies: 15,
      category: "Vitória",
    },
    {
      id: "4",
      author: "Rafael Santos",
      authorLevel: 3,
      dayCount: 5,
      title: "Tive uma recaída, mas não vou desistir",
      content: "Caí depois de 15 dias, mas aprendi muito. Identifiquei meus gatilhos e agora estou mais preparado. Vamos juntos nessa jornada!",
      timestamp: "2025-12-31T09:45:00",
      likes: 32,
      replies: 20,
      category: "Motivação",
    },
  ];

  const handleSubmitPost = () => {
    if (newTitle.trim() && newContent.trim()) {
      console.log("New post:", { title: newTitle, content: newContent });
      setNewTitle("");
      setNewContent("");
      setShowNewPost(false);
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "Vitória":
        return "bg-[#ECFDF5] text-[#10B981]";
      case "Dica":
        return "bg-accent text-primary";
      case "Motivação":
        return "bg-[#F3E8FF] text-[#8B5CF6]";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center bg-card border border-border">
          <Users className="w-5 h-5 mx-auto mb-2 text-primary" />
          <p className="text-xl font-bold text-foreground">1,234</p>
          <p className="text-xs text-muted-foreground">Membros</p>
        </Card>
        <Card className="p-4 text-center bg-card border border-border">
          <MessageCircle className="w-5 h-5 mx-auto mb-2 text-[#10B981]" />
          <p className="text-xl font-bold text-foreground">567</p>
          <p className="text-xs text-muted-foreground">Posts</p>
        </Card>
        <Card className="p-4 text-center bg-card border border-border">
          <TrendingUp className="w-5 h-5 mx-auto mb-2 text-[#F59E0B]" />
          <p className="text-xl font-bold text-foreground">89%</p>
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
          <h3 className="font-semibold text-foreground mb-4">Nova Publicação</h3>
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
            <div className="flex gap-3">
              <Button 
                onClick={handleSubmitPost}
                className="flex-1 h-12 bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4 mr-2" />
                Publicar
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
      <div className="space-y-4">
        {mockPosts.map((post) => (
          <Card key={post.id} className="p-5 bg-card border border-border">
            <div className="flex gap-4">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarFallback className="bg-accent text-primary font-semibold text-sm">
                  {post.author.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground">{post.author}</span>
                  <span className="text-sm text-muted-foreground">Nível {post.authorLevel}</span>
                  <Badge className={`text-xs ${getCategoryStyle(post.category)}`}>
                    {post.category}
                  </Badge>
                </div>

                <h3 className="font-medium text-foreground mb-2">{post.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{post.content}</p>

                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{post.replies}</span>
                  </button>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {new Date(post.timestamp).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
