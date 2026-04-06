
import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, X, Move } from 'lucide-react';
import { VisionBoardQuestion } from '@/types/onboarding';
import { Button } from '@/components/ui/button';
import { motion, useDragControls } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface VisionBoardQuestionProps {
  question: VisionBoardQuestion;
  value: any;
  onChange: (value: any) => void;
}

interface PostIt {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  category?: string;
  created: boolean;
}

// Enhanced Post-it Note Colors
const postItColors = [
  '#8B5CF6', // Vivid Purple
  '#D946EF', // Magenta Pink
  '#F97316', // Bright Orange
  '#FEC6A1', // Soft Peach
  '#E5DEFF', // Soft Lavender
  '#FEF7CD', // Soft Yellow
  '#F2FCE2', // Soft Green
  '#FFDEE2', // Soft Pink
  '#D3E4FD', // Soft Blue
];

export const VisionBoardQuestionInput: React.FC<VisionBoardQuestionProps> = ({
  question,
  value = [],
  onChange,
}) => {
  const [postIts, setPostIts] = useState<PostIt[]>(value || []);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPostItText, setNewPostItText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Update parent component state when postIts change, but only when it actually changed
  // and not during component initialization
  useEffect(() => {
    // Only update parent if postIts has changed and is different from value
    const hasChanges = JSON.stringify(postIts) !== JSON.stringify(value);
    if (hasChanges && postIts.length > 0) {
      onChange(postIts);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postIts]); // Only depend on postIts state

  // Focus on the text input when creating a new post-it
  useEffect(() => {
    if (isCreatingNew && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreatingNew]);

  const addNewPostIt = (categoryId?: string) => {
    setIsCreatingNew(true);
    setSelectedCategory(categoryId || null);
    
    // Get color based on category or random
    let color = '';
    if (categoryId && question.categories) {
      const category = question.categories.find(cat => cat.id === categoryId);
      color = category?.color || postItColors[Math.floor(Math.random() * postItColors.length)];
    } else {
      color = postItColors[Math.floor(Math.random() * postItColors.length)];
    }
    
    // Position the new post-it in the center of the board
    const containerWidth = containerRef.current?.offsetWidth || 600;
    const containerHeight = containerRef.current?.offsetHeight || 400;
    
    const newPostIt: PostIt = {
      id: Date.now().toString(),
      text: '',
      x: containerWidth / 2 - 100, // Center the post-it
      y: containerHeight / 2 - 100,
      color: color,
      category: categoryId,
      created: false, // Mark as not fully created yet
    };
    
    setPostIts([...postIts, newPostIt]);
    setNewPostItText('');
  };

  const confirmNewPostIt = () => {
    if (newPostItText.trim()) {
      setPostIts(postIts.map(postIt => 
        postIt.created === false
          ? { ...postIt, text: newPostItText, created: true }
          : postIt
      ));
      setIsCreatingNew(false);
      setNewPostItText('');
      setSelectedCategory(null);
    } else {
      // If text is empty, remove the post-it
      setPostIts(postIts.filter(postIt => postIt.created !== false));
      setIsCreatingNew(false);
      setSelectedCategory(null);
    }
  };

  const removePostIt = (id: string) => {
    setPostIts(postIts.filter(postIt => postIt.id !== id));
  };

  const updatePostItPosition = (id: string, x: number, y: number) => {
    setPostIts(postIts.map(postIt => 
      postIt.id === id
        ? { ...postIt, x, y }
        : postIt
    ));
  };

  const getPostItsByCategory = (categoryId: string) => {
    return postIts.filter(postIt => postIt.created && postIt.category === categoryId).length;
  };

  const getUncategorizedPostIts = () => {
    return postIts.filter(postIt => postIt.created && !postIt.category).length;
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-neutral-600 mb-2">
        {question.description}
      </div>
      
      {/* Category buttons */}
      {question.categories && (
        <div className="flex flex-wrap gap-2 mb-4">
          {question.categories.map((category) => (
            <Button
              key={category.id}
              type="button"
              onClick={() => addNewPostIt(category.id)}
              disabled={isCreatingNew}
              className="flex items-center gap-2 px-3 py-1.5 h-auto text-white"
              style={{ backgroundColor: category.color }}
            >
              <PlusCircle className="w-4 h-4" />
              {category.name}
              <Badge variant="secondary" className="ml-1 bg-white/20 text-white">
                {getPostItsByCategory(category.id)}
              </Badge>
            </Button>
          ))}
          
          <Button
            type="button"
            onClick={() => addNewPostIt()}
            disabled={isCreatingNew}
            className="flex items-center gap-2"
            variant="outline"
          >
            <PlusCircle className="w-4 h-4" />
            Custom Goal
            <Badge variant="outline" className="ml-1">
              {getUncategorizedPostIts()}
            </Badge>
          </Button>
        </div>
      )}
      
      <div 
        ref={containerRef}
        className="relative w-full h-[500px] bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-200 overflow-hidden"
        style={{ 
          backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2UwZTBlMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')",
          backgroundSize: '40px 40px'
        }}
      >
        {/* Render all created post-its */}
        {postIts.map(postIt => (
          <PostItNote
            key={postIt.id}
            postIt={postIt}
            isEditing={!postIt.created && isCreatingNew}
            onTextChange={setNewPostItText}
            onConfirm={confirmNewPostIt}
            onPositionChange={(x, y) => updatePostItPosition(postIt.id, x, y)}
            onRemove={() => removePostIt(postIt.id)}
            inputRef={!postIt.created ? inputRef : undefined}
            categoryName={
              postIt.category && question.categories 
                ? question.categories.find(cat => cat.id === postIt.category)?.name 
                : undefined
            }
          />
        ))}
      </div>
      
      <div className="flex justify-between items-center">
        {!question.categories && (
          <Button
            type="button"
            onClick={() => addNewPostIt()}
            disabled={isCreatingNew}
            className="flex items-center gap-2"
            variant="outline"
          >
            <PlusCircle className="w-4 h-4" />
            Add Career Goal
          </Button>
        )}
        
        <Badge variant="outline" className="px-3 py-1 ml-auto">
          {postIts.filter(p => p.created).length} goals added
        </Badge>
      </div>
    </div>
  );
};

interface PostItProps {
  postIt: PostIt;
  isEditing: boolean;
  onTextChange: (text: string) => void;
  onConfirm: () => void;
  onPositionChange: (x: number, y: number) => void;
  onRemove: () => void;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
  categoryName?: string;
}

const PostItNote: React.FC<PostItProps> = ({
  postIt,
  isEditing,
  onTextChange,
  onConfirm,
  onPositionChange,
  onRemove,
  inputRef,
  categoryName,
}) => {
  const dragControls = useDragControls();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle text area submission with Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onConfirm();
    }
  };

  return (
    <motion.div
      drag={!isEditing}
      dragControls={dragControls}
      dragMomentum={false}
      initial={{ x: postIt.x, y: postIt.y, opacity: 0, scale: 0.9 }}
      animate={{ x: postIt.x, y: postIt.y, opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onDragEnd={(_, info) => {
        onPositionChange(postIt.x + info.offset.x, postIt.y + info.offset.y);
      }}
      className="absolute w-[200px] h-auto"
      style={{ x: postIt.x, y: postIt.y, touchAction: "none" }}
    >
      <div 
        className="rounded-md shadow-lg overflow-hidden transform rotate-[1deg] p-4 pb-6 flex flex-col"
        style={{ 
          backgroundColor: postIt.color,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%)"
        }}
      >
        {categoryName && (
          <div className="text-xs font-semibold text-white/90 mb-1 px-1 py-0.5 bg-black/10 rounded self-start">
            {categoryName}
          </div>
        )}
        
        <div className="flex justify-between items-start mb-2">
          {!isEditing && (
            <div 
              className="cursor-move p-1 rounded-full hover:bg-white/20"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <Move className="w-4 h-4 text-neutral-700" />
            </div>
          )}
          
          <button 
            onClick={onRemove}
            className="ml-auto p-1 rounded-full hover:bg-white/20"
            aria-label="Remove post-it"
          >
            <X className="w-4 h-4 text-neutral-700" />
          </button>
        </div>
        
        {isEditing ? (
          <textarea
            ref={inputRef}
            className="bg-transparent border-none resize-none w-full focus:outline-none focus:ring-0 placeholder-neutral-500/50 min-h-[100px]"
            placeholder="Type your career goal here..."
            onChange={(e) => onTextChange(e.target.value)}
            onBlur={onConfirm}
            onKeyDown={handleKeyDown}
            style={{ fontFamily: "'Kalam', cursive" }}
          />
        ) : (
          <p 
            className="px-2 py-1 whitespace-pre-wrap break-words text-neutral-800"
            style={{ fontFamily: "'Kalam', cursive" }}
          >
            {postIt.text}
          </p>
        )}
      </div>
    </motion.div>
  );
};
