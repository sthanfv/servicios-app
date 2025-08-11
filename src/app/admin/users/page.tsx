'use client';
import { useState, useEffect } from 'react';
import { db } from '@/services/firebase';
import { collection, onSnapshot, doc, deleteDoc, orderBy, query, updateDoc, Timestamp } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface User {
    id: string;
    displayName: string;
    email: string;
    role: string;
    createdAt: Timestamp;
    verified?: boolean;
}

export default function ManageUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setUsers(usersData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los usuarios.' });
            setLoading(false);
        });
        return () => unsubscribe();
    }, [toast]);

    const handleDelete = async (userId: string) => {
        setIsDeleting(userId);
        try {
            await deleteDoc(doc(db, 'users', userId));
            toast({ title: 'Éxito', description: 'Documento de usuario eliminado.' });
        } catch (error) {
            console.error('Error deleting user:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar el usuario.' });
        } finally {
            setIsDeleting(null);
        }
    };
    
    const toggleVerification = async (userId: string, currentStatus: boolean) => {
        const userRef = doc(db, 'users', userId);
        try {
            await updateDoc(userRef, { verified: !currentStatus });
            toast({ title: 'Éxito', description: `Usuario ${!currentStatus ? 'verificado' : 'no verificado'}.` });
        } catch (e) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar el estado de verificación.' });
        }
    }


    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin" /></div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Gestionar Usuarios</h2>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Verificado</TableHead>
                            <TableHead>Fecha de Registro</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {user.displayName}
                                        {user.verified && <ShieldCheck className="h-5 w-5 text-blue-500" />}
                                    </div>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Switch
                                        checked={!!user.verified}
                                        onCheckedChange={() => toggleVerification(user.id, user.verified || false)}
                                        aria-label="Verificar usuario"
                                     />
                                </TableCell>
                                <TableCell>{new Date(user.createdAt?.toDate()).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                             <Button variant="destructive" size="icon" disabled={isDeleting === user.id}>
                                                 {isDeleting === user.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta acción eliminará el documento del usuario de Firestore, pero no eliminará la cuenta de autenticación. Para una eliminación completa se requiere una Cloud Function.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(user.id)}>Sí, eliminar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             {users.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">No se encontraron usuarios.</div>
            )}
        </div>
    );
}
