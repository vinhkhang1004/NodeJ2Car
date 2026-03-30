import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Loader2, Trash2, Edit, Plus } from 'lucide-react';
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

const PartList = () => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const fetchParts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/parts');
            setParts(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParts();
    }, []);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this part?')) {
            try {
                await api.delete(`/parts/${id}`);
                fetchParts();
            } catch (err) {
                alert(err.response?.data?.message || err.message);
            }
        }
    };

    const createPartHandler = () => {
        navigate('/admin/part/create');
    };

    return (
        <div className="animate-fade-in pb-12 text-white/90">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white">Inventory Items</h1>
                <Button onClick={createPartHandler} className="bg-white text-black hover:bg-slate-200">
                    <Plus className="mr-2 h-4 w-4" /> Create Part
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center min-h-[40vh]">
                    <Loader2 className="animate-spin text-white" size={48} />
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
                                <TableHead className="text-slate-400">PRICE</TableHead>
                                <TableHead className="text-slate-400">CATEGORY</TableHead>
                                <TableHead className="text-slate-400">BRAND</TableHead>
                                <TableHead className="text-slate-400">STATUS</TableHead>
                                <TableHead className="text-right text-slate-400">ACTIONS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-slate-800/80">
                            {parts.map((part) => (
                                <TableRow key={part._id} className="hover:bg-slate-800/30 border-slate-800/80">
                                    <TableCell className="font-mono text-xs text-slate-500">{part._id}</TableCell>
                                    <TableCell className="font-medium text-white">{part.name}</TableCell>
                                    <TableCell className="text-white font-mono">${part.price.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <span className="px-2.5 py-1 rounded-full border border-slate-700 text-xs text-slate-400">{part.category}</span>
                                    </TableCell>
                                    <TableCell className="text-white">{part.brand}</TableCell>
                                    <TableCell>
                                        {part.stock > 0 ? (
                                            <span className="flex items-center text-green-400 text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span> Done ({part.stock})</span>
                                        ) : (
                                            <span className="flex items-center text-slate-400 text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-slate-500 mr-2"></span> In Process</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                onClick={() => navigate(`/admin/part/${part._id}/edit`)}
                                                className="bg-transparent border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                onClick={() => deleteHandler(part._id)}
                                                className="bg-transparent border-red-900/50 text-red-500 hover:bg-red-950/30 hover:text-red-400"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
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

export default PartList;
