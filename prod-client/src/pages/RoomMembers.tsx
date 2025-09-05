import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, UserPlus } from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface RoomMembersProps {
  users?: User[];
  onUserJoin?: (user: User) => void;
}

const RoomMembers: React.FC<RoomMembersProps> = ({ 
  users = [], 
  onUserJoin 
}) => {
  const [members, setMembers] = useState<User[]>(users);
  
  // Mock function to simulate a user joining
  const simulateUserJoin = () => {
    const mockUsers = [
      { name: 'Alice Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
      { name: 'Bob Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
      { name: 'Carol Davis', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol' },
      { name: 'David Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
      { name: 'Emma Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
    ];
    
    const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: randomUser.name,
      avatar: randomUser.avatar,
    };
    
    setMembers(prev => [newUser, ...prev]);
    onUserJoin?.(newUser);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Room Members ({members.length})
        </h3>
        <Button 
          onClick={simulateUserJoin}
          size="sm"
          variant="ghost"
          className="h-6 px-2"
        >
          <UserPlus className="h-3 w-3" />
        </Button>
      </div>
      
      {/* Avatar Grid */}
      <div className="flex flex-wrap gap-2">
        {members.map((user) => (
          <Avatar 
            key={user.id} 
            className="h-8 w-8 hover:scale-110 transition-transform cursor-pointer"
            title={user.name}
          >
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        ))}
        
        {members.length === 0 && (
          <div className="text-xs text-muted-foreground py-2">
            No members yet
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomMembers;