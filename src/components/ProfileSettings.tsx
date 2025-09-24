import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Save, Loader2 } from 'lucide-react';

interface ProfileSettingsProps {
  onClose?: () => void;
}

export function ProfileSettings({ onClose }: ProfileSettingsProps) {
  const { profile, loading, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: profile?.display_name || '',
    ingameName: profile?.ingame_name || '',
    bio: profile?.bio || '',
    avatarUrl: profile?.avatar_url || '',
  });

  // Update formData when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.display_name || '',
        ingameName: profile.ingame_name || '',
        bio: profile.bio || '',
        avatarUrl: profile.avatar_url || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await updateProfile({
      display_name: formData.displayName,
      ingame_name: formData.ingameName,
      bio: formData.bio,
      avatar_url: formData.avatarUrl,
    });
    
    if (success) {
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setFormData({
      displayName: profile?.display_name || '',
      ingameName: profile?.ingame_name || '',
      bio: profile?.bio || '',
      avatarUrl: profile?.avatar_url || '',
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading profile...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Settings
          </CardTitle>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit Profile
              </Button>
            ) : (
              <>
                <Button onClick={handleCancel} variant="outline">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>
        
        {/* Profile Avatar and Basic Info */}
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="text-lg">
              {profile?.display_name?.[0]?.toUpperCase() || profile?.ingame_name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              {profile?.display_name || 'Unknown User'}
            </h3>
            <div className="flex gap-2">
              {profile?.ingame_name && (
                <Badge variant="outline">IGN: {profile.ingame_name}</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="How others see your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ingameName">Minecraft IGN</Label>
              <Input
                id="ingameName"
                value={formData.ingameName}
                onChange={(e) => setFormData(prev => ({ ...prev, ingameName: e.target.value }))}
                placeholder="Your Hypixel Skyblock username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                value={formData.avatarUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell others about yourself..."
                rows={3}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Display Name</Label>
              <p className="text-lg">{profile?.display_name || 'Not set'}</p>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Minecraft IGN</Label>
              <p className="text-lg">{profile?.ingame_name || 'Not set'}</p>
            </div>

            {profile?.bio && (
              <div>
                <Label className="text-sm text-muted-foreground">Bio</Label>
                <p className="text-base leading-relaxed">{profile.bio}</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <Label className="text-xs">Member since</Label>
                  <p>{new Date(profile?.created_at || '').toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-xs">Last updated</Label>
                  <p>{new Date(profile?.updated_at || '').toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}