import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Loader2, Trash2, Check, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/auth/users');
            setUsers(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/auth/${id}`);
                fetchUsers();
            } catch (err) {
                alert(err.response?.data?.message || err.message);
            }
        }
    };

    return (
        <div className="animate-fade-in pb-12 text-white/90">
            <h1 className="text-3xl font-bold tracking-tight mb-8 text-white">Users</h1>

            {loading ? (
                <div className="flex justify-center items-center min-h-[40vh]">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            ) : error ? (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : (
                <Card className="overflow-hidden bg-[#18181b] border-slate-800 shadow-xl shadow-black/20">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-[#27272a]/50 hover:bg-[#27272a]/50 border-slate-800">
                                <TableHead className="w-[100px] text-slate-400">ID</TableHead>
                                <TableHead className="text-slate-400">NAME</TableHead>
                                <TableHead className="text-slate-400">EMAIL</TableHead>
                                <TableHead className="text-slate-400">ADMIN</TableHead>
                                <TableHead className="text-right text-slate-400">ACTIONS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-slate-800/80">
                            {users.map((user) => (
                                <TableRow key={user._id} className="hover:bg-slate-800/30 border-slate-800/80">
                                    <TableCell className="font-mono text-xs text-slate-500">{user._id}</TableCell>
                                    <TableCell className="font-medium text-white">{user.name}</TableCell>
                                    <TableCell>
                                        <a href={`mailto:${user.email}`} className="text-[#a78bfa] hover:underline">
                                            {user.email}
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        {user.isAdmin ? (
                                            <Check className="text-green-500" size={20} />
                                        ) : (
                                            <X className="text-red-500" size={20} />
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {!user.isAdmin && (
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                onClick={() => deleteHandler(user._id)}
                                                className="bg-transparent border-red-900/50 text-red-500 hover:bg-red-950/30 hover:text-red-400"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </div>
    );
};

export default UserList;
