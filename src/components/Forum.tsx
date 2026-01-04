import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { MessageCircle, ThumbsUp, Send, Users, TrendingUp, Calendar } from "lucide-react";
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

  // Mock forum posts - will be replaced with Supabase data
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
      // Will be implemented with Supabase
      console.log("New post:", { title: newTitle, content: newContent });
      setNewTitle("");
      setNewContent("");
      setShowNewPost(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Vitória":
        return "bg-green-100 text-green-700";
      case "Dica":
        return "bg-blue-100 text-blue-700";
      case "Motivação":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Forum Header */}
      <Card className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Fórum da Comunidade</h2>
            <p className="opacity-90">Compartilhe sua jornada e apoie outros membros</p>
          </div>
          <Users className="w-12 h-12 opacity-80" />
        </div>
      </Card>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
          <p className="text-2xl font-bold">1,234</p>
          <p className="text-sm text-gray-500">Membros Ativos</p>
        </Card>
        <Card className="p-4 text-center">
          <MessageCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
          <p className="text-2xl font-bold">567</p>
          <p className="text-sm text-gray-500">Posts Hoje</p>
        </Card>
        <Card className="p-4 text-center">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-600" />
          <p className="text-2xl font-bold">89%</p>
          <p className="text-sm text-gray-500">Taxa de Sucesso</p>
        </Card>
      </div>

      {/* New Post Button */}
      {!showNewPost && (
        <Button onClick={() => setShowNewPost(true)} className="w-full" size="lg">
          <Send className="w-5 h-5 mr-2" />
          Criar Nova Postagem
        </Button>
      )}

      {/* New Post Form */}
      {showNewPost && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Nova Postagem</h3>
          <div className="space-y-4">
            <Input
              placeholder="Título da postagem..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Textarea
              placeholder="Compartilhe sua história, dicas ou peça ajuda..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={5}
            />
            <div className="flex gap-2">
              <Button onClick={handleSubmitPost}>
                <Send className="w-4 h-4 mr-2" />
                Publicar
              </Button>
              <Button variant="outline" onClick={() => setShowNewPost(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Forum Posts */}
      <div className="space-y-4">
        {mockPosts.map((post) => (
          <Card key={post.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex gap-4">
              <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {post.author.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold">{post.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium">{post.author}</span>
                      <Badge variant="secondary" className="text-xs">
                        Nível {post.authorLevel}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {post.dayCount} dias
                      </Badge>
                      <Badge className={`text-xs ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-3">{post.content}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.replies} respostas</span>
                  </button>
                  <div className="flex items-center gap-1 ml-auto">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.timestamp).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="p-5 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Este fórum atualmente usa dados de exemplo. Conecte ao Supabase
          para ter um fórum comunitário real com persistência de dados!
        </p>
      </Card>
    </div>
  );
}
