import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Hash, LogIn, AlertCircle } from 'lucide-react';
import { joinRoom } from '../lib/socket';

interface JoinFormData {
  username: string;
  roomId: string;
}

interface FormErrors {
  username?: string;
  roomId?: string;
  general?: string;
}

const JoinRoom: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<JoinFormData>({
    username: '',
    roomId: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isJoining, setIsJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  const handleInputChange = (field: keyof JoinFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[field] || errors.general) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
        general: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 2) {
      newErrors.username = 'Username must be at least 2 characters';
    } else if (formData.username.trim().length > 20) {
      newErrors.username = 'Username must be less than 20 characters';
    }

    // Room ID validation
    if (!formData.roomId.trim()) {
      newErrors.roomId = 'Room ID is required';
    } else if (formData.roomId.trim().length < 3) {
      newErrors.roomId = 'Room ID must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJoin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsJoining(true);
    
    try {
      const result = await joinRoom({
        roomId: formData.roomId.toUpperCase(),
        username: formData.username.trim()
      });
      
      if (result.ok) {
        // Store room info for the timer
        localStorage.setItem('roomId', formData.roomId.toUpperCase());
        localStorage.setItem('username', formData.username.trim());
        
        setJoinSuccess(true);
        
        // Navigate to /collect after a brief delay
        setTimeout(() => {
          navigate('/collect', { 
            state: { 
              roomId: formData.roomId.toUpperCase(), 
              username: formData.username.trim() 
            } 
          });
        }, 1500);
      } else {
        setErrors({
          general: result.error || 'Room not found. Please check the Room ID and try again.'
        });
      }
      
    } catch (error: any) {
      console.error('Error joining room:', error);
      setErrors({
        general: error.message || 'Failed to join room. Please try again.'
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isJoining) {
      handleJoin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <LogIn className="w-6 h-6" />
            Join Pomodoro Room
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your details to join an existing focus session
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {joinSuccess && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                Successfully joined the room! 🎉
              </AlertDescription>
            </Alert>
          )}

          {errors.general && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-red-800">
                {errors.general}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="join-username" className="flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4" />
                Username / Display Name *
              </Label>
              <Input
                id="join-username"
                type="text"
                placeholder="Enter your display name"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onKeyPress={handleKeyPress}
                className={errors.username ? 'border-red-500 focus:border-red-500' : ''}
                disabled={isJoining}
              />
              {errors.username && (
                <p className="text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* Room ID Field */}
            <div className="space-y-2">
              <Label htmlFor="join-roomId" className="flex items-center gap-2 text-sm font-medium">
                <Hash className="w-4 h-4" />
                Room ID *
              </Label>
              <Input
                id="join-roomId"
                type="text"
                placeholder="Enter room ID (e.g., ABC123)"
                value={formData.roomId}
                onChange={(e) => handleInputChange('roomId', e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className={errors.roomId ? 'border-red-500 focus:border-red-500' : ''}
                disabled={isJoining}
                style={{ textTransform: 'uppercase' }}
              />
              {errors.roomId && (
                <p className="text-sm text-red-600">{errors.roomId}</p>
              )}
              <p className="text-xs text-gray-500">
                Get the Room ID from the room creator
              </p>
            </div>

            {/* Join Button */}
            <Button
              onClick={handleJoin}
              className="w-full bg-black hover:bg-gray-800 text-white"
              disabled={isJoining}
            >
              {isJoining ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Joining Room...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Join Room
                </div>
              )}
            </Button>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              * Required fields • Press Enter to join
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinRoom;