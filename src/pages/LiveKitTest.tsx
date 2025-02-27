import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';

export default function LiveKitTest() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Set up axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('/api/livekit/rooms', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: "Error",
        description: "Failed to fetch rooms. Please make sure you're logged in.",
        variant: "destructive"
      });
      // Redirect to login if unauthorized
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a room name",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post(`/api/livekit/room/${newRoomName}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast({
        title: "Success",
        description: "Room created successfully",
      });
      setNewRoomName('');
      fetchRooms();
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: "Failed to create room. Please make sure you're logged in.",
        variant: "destructive"
      });
      // Redirect to login if unauthorized
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (roomName: string) => {
    try {
      const response = await axios.post(`/api/livekit/token/${roomName}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const token = response.data.token;
      
      // Store token and navigate to room
      localStorage.setItem('livekitToken', token);
      navigate(`/livekit-room/${roomName}`);
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: "Error",
        description: "Failed to join room. Please make sure you're logged in.",
        variant: "destructive"
      });
      // Redirect to login if unauthorized
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const deleteRoom = async (roomName: string) => {
    try {
      await axios.delete(`/api/livekit/rooms/${roomName}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      toast({
        title: "Error",
        description: "Failed to delete room. Please make sure you're logged in.",
        variant: "destructive"
      });
      // Redirect to login if unauthorized
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">LiveKit Test Page</h1>
      
      {/* Create Room Section */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Room</h2>
        <div className="flex gap-4">
          <Input
            placeholder="Enter room name"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            className="max-w-md"
          />
          <Button onClick={createRoom} disabled={loading}>
            {loading ? 'Creating...' : 'Create Room'}
          </Button>
        </div>
      </Card>

      {/* Rooms List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Available Rooms</h2>
        <div className="space-y-4">
          {rooms.length === 0 ? (
            <p className="text-gray-500">No rooms available</p>
          ) : (
            rooms.map((room: any) => (
              <div key={room.name} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h3 className="font-medium">{room.name}</h3>
                  <p className="text-sm text-gray-400">
                    Participants: {room.numParticipants || 0}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => joinRoom(room.name)}>
                    Join Room
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => deleteRoom(room.name)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
