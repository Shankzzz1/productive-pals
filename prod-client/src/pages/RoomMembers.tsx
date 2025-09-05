import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

interface RoomMembersProps {
  participants?: string[];
  participantUsernames?: string[];
  currentUsername?: string;
}

const RoomMembers: React.FC<RoomMembersProps> = ({ 
  participants = [],
  participantUsernames = []
}) => {
  const [memberUsernames, setMemberUsernames] = useState<string[]>([]);
  
  // Update member usernames when participants change
  useEffect(() => {
    // Use actual usernames if available, otherwise fall back to participants (socket IDs)
    if (participantUsernames.length > 0) {
      setMemberUsernames(participantUsernames);
    } else {
      setMemberUsernames(participants);
    }
  }, [participants, participantUsernames]);

  const getInitials = (name: string) => {
    // If it's a socket ID, use the first few characters
    if (name.length > 10) {
      return name.substring(0, 2).toUpperCase();
    }
    // If it's a username, use first letter of each word
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDisplayName = (name: string) => {
    // If it's a socket ID, show a shortened version
    if (name.length > 10) {
      return `User ${name.substring(0, 4)}`;
    }
    return name;
  };

  const getAvatarColor = (name: string) => {
    // Generate consistent colors based on name
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-cyan-500 to-cyan-600',
      'bg-gradient-to-br from-red-500 to-red-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Room Members ({memberUsernames.length})
        </h3>
      </div>
      
      {/* Avatar Grid */}
      <div className="flex flex-wrap gap-2">
        {memberUsernames.map((username) => (
          <Avatar 
            key={username} 
            className="h-8 w-8 hover:scale-110 transition-transform cursor-pointer"
            title={getDisplayName(username)}
          >
            <AvatarFallback className={`${getAvatarColor(username)} text-white text-xs font-medium`}>
              {getInitials(username)}
            </AvatarFallback>
          </Avatar>
        ))}
        
        {memberUsernames.length === 0 && (
          <div className="text-xs text-muted-foreground py-2">
            No members yet
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomMembers;