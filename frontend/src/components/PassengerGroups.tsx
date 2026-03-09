import { useState, useEffect } from 'react';
import { API_URL } from '../config';

interface Group {
    id: string;
    name: string;
    is_active: boolean;
    passengers: { name: string, is_on_board: boolean }[];
}

interface PassengerGroupsProps {
    onBack: () => void;
    onAddGroup: (groupId: string) => void;
}

const PassengerGroups = ({ onBack, onAddGroup }: PassengerGroupsProps) => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    const busId = 'NB-2026';

    const fetchGroups = async () => {
        try {
            const res = await fetch(`${API_URL}/groups/${busId}`);
            if (res.ok) {
                const data = await res.json();
                setGroups(data);
            }
        } catch (err) {
            console.error('Error fetching groups:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const createGroup = async () => {
        const name = prompt("Nombre del nuevo grupo:");
        if (!name) return;

        const id = Date.now().toString();
        try {
            const res = await fetch(`${API_URL}/groups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name, busId })
            });

            if (res.ok) {
                fetchGroups();
            } else {
                alert("Error al crear el grupo en el servidor");
            }
        } catch (err) {
            console.error('Error creating group:', err);
        }
    };

    const renameGroup = async (id: string, currentName: string) => {
        const newName = prompt("Nuevo nombre para el grupo:", currentName);
        if (!newName || newName === currentName) return;

        try {
            const res = await fetch(`${API_URL}/groups/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            });

            if (res.ok) {
                fetchGroups();
            }
        } catch (err) {
            console.error('Error renaming group:', err);
        }
    };

    const deleteGroup = async (id: string, name: string) => {
        if (!confirm(`¿Eliminar el grupo "${name}" y todos sus pasajeros?`)) return;

        try {
            const res = await fetch(`${API_URL}/groups/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchGroups();
            }
        } catch (err) {
            console.error('Error deleting group:', err);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-between p-6 text-slate-900 relative">
            <header className="w-full max-w-sm text-center mb-8 z-10 pt-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
                    Mis Grupos
                </h1>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">
                    GESTIÓN DE RUTAS
                </p>
            </header>

            <main className="w-full max-w-sm flex-1 z-10 space-y-4">
                {loading ? (
                    <div className="text-center py-10 opacity-50 font-bold">CARGANDO...</div>
                ) : groups.map((group: Group) => (
                    <div key={group.id} className="w-full bg-white rounded-3xl p-4 shadow-xl border border-slate-100 flex items-center justify-between group animate-pop">
                        <div className="flex-1 px-4 cursor-pointer" onClick={() => renameGroup(group.id, group.name)}>
                            <h3 className="font-black text-lg leading-tight uppercase tracking-tight group-hover:text-blue-600 transition-colors">{group.name}</h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{group.passengers?.length || 0} Pasajeros</p>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => deleteGroup(group.id, group.name)}
                                className="w-10 h-10 text-slate-300 hover:text-red-500 transition-colors flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                            <button
                                onClick={() => onAddGroup(group.id)}
                                className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                            >
                                <span className="material-symbols-outlined">add</span>
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    className="w-full py-5 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-black text-xs tracking-[0.2em] hover:bg-slate-50 hover:border-slate-900 hover:text-slate-900 transition-all active:scale-[0.98]"
                    onClick={createGroup}
                >
                    + NUEVO RECORRIDO
                </button>
            </main>

            <footer className="w-full max-w-sm pb-4 pt-6 z-10">
                <button
                    onClick={onBack}
                    className="w-full bg-slate-900 py-4 rounded-2xl text-white font-bold tracking-widest text-sm hover:bg-black active:scale-[0.98] transition-all shadow-xl shadow-black/10"
                >
                    VOLVER AL MENÚ
                </button>
            </footer>
        </div>
    );
};

export default PassengerGroups;

