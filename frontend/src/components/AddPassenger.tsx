import { useState, useEffect } from 'react';
import { API_URL } from '../config';

interface Passenger {
    name: string;
    is_on_board: boolean;
}

interface ComponentProps {
    onBack: () => void;
    groupId: string | null;
}

const AddPassenger = ({ onBack, groupId }: ComponentProps) => {
    const [passengers, setPassengers] = useState<Passenger[]>([]);
    const [loading, setLoading] = useState(true);

    const busId = 'NB-2026';

    const fetchPassengers = async () => {
        if (!groupId) return;
        try {
            const res = await fetch(`${API_URL}/groups/${busId}`);
            if (res.ok) {
                const groups = await res.json();
                const group = groups.find((g: { id: string }) => g.id === groupId);
                if (group) setPassengers(group.passengers || []);
            }
        } catch (err) {
            console.error('Error fetching passengers:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPassengers();
    }, [groupId]);

    const addPassenger = async () => {
        const name = prompt("Nombre del pasajero:");
        if (!name || !groupId) return;

        try {
            const res = await fetch(`${API_URL}/passengers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId, name })
            });
            if (res.ok) {
                // Fetch again to ensure sync with DB, or optimistically add
                setPassengers([...passengers, { name, is_on_board: false }]);
            }
        } catch (err) {
            console.error('Error adding passenger:', err);
        }
    };

    const removePassenger = async (name: string) => {
        if (!confirm(`¿Eliminar a ${name}?`)) return;
        if (!groupId) return;

        try {
            const res = await fetch(`${API_URL}/passengers`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId, name })
            });
            if (res.ok) {
                setPassengers(passengers.filter((p: Passenger) => p.name !== name));
            }
        } catch (err) {
            console.error('Error removing passenger:', err);
        }
    };

    const togglePassenger = async (name: string, currentStatus: boolean) => {
        if (!groupId) return;
        const nextStatus = !currentStatus;

        // Optimistic update
        setPassengers(passengers.map((p: Passenger) => p.name === name ? { ...p, is_on_board: nextStatus } : p));

        try {
            await fetch(`${API_URL}/passengers/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId, name, is_on_board: nextStatus })
            });
        } catch (err) {
            console.error('Error toggling passenger:', err);
            fetchPassengers(); // Revert on error
        }
    };

    const turnOffAll = async () => {
        if (!groupId) return;
        if (!confirm('¿Apagar todos los interruptores?')) return;

        // Optimistic update
        setPassengers(passengers.map((p: Passenger) => ({ ...p, is_on_board: false })));

        try {
            await fetch(`${API_URL}/passengers/turn-off-all`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId })
            });
        } catch (err) {
            console.error('Error turning off all passengers:', err);
            fetchPassengers(); // Revert on error
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-between p-6 text-slate-900 relative">
            <header className="w-full max-w-sm text-center mb-8 z-10 pt-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
                    Viajeros
                </h1>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">
                    GESTIÓN
                </p>
            </header>

            <main className="w-full max-w-sm flex-1 z-10 grid grid-cols-2 gap-4 auto-rows-min content-start pb-4">
                {/* Existing Passengers */}
                {loading ? (
                    <div className="col-span-2 text-center py-10 opacity-50">Cargando...</div>
                ) : passengers.map((p: Passenger, idx: number) => (
                    <div
                        key={idx}
                        className="w-full aspect-square rounded-3xl bg-white text-slate-900 font-bold text-sm shadow-xl shadow-black/5 flex flex-col items-center justify-between p-3 relative"
                    >
                        {/* Delete Button (Top Right) */}
                        <button
                            onClick={() => removePassenger(p.name)}
                            className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>

                        <div className="flex flex-col items-center mt-2 flex-1 justify-center">
                            <span className="material-symbols-outlined text-3xl mb-1 text-slate-400">person</span>
                            <span className="truncate w-full text-center px-1">{p.name}</span>
                        </div>

                        {/* Toggle Switch */}
                        <button
                            onClick={() => togglePassenger(p.name, p.is_on_board)}
                            className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 flex items-center shrink-0 mt-2 mb-1 ${p.is_on_board ? 'bg-green-500' : 'bg-slate-200'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${p.is_on_board ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                ))}

                {/* Add Buttons (Slots) */}
                {/* Rendering a few empty slots to act as "Add" buttons, but just one always visible is enough */}
                <button
                    onClick={addPassenger}
                    className="w-full aspect-square rounded-3xl bg-white/40 border-2 border-dashed border-slate-900/10 text-slate-900/40 hover:bg-white hover:text-slate-900 hover:border-transparent transition-all duration-200 flex items-center justify-center"
                >
                    <span className="material-symbols-outlined text-4xl">add</span>
                </button>
            </main>

            <footer className="w-full max-w-sm pb-4 pt-4 z-10 space-y-3">
                {passengers.length > 0 && (
                    <button
                        onClick={turnOffAll}
                        className="w-full bg-red-50 border border-red-200 py-3 rounded-2xl text-red-600 font-bold tracking-widest text-xs hover:bg-red-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">power_settings_new</span>
                        APAGAR TODOS
                    </button>
                )}
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

export default AddPassenger;
