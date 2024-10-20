import { useState} from 'react';
//import { useAccount } from 'wagmi';
import {  useScaffoldWriteContract } from "~~/hooks/scaffold-eth"; 
import { Card, CardHeader, CardContent } from '~~/components/ui/card';
import { Button } from '~~/components/ui/button';
import { Input } from '~~/components/ui/input';
import { Textarea } from '~~/components/ui/textarea';
import { MessageSquare, Heart, UserPlus, Image } from 'lucide-react';

export const SocialFiFeed = () => {
  //const { address } = useAccount();
  const [newPost, setNewPost] = useState('');
  const [mediaUri, setMediaUri] = useState('');
  const { writeContractAsync: SocialFi } = useScaffoldWriteContract("SocialFi");
  
  // Contract reads
  // const { data:data } = useScaffoldReadContract({
  //   contractName: "SocialFi",
  //   functionName: "getProfile",
  //   args: [address],
  // });

  const handleCreatePost = async () => {
    if (!newPost) return;
    try {
      await SocialFi({
        functionName: 'createPost',
        args: [newPost, mediaUri]
      });
      setNewPost('');
      setMediaUri('');
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Create Post Section */}
      <Card className="mb-6">
        <CardHeader>Create Post</CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea 
              placeholder="What's on your mind?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="w-full"
            />
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => document?.getElementById?.('media-upload')?.click()}
              >
                <Image className="h-4 w-4" />
              </Button>
              <Input 
                id="media-upload"
                type="file" 
                className="hidden"
                onChange={() => {
                  // In a real app, you'd upload to IPFS here
                  setMediaUri('/api/placeholder/400/300');
                }}
              />
              <Button 
                className="ml-auto"
                onClick={handleCreatePost}
                disabled={!newPost}
              >
                Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Post Feed */}
      <div className="space-y-4">
        <PostCard 
          username="Anonymous User"
          content="(Your posted content will be here)"
          likes={5}
          comments={2}
          timestamp={new Date().toISOString()}
        />
      </div>
    </div>
  );
};

const PostCard = ({ username, content, likes, comments, timestamp }: any) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="font-bold">{username}</div>
        <div className="text-sm text-gray-500">
          {new Date(timestamp).toLocaleDateString()}
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <p className="mb-4">{content}</p>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm">
          <Heart className="h-4 w-4 mr-2" />
          {likes}
        </Button>
        <Button variant="ghost" size="sm">
          <MessageSquare className="h-4 w-4 mr-2" />
          {comments}
        </Button>
        <Button variant="ghost" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </Button>
      </div>
    </CardContent>
  </Card>
);

//export default SocialFiFeed;