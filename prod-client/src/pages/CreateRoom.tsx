import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Hash, Clock, Shuffle } from 'lucide-react';
import { createRoomHTTP } from '../lib/roomAPI';

interface FormData {
  username: string;
  roomName: string;
  pomoDuration: number;
}

interface FormErrors {
  username?: string;
  roomName?: string;
  pomoDuration?: string;
  general?: string;
}

const CreateRoom: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    roomName: '',
    pomoDuration: 25
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate a random room ID
  const generateRoomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
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

    // Pomodoro duration validation
    if (formData.pomoDuration < 5) {
      newErrors.pomoDuration = 'Duration must be at least 5 minutes';
    } else if (formData.pomoDuration > 60) {
      newErrors.pomoDuration = 'Duration must be less than 60 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const roomId = formData.roomName.trim() || generateRoomId();
      const duration = formData.pomoDuration * 60; // convert to seconds
      
      const result = await createRoomHTTP({
        roomId,
        username: formData.username.trim(),
        duration
      });
      
      if (result.ok) {
        // Store room info for the timer
        localStorage.setItem('roomId', roomId);
        localStorage.setItem('username', formData.username.trim());
        
        // Navigate to /collect immediately after success
        navigate('/collect', { 
          state: { 
            roomId, 
            username: formData.username.trim() 
          } 
        });
      } else {
        setErrors({ general: result.error || 'Failed to create room' });
      }
      
    } catch (error: any) {
      console.error('Error creating room:', error);
      setErrors({ general: error.message || 'Failed to create room' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateRoomId = () => {
    setFormData(prev => ({
      ...prev,
      roomName: generateRoomId()
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Create Pomodoro Room
          </CardTitle>
          <CardDescription className="text-gray-600">
            Set up your collaborative focus session
          </CardDescription>
        </CardHeader>
        
        <CardContent>

          {errors.general && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {errors.general}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4" />
                Username / Display Name *
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your display name"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={errors.username ? 'border-red-500 focus:border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.username && (
                <p className="text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* Room Name Field */}
            <div className="space-y-2">
              <Label htmlFor="roomName" className="flex items-center gap-2 text-sm font-medium">
                <Hash className="w-4 h-4" />
                Room Name / ID
                <span className="text-xs text-gray-500">(optional)</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="roomName"
                  type="text"
                  placeholder="Leave empty for auto-generated ID"
                  value={formData.roomName}
                  onChange={(e) => handleInputChange('roomName', e.target.value)}
                  className={errors.roomName ? 'border-red-500 focus:border-red-500' : ''}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleGenerateRoomId}
                  disabled={isSubmitting}
                  title="Generate random room ID"
                >
                  <Shuffle className="w-4 h-4" />
                </Button>
              </div>
              {errors.roomName && (
                <p className="text-sm text-red-600">{errors.roomName}</p>
              )}
              <p className="text-xs text-gray-500">
                Leave empty to auto-generate a unique room ID
              </p>
            </div>

            {/* Pomodoro Duration Field */}
            <div className="space-y-2">
              <Label htmlFor="pomoDuration" className="flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4" />
                Pomodoro Duration
                <span className="text-xs text-gray-500">(optional)</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="pomoDuration"
                  type="number"
                  min="5"
                  max="60"
                  value={formData.pomoDuration}
                  onChange={(e) => handleInputChange('pomoDuration', parseInt(e.target.value) || 25)}
                  className={`w-20 ${errors.pomoDuration ? 'border-red-500 focus:border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-600">minutes</span>
              </div>
              {errors.pomoDuration && (
                <p className="text-sm text-red-600">{errors.pomoDuration}</p>
              )}
              <p className="text-xs text-gray-500">
                Default: 25 minutes (5-60 minutes allowed)
              </p>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              className="w-full bg-black hover:bg-gray-800 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Room...
                </div>
              ) : (
                'Create Pomodoro Room'
              )}
            </Button>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              * Required fields
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateRoom;