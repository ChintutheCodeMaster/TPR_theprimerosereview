import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface ConversationItemProps {
  id: string;
  studentName: string;
  studentAvatar?: string;
  parentName?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'urgent' | 'archived';
  tags: string[];
  isSelected: boolean;
  onClick: () => void;
}

export const ConversationItem = ({
  studentName,
  studentAvatar,
  parentName,
  lastMessage,
  lastMessageTime,
  unreadCount,
  status,
  tags,
  isSelected,
  onClick
}: ConversationItemProps) => {
  return (
    <div
      className={`p-4 hover:bg-muted/50 cursor-pointer border-l-4 transition-colors ${
        isSelected 
          ? 'bg-muted border-l-primary' 
          : status === 'urgent' 
            ? 'border-l-destructive' 
            : 'border-l-transparent'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={studentAvatar} alt={studentName} />
          <AvatarFallback className="bg-gradient-secondary text-secondary-foreground">
            {studentName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground truncate">
                {studentName}
              </p>
              {parentName && (
                <p className="text-xs text-muted-foreground">
                  & {parentName}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
              {status === 'urgent' && (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              )}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground truncate mt-1">
            {lastMessage}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              {lastMessageTime}
            </p>
            <div className="flex gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
