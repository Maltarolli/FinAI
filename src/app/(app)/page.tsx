"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Loader2, Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  base64Image?: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá! Sou seu assistente financeiro. Me conte sobre um gasto, ou me mande a foto de um recibo/nota fiscal para eu registrar!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, selectedImage]);

  const handleImagePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: "user", 
      content: input || "Aqui está um recibo/nota.", 
      base64Image: selectedImage || undefined 
    };
    
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setSelectedImage(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Enviando todo o histórico para a IA ter memória multinível (contexto)
        body: JSON.stringify({ messages: newMessages }), 
      });

      const data = await res.json();
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "Ocorreu um erro ao processar a resposta da IA."
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Oops! Tive um problema de conexão com a API. Tente novamente."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      <header className="flex items-center gap-4 px-6 py-4 bg-white/40 dark:bg-black/20 backdrop-blur-2xl border-b border-white/20 dark:border-white/10 z-10 sticky top-0 shadow-sm shadow-black/5">
        <motion.div 
          initial={{ rotate: -10, scale: 0.8 }} 
          animate={{ rotate: 0, scale: 1 }} 
          className="bg-gradient-to-tr from-[#00a884] to-emerald-400 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/20 flex-shrink-0"
        >
          <Bot size={24} className="text-white" />
        </motion.div>
        <div>
          <h1 className="font-extrabold text-lg leading-tight text-foreground/90 tracking-tight">FinAI Assistant</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Com Visão Foto/Recibos</p>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 pt-8 scroll-smooth pb-[120px] md:pb-8">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={cn(
                "flex w-full",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] md:max-w-[60%] px-5 py-3.5 text-[15px] leading-relaxed shadow-xl shadow-black/5 relative backdrop-blur-xl border border-white/20 dark:border-white/10 flex flex-col gap-3",
                  msg.role === "user" 
                    ? "bg-gradient-to-br from-[#00a884] to-emerald-600 text-white rounded-3xl rounded-tr-sm" 
                    : "bg-white/60 dark:bg-[#1a2228]/60 text-foreground/90 rounded-3xl rounded-tl-sm"
                )}
              >
                {msg.base64Image && (
                  <img src={msg.base64Image} alt="Anexo Original" className="rounded-xl w-full max-h-64 object-cover" />
                )}
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="flex w-full justify-start"
            >
              <div className="bg-white/60 dark:bg-[#1a2228]/60 backdrop-blur-xl border border-white/20 dark:border-white/10 text-foreground px-5 py-3.5 rounded-3xl rounded-tl-sm shadow-xl shadow-black/5 flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                <motion.span 
                  animate={{ opacity: [0.4, 1, 0.4] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-sm font-medium text-muted-foreground"
                >
                  Analisando contexto...
                </motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-white/40 dark:bg-black/20 backdrop-blur-2xl border-t border-white/20 dark:border-white/10 p-3 md:p-4 z-20 w-full flex flex-col items-center shrink-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-4xl w-full relative z-10">
          <AnimatePresence>
            {selectedImage && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                className="relative self-start mt-[-70px] bg-white/40 dark:bg-black/40 backdrop-blur-3xl p-2 rounded-2xl border border-white/30 dark:border-white/10 shadow-2xl"
              >
                <img src={selectedImage} alt="Preview" className="h-20 w-auto rounded-xl object-cover" />
                <button 
                  type="button" 
                  onClick={() => { setSelectedImage(null); if(fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:scale-110"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 items-end w-full">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImagePicker} 
            />
            
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-full flex-shrink-0 transition-all bg-white/50 dark:bg-white/5 text-muted-foreground/80 hover:text-foreground shadow-sm border border-white/30 dark:border-white/10"
            >
              <Camera className="w-6 h-6 stroke-[2.5]" />
            </motion.button>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite, cole um valor, ou anexe uma nota..."
              className="flex-1 max-h-32 min-h-[56px] bg-white/60 dark:bg-white/5 text-foreground border border-white/40 dark:border-white/10 focus:ring-2 focus:ring-[#00a884] focus:border-transparent focus:outline-none rounded-3xl px-5 py-4 resize-none shadow-inner backdrop-blur-md transition-all placeholder:text-muted-foreground/60 font-medium leading-tight"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              type="submit" 
              disabled={(!input.trim() && !selectedImage) || isLoading}
              className={cn(
                "p-4 rounded-full flex-shrink-0 transition-all shadow-lg",
                (input.trim() || selectedImage) && !isLoading 
                  ? "bg-gradient-to-r from-[#00a884] to-emerald-500 text-white shadow-emerald-500/20" 
                  : "bg-white/50 dark:bg-white/5 text-muted-foreground/50 shadow-none border border-white/20 dark:border-white/5"
              )}
            >
              <Send className="w-6 h-6 ml-0.5" />
            </motion.button>
          </div>
        </form>
        {/* Espaçador flexível exclusivo para mobile que "estica" o campo de vidro para terminar abaixo da BottomNav */}
        <div className="h-[76px] md:hidden shrink-0 w-full pb-safe" />
      </div>
    </div>
  );
}
