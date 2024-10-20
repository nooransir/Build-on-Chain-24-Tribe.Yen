import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { Card, CardHeader, CardContent } from '~~/components/ui/card';
import { Button } from '~~/components/ui/button';
import { Input } from '~~/components/ui/input';
import { Textarea } from '~~/components/ui/textarea';
import { Camera } from 'lucide-react';

interface ProfileFormData {
  username: string;
  bio: string;
  avatarUri: string;
}

export const Profile = () => {
  const { address } = useAccount();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    username: '',
    bio: '',
    avatarUri: '',
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletId, setWalletId] = useState('');
  const [password, setPassword] = useState('');

  // Contract reads
  const { data: profile } = useScaffoldReadContract({
    contractName: "SocialFi",
    functionName: "getProfile",
    args: [address],
  });

  // Contract writes
  const { writeContractAsync: createProfile, isPending: isCreating } = useScaffoldWriteContract("SocialFi");
  const { writeContractAsync: updateProfile, isPending: isUpdating } = useScaffoldWriteContract("SocialFi");

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        bio: profile.bio || '',
        avatarUri: profile.avatarUri || '',
      });
    }
  }, [profile]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (walletId || address) {
      // Simulate login success if wallet ID is entered
      setIsLoggedIn(true);
    } else {
      alert('Please enter a valid Wallet ID to log in');
    }
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (profile?.isCreated) {
        const result = await updateProfile({
          functionName: "updateProfile",
          args: [formData.username, formData.bio, formData.avatarUri],
        });
        if (result) {
          notification.success("Profile updated successfully!");
          setEditing(false);
        }
      } else {
        const result = await createProfile({
          functionName: "createProfile",
          args: [formData.username, formData.bio, formData.avatarUri],
        });
        if (result) {
          notification.success("Profile created successfully!");
          setEditing(false);
        }
      }
    } catch (error) {
      console.error("Error handling profile:", error);
      notification.error("Failed to save profile");
    }
  };

  const handleFileUpload = async () => {
    try {
      // Simulate file upload, replace with actual IPFS upload logic
      setFormData(prev => ({
        ...prev,
        avatarUri: '/api/placeholder/100/100'
      }));
    } catch (error) {
      console.error("Error uploading file:", error);
      notification.error("Failed to upload image");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <h2>Login</h2>
        <p>Please enter your Wallet ID and password to log in.</p>
        <form onSubmit={handleLoginSubmit}>
          <div>
            <label>
              Wallet ID:
              <Input
                type="text"
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                required
              />
            </label>
          </div>
          <div>
            <label>
              Password:
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
          </div>
          <Button type="submit">Login</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Profile</h2>
            {profile?.isCreated && !editing && (
              <Button onClick={() => setEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {(editing || !profile?.isCreated) ? (
            <form onSubmit={handleSubmitProfile} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={formData.avatarUri || "/api/placeholder/100/100"}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute bottom-0 right-0"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Input
                    id="avatar-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload();
                      }
                    }}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      username: e.target.value
                    }))}
                    className="mb-2"
                    maxLength={50}
                    required
                  />
                  <Textarea
                    placeholder="Bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      bio: e.target.value
                    }))}
                    maxLength={200}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                {editing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      if (profile) {
                        setFormData({
                          username: profile.username || '',
                          bio: profile.bio || '',
                          avatarUri: profile.avatarUri || '',
                        });
                      }
                    }}
                    disabled={isUpdating || isCreating}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isUpdating || isCreating}
                >
                  {profile?.isCreated ? 
                    (isUpdating ? 'Updating...' : 'Update Profile') : 
                    (isCreating ? 'Creating...' : 'Create Profile')}
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-start gap-4">
              <img
                src={profile.avatarUri || "/api/placeholder/100/100"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-bold">{profile.username}</h3>
                <p className="text-gray-600 mt-2">{profile.bio}</p>
                <div className="flex gap-4 mt-4">
                  <div>
                    <div className="font-bold">{profile.postCount?.toString() || '0'}</div>
                    <div className="text-sm text-gray-500">Posts</div>
                  </div>
                  <div>
                    <div className="font-bold">{profile.followerCount?.toString() || '0'}</div>
                    <div className="text-sm text-gray-500">Followers</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
