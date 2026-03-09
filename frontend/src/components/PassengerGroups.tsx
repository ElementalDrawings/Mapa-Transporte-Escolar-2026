import { useState, useEffect } from 'react';
import { API_URL } from '../config';

interface Group {
    id: string;
    name: string;
    is_active: boolean; // Changed from isActive to match DB
    passengers: { name: string, is_on_board: boolean }[];
}

interface PassengerGroupsProps {
    onBack: () => void;
    onAddGroup: (groupId: string) => void;
}

const PassengerGroups = ({ onBack, onAddGroup }: PassengerGroupsProps) => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    const busId = 'NB-2026'; // Hardcoded for PoC as per existing code

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

    return (
        <div className="min-h-screen flex flex-col items-center justify-between p-6 text-slate-900 relative">
            <header className="w-full max-w-sm text-center mb-8 z-10 pt-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
                    Mis Grupos
                </h1>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">
                    GESTIÓN
                </p>
            </header>

            <main className="w-full max-w-sm flex-1 z-10 space-y-4">
                {loading ? (
                    <div className="text-center py-10 opacity-50">Cargando grupos...</div>
                ) : groups.map((group: Group) => (
                    <div key={group.id} className="w-full bg-white rounded-3xl p-4 shadow-lg flex items-center justify-between group-card">

                        <div className="flex-1 px-4 text-center">
                            <h3 className="font-bold text-lg leading-none">{group.name}</h3>
                            <p className="text-xs text-slate-400 mt-1">{group.passengers?.length || 0} Pasajeros</p>
                        </div>

                        {/* Add Button */}
                        <button
                            onClick={() => onAddGroup(group.id)}
                            className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all"
                        >
                            <span className="material-symbols-outlined">add</span>
                        </button>
                    </div>
                ))}

                {/* Placeholder for creating new groups if needed */}
                <button
                    className="w-full py-4 rounded-3xl border-2 border-dashed border-black/20 text-black/40 font-bold hover:bg-black/5 transition-colors"
                    onClick={() => {
                        const name = prompt("Nombre del nuevo grupo:");
                        if (name) {
                            const newGroup = { id: Date.now().toString(), name, is_active: false, passengers: [] };
                            const updated = [...groups, newGroup];
                            setGroups(updated);
                            localStorage.setItem('transport_groups', JSON.stringify(updated));
                        }
                    }}
                >
                    + CREAR NUEVO GRUPO
                </button>
            </main>

            <footer className="w-full max-w-sm pb-4 pt-6 z-10">
                <button
                    onClick={onBack}
                    className="w-full bg-white/20 backdrop-blur-md border border-black/10 py-4 rounded-2xl text-slate-900 font-bold tracking-widest text-sm hover:bg-white/40 active:scale-[0.98] transition-all"
                >
                    VOLVER ATRÁS
                </button>
            </footer>
        </div>
    );
};

export default PassengerGroups;
